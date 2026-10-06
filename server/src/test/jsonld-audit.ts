/**
 * Audits how many product pages ship usable schema.org JSON-LD.
 *
 * Usage:
 *   npm i -D tsx            (Node 18+; Playwright only needed for --render)
 *   npx tsx jsonld-audit.ts urls.txt            # static HTML via fetch (what a "fetch first" tier sees)
 *   npx tsx jsonld-audit.ts urls.txt --render   # fully rendered DOM via Playwright (what your scraper sees)
 *
 * urls.txt: one product URL per line (blank lines and # comments ignored).
 * Run both modes: the gap between them is how much a fetch-only tier would miss.
 */
import { readFileSync } from 'node:fs';

type Node = Record<string, any>;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

const typesOf = (n: Node): string[] => ([] as string[]).concat(n?.['@type'] ?? []);

// Flatten arrays, @graph, and ProductGroup variants into one list of nodes
function flatten(json: unknown): Node[] {
  const out: Node[] = [];
  const visit = (x: any) => {
    if (Array.isArray(x)) return x.forEach(visit);
    if (!x || typeof x !== 'object') return;
    out.push(x);
    if (x['@graph']) visit(x['@graph']);
    if (x.hasVariant) visit(x.hasVariant);
  };
  visit(json);
  return out;
}

function extractJsonLd(html: string): { nodes: Node[]; blocks: number; parseErrors: number } {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const nodes: Node[] = [];
  let blocks = 0;
  let parseErrors = 0;
  for (const m of html.matchAll(re)) {
    blocks++;
    try {
      nodes.push(...flatten(JSON.parse(m[1].trim())));
    } catch {
      parseErrors++;
    }
  }
  return { nodes, blocks, parseErrors };
}

async function getHtml(url: string, render: boolean, browser: any): Promise<{ html: string; status: number }> {
  if (!render) {
    const res = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, 'accept-language': 'en-US,en;q=0.9' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    return { html: await res.text(), status: res.status };
  }
  const context = await browser.newContext({ userAgent: USER_AGENT, locale: 'en-US' });
  try {
    const page = await context.newPage();
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
    return { html: await page.content(), status: res?.status() ?? 0 };
  } finally {
    await context.close();
  }
}

const hasPrice = (p: Node): boolean =>
  ([] as Node[]).concat(p.offers ?? []).some((o) => o?.price ?? o?.lowPrice ?? o?.priceSpecification?.price);

async function main() {
  const [file, ...flags] = process.argv.slice(2);
  if (!file) throw new Error('Usage: tsx jsonld-audit.ts urls.txt [--render]');
  const render = flags.includes('--render');
  const urls = readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  const browser = render ? await (await import('playwright')).chromium.launch({ args: ['--no-sandbox'] }) : null;

  const rows: Record<string, string | number | boolean>[] = [];
  for (const url of urls) {
    const row: Record<string, string | number | boolean> = { host: new URL(url).hostname };
    try {
      const { html, status } = await getHtml(url, render, browser);
      const { nodes, blocks, parseErrors } = extractJsonLd(html);
      const products = nodes.filter((n) => typesOf(n).includes('Product'));
      const groups = nodes.filter((n) => typesOf(n).includes('ProductGroup'));
      // Groups hold the shared name/image/description; their variants (Products) usually hold price
      const best = groups[0] ?? products[0];
      Object.assign(row, {
        status,
        ldBlocks: blocks,
        parseErrors,
        Product: products.length,
        ProductGroup: groups.length,
        name: !!best?.name,
        image: !!best?.image,
        desc: !!best?.description,
        // For groups, price usually lives on the variants (Product nodes), so check any Product too
        price: products.some(hasPrice) || (best ? hasPrice(best) : false),
      });
    } catch (err) {
      row.error = err instanceof Error ? err.message : String(err);
    }
    rows.push(row);
    console.log(`checked ${url}`);
  }
  await browser?.close();

  console.log(`\nMode: ${render ? 'rendered (Playwright)' : 'static HTML (fetch)'}`);
  console.table(rows);

  const ok = rows.filter((r) => !r.error);
  const pct = (n: number) => `${n}/${ok.length} (${ok.length ? Math.round((100 * n) / ok.length) : 0}%)`;
  console.log('Fetched OK:             ', `${ok.length}/${rows.length}`);
  console.log('Any JSON-LD:            ', pct(ok.filter((r) => (r.ldBlocks as number) > 0).length));
  console.log('Product or ProductGroup:', pct(ok.filter((r) => (r.Product as number) + (r.ProductGroup as number) > 0).length));
  console.log('...with name+image+desc:', pct(ok.filter((r) => r.name && r.image && r.desc).length));
  console.log('...with a price:        ', pct(ok.filter((r) => r.price).length));
  console.log('Multiple Product nodes: ', pct(ok.filter((r) => (r.Product as number) > 1).length));
  console.log('Parse errors present:   ', pct(ok.filter((r) => (r.parseErrors as number) > 0).length));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});