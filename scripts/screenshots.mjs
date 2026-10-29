// Reel-quality captures (9:16, 1170x2079). Run: node scripts/screenshots.mjs
// Needs ffmpeg on PATH (or FFMPEG=path/to/ffmpeg).
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

const URL = process.env.URL ?? "https://orlea-demo.vercel.app";
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const OUT = "_screenshots";
const FPS = 30;
const DEVICE = { viewport: { width: 390, height: 693 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const HIDE = `[data-sonner-toaster], [data-sonner-toast], vercel-live-feedback, #vercel-live-feedback,
  [id*="demo" i], [class*="demo-banner" i] { display: none !important; }`;

mkdirSync(OUT, { recursive: true });

async function open(browser, device = DEVICE) {
  const context = await browser.newContext(device);
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
  // Every finite animation/transition (CSS + motion's WAAPI) done; infinite ambient loops ignored.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.effect?.getTiming().iterations === Infinity || a.playState !== "running"),
  );
}

// Document-space positions read from the real DOM.
const layout = (page) =>
  page.evaluate(() => {
    const y = (el) => el.getBoundingClientRect().top + scrollY;
    const hero = document.querySelector("section[data-hero]");
    const [collier, bracelet] = [...document.querySelectorAll("article")];
    const form = document.querySelector("#commande form");
    // Centered, or top-aligned when the block is taller than the viewport.
    const center = (el) => Math.min(y(el) + el.offsetHeight / 2 - innerHeight / 2, y(el) - 24);
    return {
      heroTop: y(hero),
      heroScroll: hero.offsetHeight - innerHeight, // sticky scene progress 0 → 1
      collier: center(collier),
      bracelet: center(bracelet),
      order: y(form) + form.offsetHeight + 40 - innerHeight, // bottom of the form (summary + button)
      sectionsTop: y(collier.closest("section")),
      formTop: y(form) - 24,
    };
  });

const scrollTo = (page, top) => page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), Math.round(top));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

async function shot(page, name, top) {
  await scrollTo(page, top);
  await page.waitForTimeout(600);
  await settle(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

async function capture(browser) {
  const { context, page } = await open(browser);
  let L = await layout(page);
  await shot(page, "mobile-01-hero-closed", L.heroTop);
  await shot(page, "mobile-02-hero-opening", L.heroTop + L.heroScroll * 0.3);
  await shot(page, "mobile-03-hero-logo", L.heroTop + L.heroScroll);
  await shot(page, "mobile-04-products-collier", L.collier);
  await shot(page, "mobile-05-products-bracelet", L.bracelet);

  for (const card of await page.locator("#commande label:has(input[type=checkbox])").all()) await card.click();
  await page.selectOption("#wilaya", "Alger");
  await page.locator("#commande label:has(input[value=domicile])").click();
  L = await layout(page); // form grew (quantity steppers)
  await shot(page, "mobile-06-order-form", L.order);

  // Below the hero, products → footer. Scrolled to the bottom so the floating CTA is hidden.
  await scrollTo(page, 1e6);
  await page.waitForTimeout(600);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({
    path: `${OUT}/mobile-full-sections.png`,
    fullPage: true,
    clip: { x: 0, y: L.sectionsTop, width: DEVICE.viewport.width, height: height - L.sectionsTop },
  });
  await context.close();
}

async function formCloseup(browser) {
  const { context, page } = await open(browser);
  await scrollTo(page, 1e6); // hides the floating CTA
  await page.waitForTimeout(600);
  await settle(page);
  const pad = 24;
  const box = await page.evaluate(() => {
    const r = document.querySelector("#commande form").getBoundingClientRect();
    return { x: r.left, y: r.top + scrollY, width: r.width, height: r.height };
  });
  await page.screenshot({
    path: `${OUT}/form-closeup.png`,
    fullPage: true,
    clip: { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad },
  });
  await context.close();
}

// Frame-by-frame video: the page is driven one step per frame, then ffmpeg encodes at 30 fps.
async function recorder(page, name) {
  const dir = `${tmpdir()}/orlea-${name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  // A screenshot takes longer than 1/30 s: slow the page's animations by the same factor so they play at true speed.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Animation.enable");
  const t0 = performance.now();
  for (let i = 0; i < 3; i++) await page.screenshot();
  const msPerShot = (performance.now() - t0) / 3;
  await cdp.send("Animation.setPlaybackRate", { playbackRate: Math.min(1, 1000 / FPS / msPerShot) });

  let n = 0;
  let mouse = { x: 0, y: 0 };
  const frame = async () => {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.screenshot({ path: `${dir}/frame_${String(n++).padStart(4, "0")}.png`, caret: "initial" });
  };
  const frames = (s) => Math.max(1, Math.round(s * FPS));
  return {
    hold: async (s) => {
      for (let i = 0; i < frames(s); i++) await frame();
    },
    scroll: async (from, to, s) => {
      for (let i = 1, N = frames(s); i <= N; i++) {
        await scrollTo(page, from + (to - from) * ease(i / N));
        await frame();
      }
    },
    move: async (x, y, s) => {
      const from = mouse;
      for (let i = 1, N = frames(s); i <= N; i++) {
        const t = ease(i / N);
        await page.mouse.move(from.x + (x - from.x) * t, from.y + (y - from.y) * t);
        await frame();
      }
      mouse = { x, y };
    },
    type: async (text) => {
      for (const ch of text) {
        await page.keyboard.type(ch);
        for (let i = 0; i < 3; i++) await frame(); // ~10 chars/s
      }
    },
    encode: (out) => {
      execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/frame_%04d.png`,
        // yuv420p needs even dimensions: 2079 → 2080 (1px pad).
        "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-preset", "veryfast", out],
        { stdio: "inherit" });
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

async function scrollVideo(browser) {
  const { context, page } = await open(browser);
  const L = await layout(page);
  const rec = await recorder(page, "scroll");
  await rec.hold(0.8);
  await rec.scroll(0, L.heroTop + L.heroScroll, 6);
  await rec.hold(0.7);
  await rec.scroll(L.heroTop + L.heroScroll, L.order, 5);
  await rec.hold(1);
  rec.encode(`${OUT}/mobile-scroll.mp4`);
  await context.close();
}

async function orderFlow(browser) {
  // No hasTouch: Tailwind hover: needs (hover: hover), and the mouse drives the cursor circle below.
  const { context, page } = await open(browser, { ...DEVICE, hasTouch: false });
  // Screenshots show no cursor, so draw one that follows the mouse.
  await page.addStyleTag({ content: `#cursor{position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px;border-radius:50%;
    background:rgba(237,230,218,.35);border:1.5px solid #EDE6DA;pointer-events:none;z-index:2147483647}` });
  await page.evaluate(() => {
    const c = Object.assign(document.createElement("div"), { id: "cursor" });
    document.body.append(c);
    addEventListener("mousemove", (e) => (c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`));
  });
  const L = await layout(page);
  const rec = await recorder(page, "order");
  await rec.move(195, 520, 0.01);
  await rec.hold(0.8);
  await rec.scroll(0, L.formTop, 3);
  await rec.hold(1);

  // Glide the field into view if needed, move the cursor onto it, click.
  let scrollY = L.formTop;
  const goTo = async (sel) => {
    const { top, h, vh } = await page.$eval(sel, (el) => ({ top: el.getBoundingClientRect().top + scrollY, h: el.offsetHeight, vh: innerHeight }));
    if (top < scrollY + 80 || top + h > scrollY + vh - 120) {
      const to = top + h / 2 - vh / 2;
      await rec.scroll(scrollY, to, 0.8);
      scrollY = to;
    }
    const b = await page.locator(sel).boundingBox();
    await rec.move(b.x + b.width / 2, b.y + b.height / 2, 0.6);
  };
  await goTo("#name");
  await page.mouse.down();
  await page.mouse.up();
  await rec.type("Amina Benali");
  await rec.hold(0.4);
  await goTo("#phone");
  await page.mouse.down();
  await page.mouse.up();
  await rec.type("0555123456");
  await rec.hold(0.4);
  await goTo("#wilaya");
  await page.selectOption("#wilaya", "Alger"); // the native picker never shows in screenshots
  await rec.hold(0.8);
  await goTo("#commande button[type=submit]");
  await rec.hold(1.5);
  rec.encode(`${OUT}/order-flow.mp4`);
  await context.close();
}

const browser = await chromium.launch();
await capture(browser);
await formCloseup(browser);
await scrollVideo(browser);
await orderFlow(browser);
await browser.close();
console.log(`Done → ${OUT}/`);
