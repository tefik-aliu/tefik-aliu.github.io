// Optional development check; Playwright is not a site runtime dependency.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4173";
const pages = [
  "index.html",
  "linepulse.html",
  "service-observability-lab.html",
  "qa-evidence-lab.html",
  "release-rescue.html",
  "404.html",
];
pages.push(...pages.map(file => file.replace(".html", ".sv.html")));
const widths = [360, 390, 768, 1024, 1440, 1920];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_CHANNEL
      ? { channel: process.env.BROWSER_CHANNEL }
      : {}),
  });
  const failures = [];
  const audit = [];
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") failures.push(message.text());
      });
      for (const file of pages) {
        const response = await page.goto(`${baseURL}/${file}`);
        assert.equal(response.status(), 200, file);
        const state = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          h1: document.querySelectorAll("h1").length,
          emptyLinks: [...document.querySelectorAll("a")].filter(
            (a) => !a.textContent.trim() && !a.getAttribute("aria-label"),
          ).length,
          brokenImages: [...document.images].filter(
            (i) => !i.complete || i.naturalWidth === 0,
          ).length,
          title: document.title,
        }));
        assert.ok(
          state.scroll <= state.width + 1,
          `${file} at ${width}: overflow ${state.scroll}`,
        );
        assert.equal(state.h1, 1);
        assert.equal(state.emptyLinks, 0);
        assert.equal(state.brokenImages, 0);
        assert.ok(state.title.includes("Tefik Aliu"));
        // Catch text overlapping an adjacent grid cell even when the page itself fits.
        const collisions = await page.locator('.capability-row').evaluateAll(rows => rows.filter(row => {
          const range = document.createRange();
          range.selectNodeContents(row.querySelector('h3'));
          return range.getBoundingClientRect().right > row.querySelector('div').getBoundingClientRect().left - 4;
        }).length);
        assert.equal(collisions, 0, `${file} at ${width}: capability text overlap`);
        if (process.env.AXE_PATH) {
          await page.addScriptTag({ path: process.env.AXE_PATH });
          const results = await page.evaluate(async () => {
            const result = await axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            });
            return result.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => n.target),
            }));
          });
          if (results.length)
            failures.push({ file, width, accessibility: results });
        }
        audit.push({ file, width, status: "passed" });
      }
      await page.close();
    }

    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await page.goto(`${baseURL}/index.html`);
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.className),
      "skip-link",
    );
    await page.keyboard.press("Enter");
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    assert.equal(await menu.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    assert.equal(
      await page.evaluate(() => document.activeElement.className),
      "menu-button",
    );
    await menu.click();
    await page
      .locator("#site-nav")
      .getByRole("link", { name: "Work", exact: true })
      .click();
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "projects",
    );
    await page.goto(`${baseURL}/qa-evidence-lab.html`);
    for (const [severity, expected] of [
      ["high", 2],
      ["blocker", 1],
      ["medium", 2],
      ["low", 1],
      ["all", 6],
    ]) {
      await page.locator(`[data-filter="${severity}"]`).click();
      assert.equal(
        await page.locator(".finding-detail:not([hidden])").count(),
        expected,
      );
      assert.equal(
        await page
          .locator(`[data-filter="${severity}"]`)
          .getAttribute("aria-pressed"),
        "true",
      );
    }
    await page.locator(".finding-detail summary").first().press("Enter");
    assert.equal(await page.locator(".finding-detail[open]").count(), 1);
    await page.close();

    const noJS = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 360, height: 800 },
    });
    const plain = await noJS.newPage();
    for (const file of pages) {
      await plain.goto(`${baseURL}/${file}`);
      assert.ok(
        await plain.locator("h1").isVisible(),
        `No-JS heading: ${file}`,
      );
      assert.ok(await plain.locator("main").isVisible(), `No-JS main: ${file}`);
      if (!file.startsWith("404"))
        assert.ok(
          await plain.locator("#site-nav").isVisible(),
          `No-JS nav: ${file}`,
        );
    }
    await plain.goto(`${baseURL}/qa-evidence-lab.html`);
    assert.equal(await plain.locator(".finding-detail").count(), 6);
    assert.equal(await plain.locator(".findings-toolbar").isVisible(), false);
    await plain.locator(".finding-detail summary").first().click();
    assert.equal(await plain.locator(".finding-detail[open]").count(), 1);
    await noJS.close();

    const reduced = await browser.newContext({ reducedMotion: "reduce" });
    const still = await reduced.newPage();
    await still.goto(`${baseURL}/index.html`);
    assert.equal(
      await still.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
      "auto",
    );
    assert.equal(
      await still
        .locator(".button")
        .first()
        .evaluate((el) => getComputedStyle(el).transitionDuration),
      "0s",
    );
    await reduced.close();

    assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
    console.log(
      `PASS: ${audit.length} page/viewport checks; menu, keyboard, filters, disclosures, no-JS and reduced motion.`,
    );
    if (process.env.AXE_PATH)
      console.log(
        "PASS: axe WCAG A/AA/2.1 AA on all page/viewport combinations.",
      );
    if (process.env.REPORT_PATH)
      fs.writeFileSync(
        process.env.REPORT_PATH,
        JSON.stringify({ audit, failures }, null, 2),
      );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
