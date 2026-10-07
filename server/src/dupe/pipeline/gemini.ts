import { GoogleGenAI } from '@google/genai';
import categories from '../utils/categories.json';
import { safelyParseGeminiJson } from '../utils/format.ts';
import { ProductDetails, DupeAnalysis, TargetAnalysis } from '../types';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in the environment');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';

export async function analyzeDupePage(scrapedPage: ProductDetails): Promise<DupeAnalysis> {
  const prompt = `
    You are a fragrance analysis expert.
    Given this text from a page containing a fragrance below (and potential image link),
    do three things and respond STRICTLY in JSON format:

    1. Write a concise 2 to 3 sentence product description that could be used on a product page.
    2. Standardize and extract the price (just the numerical value). If no price is found, set the "price" value to null.
    3. Standardize and extract the exact full link to the product image from either the text or the candidate image link, choosing whichever is more likly to be the
    core product image. If no image link is found, set the "image" value to null.

    Your ENTIRE response MUST be a valid JSON object with the following keys: "copy", "price", and "image" that can be passed as a valid input to JSON.parse(). Do not include any other text or formatting outside of this JSON object.

    Fragrance page: ${scrapedPage.text}
    Candidate image: ${scrapedPage.image}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseSchema: {
        type: 'object',
        properties: {
          copy: {type: 'string'},
          price: {type: ['string', 'number', 'null']},
          image: {type: ['string', 'null']},
        },
        required: ['copy', 'price', 'image'],
      },
    },
  });
  const text = JSON.parse(response.text ?? '{}');
  console.log("dupe", text);
  try {
    const parsed = JSON.parse(text);
    if (!parsed.copy || !parsed.price || !parsed.image) {
      throw new Error('Missing expected keys in Gemini response');
    }
    return parsed;
  } catch (err) {
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonStartIndex < jsonEndIndex) {
      const potentialJson = text.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        const parsed = JSON.parse(potentialJson);
        if (!parsed.copy || !parsed.price || !parsed.image) {
          throw new Error('Missing expected keys in Gemini response (attempt 2)');
        }
        return parsed;
      } catch (secondErr) {
        throw new Error('Invalid JSON returned from Gemini (after extraction)');
      }
    } else {
      const parsed = safelyParseGeminiJson(text);
      return parsed;
    }
  }
}

export async function analyzeFragranceWithGemini(
  scrapedData: ProductDetails
): Promise<TargetAnalysis> {

  const prompt = `
    You are a fragrance analysis expert.
    Given the following fragrance information, do five things and respond STRICTLY in JSON format:

    1. Standardize and extract the name of the fragrance.
    2. Categorize it strictly as exactly one of the following: ${categories.join(', ')}.
    3. Write a concise 2 to 3 sentence product description that could be used on a product page. 
    4. Standardize and extract the price (just the numerical value). If no price is found, set the "price" value to null.
    5. Standardize and extract the exact full link to the image. If no image link is found, set the "image" value to null.

    Your ENTIRE response MUST be a valid JSON object with the following keys: "name", "category", "copy", "price", and "image" that can be passed as a valid input to JSON.parse(). Do not include any other text or formatting outside of this JSON object.

    (potentially malformed)Fragrance Info:
    Name: ${scrapedData.name}
    Description: ${scrapedData.text}
    Image: ${scrapedData.image}
    Price: ${scrapedData.price}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          copy: { type: 'string' },
          price: { type: ['string', 'number', 'null'] },
          image: { type: ['string', 'null'] },
        },
        required: ['name', 'category', 'copy', 'price', 'image'],
      },
    },
  });
  const text = JSON.parse(response.text ?? '{}');
  console.log("dupe", text);
  try {
    const parsed = JSON.parse(text);
    if (!parsed.name || !parsed.category || !parsed.copy || !parsed.price || !parsed.image) {
      throw new Error('Missing expected keys in Gemini response');
    }
    return parsed;
  } catch (err) {
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonStartIndex < jsonEndIndex) {
      const potentialJson = text.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        const parsed = JSON.parse(potentialJson);
        if (!parsed.name || !parsed.category || !parsed.copy || !parsed.price || !parsed.image) {
          throw new Error('Missing expected keys in Gemini response (attempt 2)');
        }
        return parsed;
      } catch (secondErr) {
        throw new Error('Invalid JSON returned from Gemini (after extraction)');
      }
    } else {
      const parsed = safelyParseGeminiJson(text);
      return parsed;
    }
  }
}
