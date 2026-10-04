import { GoogleGenerativeAI } from '@google/generative-ai';
import { categories } from './categories.js';
import { safelyParseGeminiJson } from './format.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel(
  { model: 'gemini-2.5-pro-preview-03-25' },
  { apiVersion: 'v1beta' }
);

export async function analyzeDupePage(scrapedHtml) {
  const prompt = `
    You are a fragrance marketing expert.
    Given this text from a page containing a fragrance below,
    do three things and respond STRICTLY in JSON format:

    1. Write a concise 2–3 sentence product description that could be used on a product page. If a price is provided, you may include it in the copy if it makes sense.
    2. Standardize and extract the price (just the numerical value). If no price is found, set the "price" value to null.
    3. Standardize and extract the exact full link to the image. If no image link is found, set the "image" value to null.

    Your ENTIRE response MUST be a valid JSON object with the following keys: "copy", "price", and "image" that can be passed as a valid input to JSON.parse(). Do not include any other text or formatting outside of this JSON object.

    Fragrance page: ${scrapedHtml}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
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
/**
 * Analyze scraped fragrance data using Gemini to get:
 * - Standardized name
 * - One of: masculine or feminine
 * - Marketing copy for the fragrance (2–3 sentence)
 * @param {{ name: string, description: string, image?: string, price?: string }} scrapedData
 * @returns {Promise<{ name: string, category: string, copy: string }>}
 */
export async function analyzeFragranceWithGemini(scrapedData) {
  if (!scrapedData?.description) {
    throw new Error('Missing fragrance description');
  }

  const prompt = `
    You are a fragrance marketing expert.
    Given the following fragrance information, do five things and respond STRICTLY in JSON format:

    1. Standardize and extract the name of the fragrance.
    2. Categorize it strictly as exactly one of the following: ${categories}.
    3. Write a concise 2–3 sentence product description that could be used on a product page. If a price is provided, you may include it in the copy if it makes sense.
    4. Standardize and extract the price (just the numerical value). If no price is found, set the "price" value to null.
    5. Standardize and extract the exact full link to the image. If no image link is found, set the "image" value to null.

    Your ENTIRE response MUST be a valid JSON object with the following keys: "name", "category", "copy", "price", and "image" that can be passed as a valid input to JSON.parse(). Do not include any other text or formatting outside of this JSON object.

    Fragrance Info:
    Name: ${scrapedData.name || 'Unknown'}
    Description: ${scrapedData.description}
    Image: ${scrapedData.image || 'None'}
    Price: ${scrapedData.price || 'Unknown'}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
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
