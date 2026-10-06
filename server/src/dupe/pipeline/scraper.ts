import { getBrowser, USER_AGENT, BLOCKED_RESOURCES } from './browser';
import { ProductDetails, DupePage, ScrapedPage } from '../types';
// types.ts: add `structured: boolean` to ScrapedPage (and to ProductDetails if you want callers to see it)

// Runs inside the page, so it must be self-contained (no outer-scope references).
function extractFromPage(): ScrapedPage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type LD = Record<string, any>;

  const asArray = <T>(x: T | T[] | null | undefined): T[] =>
    x == null ? [] : Array.isArray(x) ? x : [x];

  const meta = (key: string): string =>
    document
      .querySelector<HTMLMetaElement>(`meta[property="${key}"], meta[name="${key}"]`)
      ?.content?.trim() || '';

  const absolute = (u?: string): string => {
    try {
      return u ? new URL(u, location.href).href : '';
    } catch {
      return '';
    }
  };

  // ---------------------------------------------------------------------------
  // 1. Collect every Product / ProductGroup node from every JSON-LD block
  //    (old code stopped at the first block containing a Product)
  // ---------------------------------------------------------------------------
  const nodes: LD[] = [];
  const visit = (x: unknown) => {
    if (Array.isArray(x)) return x.forEach(visit);
    if (!x || typeof x !== 'object') return;
    nodes.push(x as LD);
    visit((x as LD)['@graph']);
  };
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      visit(JSON.parse(script.textContent ?? ''));
    } catch {
      /* ignore malformed JSON-LD */
    }
  }

  const candidates = nodes.filter((n) =>
    asArray<string>(n?.['@type']).some((t) => t === 'Product' || t === 'ProductGroup')
  );

  // 2. Pick the candidate that best matches what the page itself says it is about
  const tokens = (s: string) =>
    new Set(s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 2));
  const pageTitle = tokens(
    meta('og:title') || document.querySelector('h1')?.innerText || document.title
  );
  const score = (n: LD) => {
    const t = tokens(String(n.name ?? ''));
    const overlap = t.size ? [...t].filter((x) => pageTitle.has(x)).length / t.size : 0;
    return overlap + (n.offers || n.hasVariant ? 0.5 : 0);
  };
  const product: LD = [...candidates].sort((a, b) => score(b) - score(a))[0] ?? {};
  const firstVariant: LD | undefined = asArray<LD>(product.hasVariant)[0];

  const root: HTMLElement = document.querySelector('main') ?? document.body;

  // ---------------------------------------------------------------------------
  // Name
  // ---------------------------------------------------------------------------
  const name: string =
    product.name ||
    document.querySelector('h1')?.innerText?.trim() ||
    meta('og:title') ||
    document.title;

  // ---------------------------------------------------------------------------
  // Image (a string, an array, or an object with a url; groups may keep it on variants)
  // ---------------------------------------------------------------------------
  const firstImage = (n?: LD): string | undefined => {
    const i = asArray<string | { url?: string }>(n?.image)[0];
    return typeof i === 'string' ? i : i?.url;
  };
  const image = absolute(
    firstImage(product) ||
      meta('og:image') ||
      firstImage(firstVariant) ||
      document.querySelector<HTMLImageElement>('img[src*="product" i]')?.src
  );

  // ---------------------------------------------------------------------------
  // Description: structured/meta summary + substantial paragraphs, de-duplicated
  // ---------------------------------------------------------------------------
  const summary = String(product.description || meta('og:description') || meta('description'))
    .replace(/<[^>]+>/g, ' ') // some shops put raw HTML in JSON-LD descriptions
    .replace(/\s+/g, ' ')
    .trim();
  const paragraphs = [...root.querySelectorAll('p')]
    .map((p) => p.innerText.trim())
    .filter((t) => t.length > 80);
  const description = [...new Set([summary, ...paragraphs].filter(Boolean))]
    .join('\n\n')
    .slice(0, 1500);

  // ---------------------------------------------------------------------------
  // Price: offer (on the node, a variant, or nested in an AggregateOffer) -> meta tags
  //        -> price-looking text. Lowest-confidence field; the LLM sees `text` too.
  // ---------------------------------------------------------------------------
  const offer: LD | undefined =
    asArray<LD>(product.offers)[0] ??
    asArray<LD>(firstVariant?.offers)[0];
  const rawPrice =
    offer?.price ??
    offer?.lowPrice ??
    offer?.priceSpecification?.price ??
    asArray<LD>(offer?.offers)[0]?.price ??
    (meta('product:price:amount') || meta('og:price:amount'));
  const currency: string =
    offer?.priceCurrency || meta('product:price:currency') || meta('og:price:currency');

  const pricePattern = /(?:R\$|[$£€]|USD|GBP|EUR|AUD)\s?\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?/;
  const priceEl = root.querySelector<HTMLElement>('[class*="price" i]');
  const price = rawPrice
    ? `${currency ? currency + ' ' : ''}${rawPrice}`
    : (priceEl?.innerText.match(pricePattern)?.[0] ?? root.innerText.match(pricePattern)?.[0] ?? '');

  return {
    name,
    image,
    description,
    price,
    text: root.innerText.slice(0, 8000),
    structured: candidates.length > 0, // lets the caller decide whether the LLM fallback is needed
  };
}

async function scrapePage(url: string): Promise<ScrapedPage> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    locale: 'en-US',
    viewport: { width: 1366, height: 768 },
  });

  try {
    // abort network requests for unnecessary resources
    await context.route('**/*', (route) =>
      BLOCKED_RESOURCES.has(route.request().resourceType())
        ? route.abort()
        : route.continue()
    );

    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Bot walls / missing pages: fail loudly instead of sending a challenge page to the LLM
    const status = response?.status() ?? 0;
    if (status >= 400) throw new Error(`Page returned HTTP ${status}`);

    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});

    const result = await page.evaluate(extractFromPage);

    // No structured data and almost no text usually means a consent/challenge wall or empty shell
    if (!result.structured && result.text.length < 200) {
      throw new Error('Page had no usable content (blocked, empty, or still loading)');
    }
    return result;
  } catch (err) {
    console.error(`Scrape failed for ${url}:`, err instanceof Error ? err.message : err);
    throw new Error('Failed to scrape page', { cause: err });
  } finally {
    await context.close();
  }
}

export async function scrapeDupe(url: string): Promise<DupePage> {
  const { text, image } = await scrapePage(url);
  return { text, image };
}

export async function scrapeProductDetails(url: string): Promise<ProductDetails> {
  const { name, image, description, price, structured } = await scrapePage(url);
  return { name, image, description, price, structured };
}