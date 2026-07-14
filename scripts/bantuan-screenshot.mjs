#!/usr/bin/env node
/**
 * Auto-screenshot pages untuk panduan Bantuan.
 *
 * Prasyarat sekali:
 *   pnpm add -D puppeteer
 *
 * Cara pakai:
 *   BASE_URL=http://localhost:3000 \
 *   LOGIN_EMAIL=admin@cilupbah.test LOGIN_PASSWORD=secret \
 *   node scripts/bantuan-screenshot.mjs
 *
 * Baca target dari scripts/bantuan-targets.json — tiap target punya slug
 * (mengikuti slug panduan) + daftar shots. Setiap shot menghasilkan
 *   public/bantuan/media/<slug>/<name>.png
 * plus manifest gabungan public/bantuan/media/manifest.json.
 *
 * Untuk shot yang butuh interaksi: sebutkan `steps` (array click/type/wait).
 * Selector CSS standar; tambahkan `data-testid` di komponen kalau butuh stabil.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TARGETS_FILE = join(__dirname, "bantuan-targets.json");
const MEDIA_ROOT = join(ROOT, "public", "bantuan", "media");
const MANIFEST_FILE = join(MEDIA_ROOT, "manifest.json");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN_EMAIL = process.env.LOGIN_EMAIL;
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD;
const VIEWPORT_W = Number(process.env.VIEWPORT_W || 1440);
const VIEWPORT_H = Number(process.env.VIEWPORT_H || 900);

if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
  console.error("[bantuan-screenshot] LOGIN_EMAIL & LOGIN_PASSWORD wajib di env.");
  process.exit(1);
}

let puppeteer;
try {
  puppeteer = (await import("puppeteer")).default;
} catch {
  console.error("[bantuan-screenshot] puppeteer belum diinstal. Jalankan: pnpm add -D puppeteer");
  process.exit(1);
}

async function loadTargets() {
  if (!existsSync(TARGETS_FILE)) {
    console.error(`[bantuan-screenshot] targets file tidak ada: ${TARGETS_FILE}`);
    process.exit(1);
  }
  const raw = await readFile(TARGETS_FILE, "utf8");
  return JSON.parse(raw);
}

async function login(page) {
  console.log(`[bantuan-screenshot] login sebagai ${LOGIN_EMAIL}`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10_000 });
  await page.type('input[type="email"], input[name="email"]', LOGIN_EMAIL);
  await page.type('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15_000 }),
    page.click('button[type="submit"]'),
  ]);
  const url = page.url();
  if (url.includes("/login")) {
    throw new Error("Login gagal — masih di /login setelah submit.");
  }
  console.log(`[bantuan-screenshot] login OK → ${url}`);
}

async function runStep(page, step) {
  const { type, selector, text, delay = 250, waitFor } = step;
  switch (type) {
    case "click":
      await page.waitForSelector(selector, { timeout: 5_000 });
      await page.click(selector);
      break;
    case "type":
      await page.waitForSelector(selector, { timeout: 5_000 });
      await page.type(selector, text ?? "");
      break;
    case "waitFor":
      await page.waitForSelector(waitFor ?? selector, { timeout: 5_000 });
      break;
    case "waitTime":
      await new Promise((r) => setTimeout(r, Number(text ?? 500)));
      break;
    default:
      console.warn(`  · unknown step type: ${type}`);
  }
  if (delay) await new Promise((r) => setTimeout(r, delay));
}

async function shoot(page, target, shot, manifestEntries) {
  const outDir = join(MEDIA_ROOT, target.slug);
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${shot.name}.png`);

  const fullUrl = new URL(shot.url, BASE_URL).toString();
  console.log(`  · shoot ${target.slug}/${shot.name} → ${fullUrl}`);
  await page.goto(fullUrl, { waitUntil: "networkidle2", timeout: 20_000 });

  if (shot.waitFor) {
    try {
      await page.waitForSelector(shot.waitFor, { timeout: 8_000 });
    } catch {
      console.warn(`    ! waitFor "${shot.waitFor}" timeout — lanjut anyway.`);
    }
  }
  for (const step of shot.steps ?? []) {
    await runStep(page, step);
  }
  await new Promise((r) => setTimeout(r, shot.settleMs ?? 400));

  const clip = shot.clipSelector
    ? await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }, shot.clipSelector)
    : null;

  await page.screenshot({
    path: outPath,
    clip: clip ?? undefined,
    fullPage: !clip && (shot.fullPage ?? false),
  });

  manifestEntries.push({
    slug: target.slug,
    name: shot.name,
    path: `/bantuan/media/${target.slug}/${shot.name}.png`,
    url: fullUrl,
    caption: shot.caption ?? "",
    capturedAt: new Date().toISOString(),
  });
}

async function main() {
  const targets = await loadTargets();
  console.log(`[bantuan-screenshot] ${targets.length} target, base=${BASE_URL}`);

  const browser = await puppeteer.launch({
    headless: process.env.HEADFUL ? false : "new",
    defaultViewport: { width: VIEWPORT_W, height: VIEWPORT_H },
  });

  try {
    const page = await browser.newPage();
    await login(page);
    await mkdir(MEDIA_ROOT, { recursive: true });

    const manifestEntries = [];
    for (const target of targets) {
      console.log(`[${target.slug}]`);
      for (const shot of target.shots) {
        try {
          await shoot(page, target, shot, manifestEntries);
        } catch (err) {
          console.error(`    ✗ ${shot.name}: ${err.message}`);
        }
      }
    }

    await writeFile(
      MANIFEST_FILE,
      JSON.stringify({ generated_at: new Date().toISOString(), shots: manifestEntries }, null, 2),
    );
    console.log(`[bantuan-screenshot] selesai. Manifest: ${MANIFEST_FILE}`);
    console.log(`  ${manifestEntries.length} shot tersimpan.`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[bantuan-screenshot] fatal:", err);
  process.exit(1);
});
