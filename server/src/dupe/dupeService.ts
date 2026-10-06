import { findExactDupe, findCategoryDupe } from './query.ts';
import { scrapeProductDetails, scrapeDupe } from './pipeline/scraper.ts';
import { analyzeFragranceWithGemini, analyzeDupePage } from './pipeline/gemini.ts';
import {
  DupeAnalysis,
  DupePage,
  DupeResult,
  FindDupesResponse,
  HttpError,
  LLMResult,
  ProductDetails,
} from './types';

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
  if (!scraped.name || !scraped.description) {
    throw new HttpError(422, 'Page does not appear to describe a fragrance');
  }

  let LLMresult: LLMResult;
  try {
    LLMresult = await analyzeFragranceWithGemini({
      name: scraped.name,
      description: scraped.description,
      image: scraped.image,
      price: scraped.price,
    });
  } catch (err) {
    console.error('LLM failure:', err);
    throw new HttpError(500, 'LLM analysis failed');
  }

  let dupeResult: DupeResult | null | undefined = await findExactDupe(LLMresult.name);
  if (!dupeResult) {
    dupeResult = await findCategoryDupe(LLMresult.category);
    console.log('dupeResult', dupeResult);
  }

  let dupeScraped: DupePage | undefined;
  let dupeAnalysis: DupeAnalysis | undefined;
  if (dupeResult?.dupelink) {
    dupeScraped = await scrapeDupe(dupeResult.dupelink);
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
    dupeName: dupeResult?.dupe ?? undefined,
    dupeCategory: dupeResult?.category ?? undefined,
    dupeLink: dupeResult?.dupelink ?? undefined,
    dupeBrand: dupeResult?.dupebrand ?? undefined,
    dupeCopy: dupeAnalysis?.copy,
    dupeImage: dupeAnalysis?.image,
    dupePrice: dupeAnalysis?.price,
  };
}