const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || undefined});
 try {
  for(const language of ['en','sv']) {
   const page=await browser.newPage({viewport:{width:390,height:844}});
   await page.goto(`${base}/linepulse${language==='sv'?'.sv':''}.html`,{waitUntil:'networkidle'});
   assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.webm')).length),0);
   const video=page.locator('#demo video');
   await video.evaluate(async v=>{v.load();await new Promise((resolve,reject)=>{v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',reject,{once:true})});await v.play()});
   await page.waitForFunction(()=>document.querySelector('#demo video').currentTime>.2);
   const state=await video.evaluate(v=>{v.pause();return{duration:v.duration,language:v.textTracks[0].language,cues:v.textTracks[0].cues.length}});
   assert.ok(state.duration>=20&&state.duration<=30);
   assert.equal(state.language,language);assert.equal(state.cues,4);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const response=await page.request.get(`${base}/assets/linepulse-evidence.json`);
   assert.equal(response.status(),200);
   const evidence=await response.json();assert.equal(evidence.pressure_alert.code,'PRESSURE_DRIFT');
   assert.equal(evidence.result.scrap_rate_percent,100*evidence.result.reject_units/(evidence.result.good_units+evidence.result.reject_units));
   assert.equal((await page.request.get(`${base}/scripts/reproduce-linepulse-evidence.py`)).status(),200);
   await page.close();
  }
  console.log('PASS: both LinePulse language pages; video playback and duration, caption loading, no initial media download, mobile layout and reproducible evidence downloads.');
 } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
