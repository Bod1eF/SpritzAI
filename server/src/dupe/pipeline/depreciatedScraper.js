import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeDupe(url) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/122.0.0.0 Safari/537.36'
    );

    // Intercept and block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to the URL and wait for the network to be idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 });

    // Extract a portion of the page's text content
    const scraped = await page.evaluate(() => {
      const getMeta = (name) => {
        const meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        return meta?.content || '';
      };
      const section = document.querySelector('main, .product-info, .description, body');
      const text = section?.innerText?.slice(0, 8000) || '';
    
      const image =
      document.querySelector('img[src*="product" i]')?.src ||
      getMeta('og:image') ||
      '';

      return text + image;
    })

    console.log(scraped.slice(0, 100));
    return scraped;

  } catch (err) {
    console.error('Error in scrapeDupe:', err.message);
    throw new Error('Failed to scrape dupe page');
  } finally {
    if (browser) await browser.close();
  }
}

export async function scrapeProductDetails(url) {
  console.log(url);
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ]
    });

    const page = await browser.newPage();

    // Mask headless detection
    await page.evaluateOnNewDocument(() => {
      // Pass the Webdriver test
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Fake browser language
      Object.defineProperty(navigator, 'language', {
        get: () => 'en-US',
      });

      // Fake plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4],
      });

      // Fake Chrome object
      window.chrome = {
        runtime: {},
        loadTimes: () => {},
        csi: () => {},
      };
    });

    // Use a real browser user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/122.0.0.0 Safari/537.36'
    );

    // Intercept and block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Scrape key info (same as before)...
    const data = await page.evaluate(() => {
      const getMeta = (name) => {
        const meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        return meta?.content || '';
      };

      const name =
        document.querySelector('h1')?.innerText?.trim() ||
        getMeta('og:title') ||
        document.title;

      const image =
        document.querySelector('img[src*="product" i]')?.src ||
        getMeta('og:image') ||
        '';

      const contentSelectors = [
        '#description', '.product-description', '.description',
        '.product-info', '.details', '.product-details', 'section'
      ];

      const seen = new Set();
      let longDescription = getMeta('description');

      for (const selector of contentSelectors) {
        const section = document.querySelector(selector);
        if (section) {
          const paragraphs = section.querySelectorAll('p');
          for (const p of paragraphs) {
            const text = p.innerText?.trim();
            if (text && !seen.has(text) && text.length > 50) {
              seen.add(text);
              longDescription += '\n\n' + text;
              if (longDescription.length > 1500) break;
            }
          }
        }
        if (longDescription.length > 1500) break;
      }

      const priceCandidates = Array.from(document.querySelectorAll('body *'))
      .map(el => el.innerText)
      .filter(text => text && /\$\s?\d{1,4}(?:\.\d{2})?/.test(text) || /USD\s?\d{1,4}/.test(text));

      const price = priceCandidates.length > 0 ? priceCandidates[0].trim() : '';

      return {
        name,
        image,
        description: longDescription.trim(),
        price
      };
    });

    return data;
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw new Error('Unable to scrape product details');
  } finally {
    if (browser) await browser.close();
  }
}
