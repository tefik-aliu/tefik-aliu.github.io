const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
(async () => {
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || undefined});
 try {
  for (const lang of ['en','sv']) {
   const context=await browser.newContext();
   await context.addInitScript(() => Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedEmail=text}}}));
   const page=await context.newPage();
   await page.addInitScript(() => {
    window.initialLayoutShift = 0;
    new PerformanceObserver(list => {
     for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.initialLayoutShift += entry.value;
    }).observe({type:'layout-shift',buffered:true});
   });
   await page.goto(`${base}/index${lang==='sv'?'.sv':''}.html`, {waitUntil:'networkidle'});
   assert.ok(await page.evaluate(() => window.initialLayoutShift < .05), 'Initial content should remain stable');
   assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.webm')).length), 0);
   for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    for (const key of ['issuepilot','observability','linepulse']) {
     const button=page.locator(`[data-atlas="${key}"]`);
     await button.focus();await page.keyboard.press('Space');
     assert.equal(await button.getAttribute('aria-pressed'),'true');
     assert.equal(await page.locator('[data-atlas-panel]:visible').count(),1);
     assert.equal(await page.locator(`#atlas-${key}`).isVisible(),true);
     const href=await page.locator(`#atlas-${key} a`).getAttribute('href');
     assert.equal((await page.request.get(new URL(href,base).href)).status(),200);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} ${key} at ${width}`);
    }
   }
   await page.locator('.copy-email').click();
   assert.equal(await page.evaluate(()=>window.copiedEmail),'Tefik.aliu@gmail.com');
   assert.match(await page.locator('.copy-status').textContent(),/copied|kopierad/);
   await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('denied')}});
   await page.locator('.copy-email').click();
   assert.match(await page.locator('.copy-status').textContent(),/Select|Markera/);
   assert.equal(await page.locator('video[autoplay]').count(),0);
   assert.equal(await page.locator('video:not([preload="none"])').count(),0);
   await context.close();
  }
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await plain.newPage();await page.goto(`${base}/index.sv.html`);
  assert.equal(await page.locator('[data-atlas-panel]:visible').count(),3);
  assert.equal(await page.locator('.atlas-controls').isVisible(),false);
  assert.equal(await page.locator('.copy-email').isVisible(),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await plain.close();
  console.log('PASS: project selector in both languages at 4 widths; keyboard activation, destination links, clipboard success/failure, media loading and no-JS fallback.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
