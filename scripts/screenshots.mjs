// Client screenshots of the live site. Run: node scripts/screenshots.mjs
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

const URL = process.env.URL ?? "https://orlea-demo.vercel.app";
const OUT = "_screenshots";
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const HIDE = `[data-sonner-toaster], [data-sonner-toast], vercel-live-feedback, #vercel-live-feedback,
  [id*="demo" i], [class*="demo-banner" i] { display: none !important; }`;

mkdirSync(OUT, { recursive: true });

async function open(browser, device, extra = {}) {
  const context = await browser.newContext({ ...device, ...extra });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  // Force lazy images to load so every shot (and the full-page one) has them.
  await page.evaluate(() => document.querySelectorAll("img").forEach((i) => (i.loading = "eager")));
  await settle(page);
  return { context, page };
}

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
}

// Document-space positions read from the real DOM.
const layout = (page) =>
  page.evaluate(() => {
    const y = (el) => el.getBoundingClientRect().top + scrollY;
    const hero = document.querySelector("section[data-hero]");
    const [collier, bracelet] = [...document.querySelectorAll("article")];
    const form = document.querySelector("#commande form");
    // Centered, or top-aligned when the block is taller than the viewport (mobile).
    const center = (el) => Math.min(y(el) + el.offsetHeight / 2 - innerHeight / 2, y(el) - 24);
    const heroScroll = hero.offsetHeight - innerHeight; // sticky scene progress 0 → 1
    return {
      heroTop: y(hero),
      heroScroll,
      collier: center(collier),
      bracelet: center(bracelet),
      // Desktop (2 columns): title + cards + filled summary. Mobile: bottom of the form (summary + button).
      order: innerWidth >= 768 ? y(form) - 32 : y(form) + form.offsetHeight + 40 - innerHeight,
      sectionsTop: y(collier.closest("section")),
    };
  });

async function shot(page, name, top) {
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), Math.round(top));
  await page.waitForTimeout(600);
  await settle(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

async function capture(browser, label, device) {
  const { context, page } = await open(browser, device);
  let L = await layout(page);
  await shot(page, `${label}-01-hero-closed`, L.heroTop);
  await shot(page, `${label}-02-hero-opening`, L.heroTop + L.heroScroll * 0.3);
  await shot(page, `${label}-03-hero-logo`, L.heroTop + L.heroScroll);
  await shot(page, `${label}-04-products-collier`, L.collier);
  await shot(page, `${label}-05-products-bracelet`, L.bracelet);

  for (const card of await page.locator("#commande label:has(input[type=checkbox])").all()) await card.click();
  await page.selectOption("#wilaya", "Alger");
  await page.locator("#commande label:has(input[value=domicile])").click();
  L = await layout(page); // form grew (quantity steppers)
  await shot(page, `${label}-06-order-form`, L.order);

  // Below the hero, products → footer. Scrolled to the bottom so the floating CTA is hidden.
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(600);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({
    path: `${OUT}/${label}-full-sections.png`,
    fullPage: true,
    clip: { x: 0, y: L.sectionsTop, width: device.viewport.width, height: height - L.sectionsTop },
  });
  await context.close();
}

async function video(browser) {
  const dir = `${tmpdir()}/orlea-video`;
  const { context, page } = await open(browser, MOBILE, { recordVideo: { dir, size: MOBILE.viewport } });
  const L = await layout(page);
  await page.waitForTimeout(800);
  await page.evaluate(async ([heroEnd, order]) => {
    const glide = (from, to, ms) =>
      new Promise((done) => {
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / ms);
          window.scrollTo({ top: from + (to - from) * (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2), behavior: "instant" });
          t < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      });
    await glide(0, heroEnd, 6000);
    await new Promise((r) => setTimeout(r, 700));
    await glide(heroEnd, order, 5000);
    await new Promise((r) => setTimeout(r, 1000));
  }, [L.heroTop + L.heroScroll, L.order]);
  await context.close();
  await page.video().saveAs(`${OUT}/mobile-scroll.webm`);
  rmSync(dir, { recursive: true, force: true });
}

const browser = await chromium.launch();
await capture(browser, "mobile", MOBILE);
await capture(browser, "desktop", DESKTOP);
await video(browser);
await browser.close();
console.log(`Done → ${OUT}/`);
