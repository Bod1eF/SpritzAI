import { chromium, type Browser } from 'playwright';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

export const BLOCKED_RESOURCES = new Set(['image', 'font', 'media']);

let browserPromise: Promise<Browser> | null = null;

export function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({ args: ['--no-sandbox'] }) // --no-sandbox is for running as root in Docker
      .then((browser) => {
        browser.on('disconnected', () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

// Call on server shutdown (e.g. process.on('SIGTERM', closeBrowser))
export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close();
}