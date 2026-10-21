import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/PARAG PANDE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('http://127.0.0.1:3000/opportunities?deal=opp-001');
    await page.getByRole('heading', { name: 'Aster Manufacturing', exact: true }).waitFor();
    const before = await page.evaluate(() => ({
      scroll: scrollY,
      back: document.querySelector('.deal-top').getBoundingClientRect().top,
      tabs: document.querySelector('.deal-tabs').getBoundingClientRect().top,
    }));
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForFunction(() => scrollY >= 650);
    const after = await page.evaluate(() => ({
      scroll: scrollY,
      back: document.querySelector('.deal-top').getBoundingClientRect().top,
      tabs: document.querySelector('.deal-tabs').getBoundingClientRect().top,
    }));
    const delta = after.scroll - before.scroll;
    assert.ok(Math.abs((before.back - after.back) - delta) < 2, `Back bar must scroll with content at ${width}px`);
    assert.ok(Math.abs((before.tabs - after.tabs) - delta) < 2, `Tab bar must scroll with content at ${width}px`);
  }
  console.log('PASS: back bar and tab bar scroll with content on desktop and mobile');
} finally { await browser.close(); }
