import * as db from '../services/db.js';
import { scrapeProductDetails,  scrapeDupe} from '../services/scraper.js';
import { analyzeFragranceWithGemini, analyzeDupePage } from '../services/gemini.js';

export async function findDupes(req, res) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }
    let scraped;
    try {
      scraped = await scrapeProductDetails(url);
    } catch (err) {
      return res.status(404).json({ error: 'Failed to scrape the URL' });
    }
    if (!scraped.name || !scraped.description) {
      return res.status(422).json({ error: 'Page does not appear to describe a fragrance' });
    }

    let LLMresult;
    try {
      LLMresult = await analyzeFragranceWithGemini({
        name: scraped.name,
        description: scraped.description,
        image: scraped.image,
        price: scraped.price
      });
    } catch (err) {
      console.error('LLM failure:', err);
      return res.status(500).json({ error: 'LLM analysis failed' });
    }
    // let dbTest = await db.test();
    // return res.status(200).json({data: LLMresult, db: dbTest});
    let dupeResult = await db.findExactDupe(LLMresult.name);
    if (!dupeResult) {
      dupeResult = await db.findCategoryDupe(LLMresult.category);
      console.log("dupeResult", dupeResult);
    }
    let dupeScraped, dupeAnalysis;
    if (dupeResult.dupelink) {
        dupeScraped = await scrapeDupe(dupeResult.dupelink);
    }

    if(dupeScraped) {
      dupeAnalysis = await analyzeDupePage(dupeScraped);
    }
    res.status(200).json({
      targetName: LLMresult.name,
      targetCategory: LLMresult.category,
      targetCopy: LLMresult.copy,
      targetImage: LLMresult.image,
      targetPrice: LLMresult.price,
      dupeName: dupeResult?.dupe,
      dupeCategory: dupeResult?.category,
      dupeLink: dupeResult?.dupelink,
      dupeBrand: dupeResult?.dupebrand,
      dupeCopy: dupeAnalysis?.copy,
      dupeImage: dupeAnalysis?.image,
      dupePrice: dupeAnalysis?.price,
    });

  } catch (err) {
    console.error('Error in findDupes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
