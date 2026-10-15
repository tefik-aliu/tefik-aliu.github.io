// Regenerate the homepage sharing images with: node scripts/generate-social-previews.cjs
// Development-only dependency: Playwright and its Chromium browser.
// Match the site's warm paper palette; no network requests, external fonts or AI assets.
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

const copy = {
  en: {
    role: "Software & web development",
    scope: "Web applications · APIs · Data & automation",
    proof: "Independent projects · Inspectable code",
  },
  sv: {
    role: "Mjukvaru- & webbutveckling",
    scope: "Webbapplikationer · API:er · Data & automation",
    proof: "Egna projekt · Granskbar kod",
  },
};

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function markup(language) {
  const text = Object.fromEntries(Object.entries(copy[language]).map(([key, value]) => [key, escapeHtml(value)]));
  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8">
    <title>Tefik Aliu — ${text.role}</title>
    <style>
      * { box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; margin: 0; }
      body {
        background: #f5f2eb;
        color: #25312f;
        font-family: "Segoe UI", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      main { height: 100%; padding: 62px 70px 58px; }
      header, footer { display: flex; align-items: center; justify-content: space-between; }
      header { height: 52px; padding-bottom: 25px; border-bottom: 1px solid #cdcfc5; }
      .role { font-size: 22px; font-weight: 400; }
      .url { color: #56625f; font-size: 19px; }
      h1 { margin: 45px 0 28px; font-family: Georgia, "Times New Roman", serif; font-size: 126px; font-weight: 400; line-height: 1.1; letter-spacing: -6px; }
      .scope { margin: 0; font-size: 33px; line-height: 1.4; letter-spacing: -.45px; }
      .stack { margin: 20px 0 0; color: #27564e; font-size: 24px; line-height: 1.4; }
      footer { margin-top: 60px; padding-top: 25px; border-top: 1px solid #cdcfc5; font-size: 19px; color: #56625f; }
      .marker { color: #27564e; font: 16px/1.4 Consolas, "Liberation Mono", monospace; letter-spacing: 2px; }
    </style>
  </head>
  <body>
    <main>
      <header><span class="role">${text.role}</span><span class="url">tefik-aliu.github.io</span></header>
      <h1>Tefik Aliu</h1>
      <p class="scope">${text.scope}</p>
      <p class="stack">Python · JavaScript / TypeScript · SQL</p>
      <footer><span>${text.proof}</span><span class="marker" aria-hidden="true">&lt;/&gt;</span></footer>
    </main>
  </body>
</html>`;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}),
    ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    // Deliberately prohibit remote resources so regeneration is self-contained.
    await page.route("**/*", route => route.abort());
    for (const language of Object.keys(copy)) {
      await page.setContent(markup(language));
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        clipped: [...document.querySelectorAll("header span, h1, p, footer span")].some(element => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const box = range.getBoundingClientRect();
          return box.left < 60 || box.right > 1140 || box.top < 0 || box.bottom > 600;
        }),
      }));
      assert.deepEqual(layout, { width: 1200, height: 630, clipped: false }, `${language}: unexpected card layout`);
      const destination = path.join(__dirname, `../assets/social-software-${language}.png`);
      await page.screenshot({ path: destination, type: "png" });
      console.log(`Generated ${path.relative(path.join(__dirname, ".."), destination)} (1200 × 630)`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
