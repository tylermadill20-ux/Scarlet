/* Headless smoke test: loads index.html, runs a silent lip-sync read, and fails on any
   console error, page error, failed local request, or a mouth that never moves.
   Usage: node tests/smoke.js [path-or-url]   (set NODE_PATH to a folder containing playwright) */
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const target = process.argv[2] || 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const problems = [];
  for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 800 }]) {
    const page = await browser.newPage({ viewport: vp });
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|ERR_(INTERNET|NAME|CONNECTION|PROXY|TUNNEL)/.test(m.text())) problems.push(`[${vp.width}] console: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(`[${vp.width}] pageerror: ${e.message}`));
    page.on('requestfailed', (r) => { if (r.url().startsWith('file:')) problems.push(`[${vp.width}] failed load: ${r.url()}`); });
    await page.goto(target);
    await page.waitForSelector('#avatar svg, #avatar g');
    await page.check('#mute');
    await page.click('#play');
    const seen = new Set();
    for (let i = 0; i < 40; i++) { seen.add(await page.textContent('#vis')); await page.waitForTimeout(100); }
    if (seen.size < 4) problems.push(`[${vp.width}] mouth barely moved: ${[...seen].join(',')}`);
    const hl = await page.$$eval('#script .w.on, #script .w.done', (n) => n.length);
    if (hl < 3) problems.push(`[${vp.width}] word highlight not advancing`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) problems.push(`[${vp.width}] page scrolls horizontally`);
    await page.evaluate(() => window.postMessage({ type: 'scarlet:briefing', items: [{ id: 't1', text: 'Test item.' }] }, '*'));
    await page.waitForTimeout(300);
    await page.close();
  }
  await browser.close();
  if (problems.length) { console.error('FAIL\n' + problems.join('\n')); process.exit(1); }
  console.log('PASS: no errors, mouth moves, highlight advances, no horizontal scroll');
})().catch((e) => { console.error('FAIL (harness): ' + e.message); process.exit(2); });
