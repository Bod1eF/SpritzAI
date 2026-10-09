import { GoogleGenAI } from '@google/genai';
import { ProductDetails, DupeAnalysis, TargetAnalysis } from '../types';
import { buildDupePrompt, buildFrangrancePrompt } from '../utils/prompts.ts';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in the environment');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';

export async function analyzeDupePage(scrapedPage: ProductDetails): Promise<DupeAnalysis> {
  const prompt = buildDupePrompt(scrapedPage.text, scrapedPage.image);
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
  console.log("Dupe Analysis: ", text);
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

export async function analyzeFragranceWithGemini(scrapedData: ProductDetails): Promise<TargetAnalysis> {
  const prompt = buildFrangrancePrompt(scrapedData.name, scrapedData.text, scrapedData.image, scrapedData.price);
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
  console.log("Fragrance Analysis: ", text);
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
