import { findExactDupe, findCategoryDupe } from './query.ts';
import { scrapeProductDetails } from './pipeline/scraper.ts';
import { analyzeFragranceWithGemini, analyzeDupePage } from './pipeline/gemini.ts';
import {
  Dupe,
  DupeAnalysis,
  FindDupesResponse,
  HttpError,
  TargetAnalysis,
  ProductDetails,
} from './types';

// to-do: add fast path with URL parsing + parralellize
export async function findDupes(url: unknown): Promise<FindDupesResponse> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    throw new HttpError(400, 'Invalid or missing URL');
  }

  let scraped: ProductDetails;
  try {
    scraped = await scrapeProductDetails(url);
  } catch (err) {
    throw new HttpError(404, 'Failed to scrape the URL');
  }
  if (!scraped.name || !scraped.text) {
    throw new HttpError(422, 'Page does not appear to describe a fragrance');
  }

  let LLMresult: TargetAnalysis;
  try {
    LLMresult = await analyzeFragranceWithGemini(scraped);
  } catch (err) {
    console.error('LLM failure:', err);
    throw new HttpError(500, 'LLM analysis failed');
  }

  let dupeResult: Dupe| null | undefined = await findExactDupe(LLMresult.name);
  if (!dupeResult) {
    dupeResult = await findCategoryDupe(LLMresult.category);
    console.log('dupeResult', dupeResult);
  }

  let dupeScraped:ProductDetails  | undefined;
  let dupeAnalysis: DupeAnalysis | undefined;
  if (dupeResult?.link) {
    dupeScraped = await scrapeProductDetails(dupeResult.link);
  }
  if (dupeScraped) {
    dupeAnalysis = await analyzeDupePage(dupeScraped);
  }

  return {
    targetName: LLMresult.name,
    targetCategory: LLMresult.category,
    targetCopy: LLMresult.copy,
    targetImage: LLMresult.image,
    targetPrice: LLMresult.price,
    dupeName: dupeResult?.name ?? undefined,
    dupeCategory: dupeResult?.category ?? undefined,
    dupeLink: dupeResult?.link ?? undefined,
    dupeBrand: dupeResult?.brand ?? undefined,
    dupeCopy: dupeAnalysis?.copy,
    dupeImage: dupeAnalysis?.image,
    dupePrice: dupeAnalysis?.price,
  };
}