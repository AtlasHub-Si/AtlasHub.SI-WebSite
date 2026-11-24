import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const PORT = 3105;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOT_DIR = path.resolve("docs/evidence/screenshots");
const VIDEO_DIR = path.resolve("docs/evidence/videos");
const TMP_VIDEO_DIR = path.resolve("docs/evidence/.tmp-videos");
const METRICS_PATH = path.resolve("docs/evidence/qa-metrics.json");

const LOCALES = ["pt", "en", "fr", "es"];
const EXPECTED_HTML_LANG = {
  pt: "pt-PT",
  en: "en-GB",
  fr: "fr-FR",
  es: "es-ES",
};

const ROUTE_SUFFIXES = [
  "",
  "/ecosystem",
  "/experience",
  "/portals/atlashq",
  "/portals/atlasbot",
  "/portals/club-atlas",
  "/portals/atlascortex",
  "/portals/gwd",
  "/solutions",
  "/consulting",
  "/cortex",
  "/projects",
  "/news",
  "/radar",
  "/company",
  "/contact",
  "/partners",
  "/contributors",
  "/investors",
  "/programs-and-communities",
  "/technology",
  "/press",
  "/legal",
  "/privacy",
  "/cookies",
  "/terms",
  "/accessibility",
  "/security",
  "/licenses",
];

const LEGACY_REDIRECTS = [
  { from: "/", expectedLocationSuffix: "/pt" },
  { from: "/sobre", expectedLocationSuffix: "/pt/company" },
  { from: "/metodo", expectedLocationSuffix: "/pt/consulting" },
  { from: "/diagnostico", expectedLocationSuffix: "/pt/contact" },
];

const CHROME_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-webgl",
  "--ignore-gpu-blocklist",
  "--no-sandbox",
];

function ensureDirs() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  fs.rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_VIDEO_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchChrome(args) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await chromium.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args,
      });
    } catch (err) {
      lastError = err;
      await sleep(500 * attempt);
    }
  }
  throw lastError;
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status >= 200 && res.status < 400) {
        return;
      }
    } catch {
      // Server still starting
    }
    await sleep(300);
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

function startNextServer() {
  const nextBin = path.resolve("node_modules/next/dist/bin/next");
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  let logs = "";
  child.stdout?.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr?.on("data", (chunk) => {
    logs += chunk.toString();
  });
  return { child, getLogs: () => logs };
}

function stopServer(child) {
  if (!child || child.killed) return;
  try {
    if (process.platform === "win32" && child.pid) {
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  } catch {
    // Ignore cleanup errors
  }
}

function attachRuntimeWatchers(page, bucket, label) {
  const onConsole = (msg) => {
    if (msg.type() === "error") {
      bucket.consoleErrors.push(`[${label}] ${msg.text()}`);
    }
  };
  const onPageError = (err) => {
    bucket.pageErrors.push(`[${label}] ${err.message}`);
  };
  const onRequestFailed = (req) => {
    const errText = req.failure()?.errorText || "unknown";
    if (errText.includes("ERR_ABORTED")) return;
    bucket.failedRequests.push(`[${label}] ${req.method()} ${req.url()} -> ${errText}`);
  };
  const onResponse = (res) => {
    if (res.status() >= 400) {
      bucket.httpErrors.push(`[${label}] HTTP ${res.status()} ${res.url()}`);
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  return () => {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onRequestFailed);
    page.off("response", onResponse);
  };
}

async function injectMonitoringScripts(context) {
  await context.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations.push({
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        effectiveDirective: event.effectiveDirective,
      });
    });

    window.__atlasCwv = { lcp: 0, cls: 0, inp: 0, inpProc: 0, events: [] };
    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          window.__atlasCwv.lcp = Math.max(window.__atlasCwv.lcp, last.startTime || 0);
        }
      });
      lcpObs.observe({ type: "largest-contentful-paint", buffered: true });

      let sessionValue = 0;
      let sessionEntries = [];
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const first = sessionEntries[0];
            const prev = sessionEntries[sessionEntries.length - 1];
            if (
              sessionValue &&
              prev &&
              first &&
              entry.startTime - prev.startTime < 1000 &&
              entry.startTime - first.startTime < 5000
            ) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }
            window.__atlasCwv.cls = Math.max(window.__atlasCwv.cls, sessionValue);
          }
        }
      });
      clsObs.observe({ type: "layout-shift", buffered: true });

      const evtObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId && entry.duration) {
            const proc =
              entry.processingEnd >= entry.processingStart
                ? entry.processingEnd - entry.processingStart
                : 0;
            window.__atlasCwv.inp = Math.max(window.__atlasCwv.inp, entry.duration);
            window.__atlasCwv.inpProc = Math.max(window.__atlasCwv.inpProc, proc);
            window.__atlasCwv.events.push({
              name: entry.name,
              dur: Math.round(entry.duration),
              proc: Math.round(proc),
              target: (entry.target?.textContent || "").trim().slice(0, 32),
            });
          }
        }
      });
      evtObs.observe({ type: "event", buffered: true, durationThreshold: 16 });
    } catch {
      // Older observer flags not supported
    }
  });
}

async function triggerLazyImagesAndCheck(page) {
  // Scroll gently so lazy images & reveal animations settle cleanly
  await page.evaluate(async () => {
    const height = document.body.scrollHeight;
    const step = 750;
    for (let y = 0; y <= height; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 35));
    }
    window.scrollTo(0, height);
    await new Promise((r) => setTimeout(r, 60));
  });

  // Wait for every <img> in DOM to finish decoding/loading
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          const timer = setTimeout(resolve, 4000);
          img.addEventListener(
            "load",
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true },
          );
          img.addEventListener(
            "error",
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true },
          );
        });
      }),
    );
  });

  return page.evaluate(() => {
    const imgs = Array.from(document.images);
    const broken = imgs
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => ({
        src: img.currentSrc || img.getAttribute("src"),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      }));
    return { total: imgs.length, broken };
  });
}

async function checkPageStructureAndSeo(page, { locale, suffix, isLocalized }) {
  return page.evaluate(
    ({ expectedLang, expectedSuffix, isLoc }) => {
      const htmlLang = document.documentElement.lang;
      const title = document.title.trim();
      const h1s = Array.from(document.querySelectorAll("h1"));
      const h1Texts = h1s.map((el) => el.textContent?.trim() || "");
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
      const hreflangNodes = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
      const hreflangs = Object.fromEntries(
        hreflangNodes.map((n) => [n.getAttribute("hreflang"), n.getAttribute("href")]),
      );

      const overflow = document.documentElement.scrollWidth > window.innerWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;

      const hasHeader = Boolean(document.querySelector("header"));
      const hasMain = Boolean(document.querySelector("main"));
      const hasFooter = Boolean(document.querySelector("footer"));

      const unnamedInteractive = [];
      for (const el of document.querySelectorAll("button, a[href]")) {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const text = (el.textContent || "").trim();
        const ariaLabel = (el.getAttribute("aria-label") || "").trim();
        const ariaLabelledBy = (el.getAttribute("aria-labelledby") || "").trim();
        const titleAttr = (el.getAttribute("title") || "").trim();
        const imgAlt = el.querySelector("img[alt]")?.getAttribute("alt")?.trim() || "";
        if (!text && !ariaLabel && !ariaLabelledBy && !titleAttr && !imgAlt) {
          unnamedInteractive.push(el.outerHTML.slice(0, 140));
        }
      }

      return {
        htmlLang,
        expectedLang,
        title,
        h1Count: h1s.length,
        h1Texts,
        canonical,
        expectedSuffix,
        isLoc,
        hreflangs,
        overflow,
        scrollWidth,
        innerWidth,
        landmarks: { hasHeader, hasMain, hasFooter },
        unnamedInteractive,
        cspViolations: window.__cspViolations || [],
      };
    },
    {
      expectedLang: locale ? EXPECTED_HTML_LANG[locale] : "pt-PT",
      expectedSuffix: suffix,
      isLoc: isLocalized,
    },
  );
}

function assertSecurityHeaders(headers, label, errors) {
  const csp = headers["content-security-policy"] || "";
  const xcto = headers["x-content-type-options"] || "";
  const xfo = headers["x-frame-options"] || "";
  const rp = headers["referrer-policy"] || "";
  if (!csp.includes("default-src 'self'")) {
    errors.push(`[${label}] Missing or weak Content-Security-Policy: ${csp}`);
  }
  if (xcto.toLowerCase() !== "nosniff") {
    errors.push(`[${label}] Missing/invalid X-Content-Type-Options: ${xcto}`);
  }
  if (xfo.toUpperCase() !== "SAMEORIGIN") {
    errors.push(`[${label}] Missing/invalid X-Frame-Options: ${xfo}`);
  }
  if (!rp.includes("strict-origin-when-cross-origin")) {
    errors.push(`[${label}] Missing/invalid Referrer-Policy: ${rp}`);
  }
}

function transcodeToMp4(webmPath, mp4Path) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      webmPath,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-crf",
      "22",
      mp4Path,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${mp4Path}: ${result.stderr}`);
  }
  if (!fs.existsSync(mp4Path) || fs.statSync(mp4Path).size < 1024) {
    throw new Error(`Transcoded MP4 missing or too small: ${mp4Path}`);
  }
}

async function run() {
  ensureDirs();
  const { child: server, getLogs } = startNextServer();
  let browser;

  const bucket = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    httpErrors: [],
    cspViolations: [],
    assertions: [],
  };

  try {
    await waitForServer(`${BASE_URL}/pt`);

    // =========================================================================
    // PHASE 0: CLEAN NON-SWIFTSHADER CORE WEB VITALS BENCHMARK (/pt)
    // =========================================================================
    const cwvBrowser = await launchChrome(["--disable-gpu", "--no-sandbox"]);
    let cleanCwv = { lcpMs: 0, cls: 0, inpMs: 0, jsProcessingMs: 0 };
    try {
      // Pre-warm SwiftShader WebGL/GPU process & Next.js server cache before measuring fresh tab
      const warmupPage = await cwvBrowser.newPage();
      await warmupPage.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
      await sleep(400);
      await warmupPage.close();

      const cwvCtx = await cwvBrowser.newContext({ viewport: { width: 1440, height: 900 } });
      await injectMonitoringScripts(cwvCtx);
      const cwvPage = await cwvCtx.newPage();
      await cwvPage.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
      await sleep(2000);
      await cwvPage.locator("main").getByRole("button", { name: /Reduzir movimento/i }).first().click();
      await sleep(300);
      await cwvPage.locator("main").getByRole("button", { name: /Ativar movimento/i }).first().click();
      await sleep(300);
      await cwvPage.locator("#portals").getByRole("button", { name: /^AtlasHQ/i }).first().click();
      await cwvPage.locator('[role="dialog"]').waitFor({ state: "visible" });
      await sleep(850);
      await cwvPage.locator('[role="dialog"]').getByRole("tab", { name: "Agentes + NeX" }).click();
      await sleep(300);
      await cwvPage.locator('[role="dialog"]').getByRole("tab", { name: "Aprovação humana" }).click();
      await sleep(300);
      await cwvPage.locator('[role="dialog"]').getByRole("button", { name: "Aprovar artefacto" }).click();
      await sleep(300);
      await cwvPage.keyboard.press("Escape");
      await cwvPage.locator('[role="dialog"]').waitFor({ state: "hidden" });
      await sleep(250);
      const postMetrics = await cwvPage.evaluate(() => window.__atlasCwv);
      const uiEvents = postMetrics.events.filter((ev) => ev.name === "click" || ev.name === "keydown");
      const maxUiInp = uiEvents.reduce((acc, ev) => Math.max(acc, ev.dur), 0);
      const maxJsProc = postMetrics.events.reduce((acc, ev) => Math.max(acc, ev.proc), 0);
      cleanCwv = {
        lcpMs: Math.round(postMetrics.lcp || 0),
        cls: Number((postMetrics.cls || 0).toFixed(4)),
        inpMs: Math.round(maxUiInp),
        jsProcessingMs: Math.round(maxJsProc),
        interactionEvents: uiEvents,
      };
      await cwvCtx.close();
    } finally {
      await cwvBrowser.close().catch(() => {});
    }

    browser = await launchChrome(CHROME_ARGS);

    // =========================================================================
    // PHASE 1: DESKTOP (1440x900) CWV, SCREENSHOTS, PORTALS, CLARA, LANG, A11Y
    // =========================================================================
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await injectMonitoringScripts(desktopCtx);
    const page = await desktopCtx.newPage();
    const detachDesktop = attachRuntimeWatchers(page, bucket, "desktop-e2e");

    const homeRes = await page.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
    if (!homeRes || homeRes.status() !== 200) {
      throw new Error(`/pt returned ${homeRes?.status()}`);
    }
    assertSecurityHeaders(homeRes.headers(), "/pt", bucket.assertions);

    // Wait for fonts & initial hero paint
    await page.evaluate(() => document.fonts.ready);
    await sleep(700);

    // Verify Clara is closed by default
    const defaultDialogs = await page.locator('[role="dialog"]').count();
    if (defaultDialogs !== 0) {
      bucket.assertions.push(`Clara or dialog opened by default on /pt (count=${defaultDialogs})`);
    }

    // 01: Hero above the fold
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-home-hero-pt-desktop-1440.png"),
      fullPage: false,
    });

    // Fresh page Tab check -> verify first Tab focuses skip link (#main-content)
    await page.keyboard.press("Tab");
    const activeAfterFirstTab = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      href: document.activeElement?.getAttribute("href"),
    }));
    if (activeAfterFirstTab.href !== "#main-content") {
      bucket.assertions.push(`First Tab did not focus skip link: ${JSON.stringify(activeAfterFirstTab)}`);
    }
    await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));

    // Capture cold initial CWV snapshot before scroll
    const cwv = await page.evaluate(() => window.__atlasCwv);

    // Scroll gently down to trigger all ScrollReveal & lazy images, capture Pearl & Footer
    await triggerLazyImagesAndCheck(page);

    const hiddenSections = await page.evaluate(() => {
      const targets = [
        "#portals",
        "#ecosystem-bridge",
        "#pearl-consulting-heading",
        "#methodology",
        "#community-research-heading",
        "#clara-invitation-heading",
      ];
      return targets.map((sel) => {
        const el = document.querySelector(sel);
        const section = el?.closest("section") || el;
        const motionNode =
          el?.closest("[style]") ||
          section?.querySelector("[style*='opacity']") ||
          section?.firstElementChild;
        return {
          selector: sel,
          opacity: motionNode ? getComputedStyle(motionNode).opacity : "none",
        };
      });
    });
    for (const hs of hiddenSections) {
      if (hs.opacity === "0") {
        bucket.assertions.push(`ScrollReveal left section invisible (opacity: 0) after scroll: ${hs.selector}`);
      }
    }

    // 11: Pearl Consulting + Methodology
    const pearlHeading = page.locator("#pearl-consulting-heading");
    await pearlHeading.scrollIntoViewIfNeeded();
    await sleep(550);
    await page.evaluate(() => {
      const el = document.querySelector("#pearl-consulting-heading");
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo(0, Math.max(0, y));
      }
    });
    await sleep(450);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "11-pearl-consulting-methodology-1440.png"),
      fullPage: false,
    });

    // 13: Footer institutional (scroll to bottom viewport cleanly without sticky header stitching artifacts)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(450);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "13-footer-institutional-1440.png"),
      fullPage: false,
    });

    // Check desktop header nav wrapping at 1440px
    const headerWrapIssues = await page.evaluate(() => {
      const issues = [];
      const items = document.querySelectorAll("header nav a, header nav button, header > div > div:last-child button, header > div > div:last-child a");
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.height > 46) {
          issues.push(`${el.textContent?.trim()}: height=${Math.round(rect.height)}px`);
        }
      }
      return issues;
    });
    if (headerWrapIssues.length > 0) {
      bucket.assertions.push(
        `Header controls wrapped onto multiple lines at 1440px: ${headerWrapIssues.join(" | ")}`,
      );
    }

    // 02: Full page PT (after scroll reveals are visible)
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-home-full-pt-desktop-1440.png"),
      fullPage: true,
    });

    // Interactive Portal Dive verification across ALL 5 Portals
    const portalsMetrics = {};
    const portalsSection = page.locator("#portals");
    await portalsSection.scrollIntoViewIfNeeded();
    await sleep(450);

    async function measureInteraction(actionFn) {
      return page.evaluate(async () => {
        return new Promise((resolve) => {
          const t0 = performance.now();
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve(performance.now() - t0);
            });
          });
        });
      }).then(async () => {
        const tStart = Date.now();
        await actionFn();
        const rafLatency = await page.evaluate(
          () =>
            new Promise((resolve) => {
              const t0 = performance.now();
              requestAnimationFrame(() => resolve(performance.now() - t0));
            }),
        );
        return { wallMs: Date.now() - tStart, rafMs: rafLatency };
      });
    }

    // Helper to click portal card by exact name inside #portals
    const portalDefinitions = [
      {
        slug: "atlashq",
        buttonPattern: /^AtlasHQ\s*—/i,
        screenshot: "06-portal-atlashq-open-1440.png",
        exitMode: "escape",
        verifyInner: async () => {
          const dlg = page.locator('[role="dialog"]');
          await dlg.getByRole("tab", { name: "Agentes + NeX" }).click();
          await dlg.getByRole("tab", { name: "Aprovação humana" }).click();
          await dlg.getByRole("button", { name: "Aprovar artefacto" }).click();
          await dlg.getByText(/Aprovado por supervisão humana/i).waitFor({ state: "visible" });
          await dlg.getByRole("tab", { name: "Rastreabilidade" }).click();
          await dlg.getByText("EVT-05").waitFor({ state: "visible" });
        },
      },
      {
        slug: "atlasbot",
        buttonPattern: /^AtlasBot\s*—/i,
        screenshot: "07-portal-atlasbot-open-1440.png",
        exitMode: "back",
        verifyInner: async () => {
          const dlg = page.locator('[role="dialog"]');
          await dlg.getByRole("button", { name: "Familiar" }).click();
          await dlg.getByRole("button", { name: "Equipas" }).click();
          await dlg.getByRole("button", { name: "Pessoal" }).click();
          await dlg.getByRole("button", { name: /Analyst/i }).click();
          await dlg.getByRole("button", { name: /Preparar projeto/i }).click();
          await dlg.getByRole("button", { name: /Simular fluxo/i }).click();
        },
      },
      {
        slug: "club-atlas",
        buttonPattern: /^Club Atlas\s*—/i,
        screenshot: "08-portal-clubatlas-open-1440.png",
        exitMode: "escape",
        verifyInner: async () => {
          const dlg = page.locator('[role="dialog"]');
          await dlg.getByRole("button", { name: /Estação 02/i }).click();
          await dlg.getByRole("button", { name: /Estação 03/i }).click();
          await dlg.getByRole("button", { name: /GEN-02/i }).click();
        },
      },
      {
        slug: "atlascortex",
        buttonPattern: /^AtlasCortex\s*—/i,
        screenshot: "09-portal-atlascortex-galaxy-1440.png",
        exitMode: "escape",
        waitExtraMs: 900,
        verifyInner: async () => {
          const dlg = page.locator('[role="dialog"]');
          const canvasStats = await dlg.evaluate(() => {
            const canvas = document.querySelector('[role="dialog"] canvas');
            const fallbackImg = document.querySelector('[role="dialog"] img');
            if (!canvas) return { hasCanvas: false, w: 0, h: 0 };
            const r = canvas.getBoundingClientRect();
            return {
              hasCanvas: true,
              w: Math.round(r.width),
              h: Math.round(r.height),
              attrW: canvas.width,
              attrH: canvas.height,
              fallbackOpacity: fallbackImg ? getComputedStyle(fallbackImg).opacity : "none",
            };
          });
          if (!canvasStats.hasCanvas || canvasStats.w < 100 || canvasStats.h < 100) {
            bucket.assertions.push(`AtlasCortex 3D WebGL canvas invalid: ${JSON.stringify(canvasStats)}`);
          }
          await dlg.getByRole("button", { name: /versionamento git/i }).click();
          await dlg.getByRole("button", { name: /Lista 2D acessível/i }).click();
          const rowCount = await dlg.locator("table tbody tr").count();
          if (rowCount < 5) {
            bucket.assertions.push(`AtlasCortex 2D table has too few rows: ${rowCount}`);
          }
          await dlg.locator("table tbody tr button").first().click();
          await dlg.getByRole("button", { name: /Vista Galaxy 3D/i }).click();
          await sleep(300);
        },
      },
      {
        slug: "gwd",
        buttonPattern: /^GWD\s*—/i,
        screenshot: "10-portal-gwd-open-1440.png",
        exitMode: "back",
        verifyInner: async () => {
          const dlg = page.locator('[role="dialog"]');
          await dlg.getByRole("button", { name: /Ventures/i }).click();
          await dlg.getByRole("button", { name: /Cortex/i }).click();
          await dlg.getByRole("button", { name: "Proposto" }).click();
          await dlg.getByRole("button", { name: "Todos os estados" }).click();
          await dlg.getByRole("button", { name: /03\s*Mandato aprovado/i }).click();
        },
      },
    ];

    for (let i = 0; i < portalDefinitions.length; i++) {
      const def = portalDefinitions[i];
      await portalsSection.scrollIntoViewIfNeeded();
      await sleep(250);
      const scrollBefore = await page.evaluate(() => window.scrollY);
      const portalBtn = portalsSection.getByRole("button", { name: def.buttonPattern }).first();

      const clickTiming = await measureInteraction(async () => {
        await portalBtn.click();
      });

      const dialog = page.locator('[role="dialog"]');
      await dialog.waitFor({ state: "visible", timeout: 5000 });
      await sleep(def.waitExtraMs ? 650 + def.waitExtraMs : 680);
      await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('[role="dialog"] img'));
        await Promise.all(
          imgs.map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise((resolve) => {
              const t = setTimeout(resolve, 2000);
              img.addEventListener("load", () => { clearTimeout(t); resolve(); }, { once: true });
              img.addEventListener("error", () => { clearTimeout(t); resolve(); }, { once: true });
            });
          }),
        );
      });

      const urlOpen = new URL(page.url());
      if (urlOpen.searchParams.get("portal") !== def.slug) {
        bucket.assertions.push(
          `Portal ${def.slug} did not update ?portal=${def.slug} (got ${urlOpen.search})`,
        );
      }

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, def.screenshot),
        fullPage: false,
      });

      const dialogImgStatus = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        if (!dlg) return { total: 0, incomplete: [] };
        const imgs = Array.from(dlg.querySelectorAll("img"));
        return {
          total: imgs.length,
          incomplete: imgs
            .filter((img) => !img.complete || img.naturalWidth === 0)
            .map((img) => img.getAttribute("src") || img.currentSrc),
        };
      });
      if (dialogImgStatus.incomplete.length > 0) {
        bucket.assertions.push(
          `Portal ${def.slug} rendered with incomplete/blank <img> after 680ms dive settle: ${JSON.stringify(dialogImgStatus.incomplete)}`,
        );
      }

      await def.verifyInner();

      if (def.exitMode === "escape") {
        await page.keyboard.press("Escape");
      } else {
        await page.goBack();
      }
      await dialog.waitFor({ state: "hidden", timeout: 5000 });
      await sleep(300);

      const urlClosed = new URL(page.url());
      if (urlClosed.searchParams.get("portal") !== null) {
        bucket.assertions.push(
          `Portal ${def.slug} exit (${def.exitMode}) kept ?portal=${urlClosed.searchParams.get("portal")}`,
        );
      }
      const scrollAfter = await page.evaluate(() => window.scrollY);
      if (Math.abs(scrollAfter - scrollBefore) > 24) {
        bucket.assertions.push(
          `Scroll restoration mismatch after exiting ${def.slug} (${def.exitMode}): before=${scrollBefore}, after=${scrollAfter}`,
        );
      }
      portalsMetrics[def.slug] = {
        exitMode: def.exitMode,
        scrollBefore,
        scrollAfter,
        clickWallMs: clickTiming.wallMs,
      };
    }

    // Clara Concierge E2E + Screenshot 12
    const claraTrigger = page.getByRole("button", { name: "Falar com a Clara" }).last();
    await claraTrigger.click();
    const claraDialog = page.locator('[role="dialog"]');
    await claraDialog.waitFor({ state: "visible", timeout: 5000 });
    await sleep(400);
    await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('[role="dialog"] img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise((resolve) => {
            const t = setTimeout(resolve, 2000);
            img.addEventListener("load", () => { clearTimeout(t); resolve(); }, { once: true });
            img.addEventListener("error", () => { clearTimeout(t); resolve(); }, { once: true });
          });
        }),
      );
    });
    const claraImgStatus = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return { total: 0, incomplete: [] };
      const imgs = Array.from(dlg.querySelectorAll("img"));
      return {
        total: imgs.length,
        incomplete: imgs
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute("src") || img.currentSrc),
      };
    });
    if (claraImgStatus.incomplete.length > 0) {
      bucket.assertions.push(
        `Clara Concierge rendered with incomplete/blank <img>: ${JSON.stringify(claraImgStatus.incomplete)}`,
      );
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "12-clara-concierge-open-1440.png"),
      fullPage: false,
    });

    // Enter diagnostic -> complete 6 questions -> verify recommendation -> confirm consent gate blocks unconsented submit
    await claraDialog.getByRole("button", { name: /Diagnóstico operacional/i }).click();
    for (let step = 0; step < 5; step++) {
      await claraDialog.getByRole("button", { name: "Seguinte" }).click();
    }
    await claraDialog.getByRole("button", { name: /Ver enquadramento sugerido/i }).click();
    await claraDialog.getByText(/Modelo sugerido/i).waitFor({ state: "visible" });
    await claraDialog.getByRole("button", { name: /Avançar para envio humano/i }).click();

    await claraDialog.locator("#clara-name").fill("QA Verifier");
    await claraDialog.locator("#clara-email").fill("qa-verifier@example.com");

    // Ensure consent checkbox is NOT checked, submit and verify client consent block
    const consentCheckbox = claraDialog.locator('input[type="checkbox"]');
    if (await consentCheckbox.isChecked()) {
      bucket.assertions.push("Clara consent checkbox was unexpectedly pre-checked");
    }
    await claraDialog.locator('button[type="submit"]').click();
    const alertText = await claraDialog.locator('[role="alert"]').textContent();
    if (!alertText || !/consentimento/i.test(alertText)) {
      bucket.assertions.push(`Clara consent gate alert missing/unexpected: ${alertText}`);
    }

    // Close Clara via Escape
    await page.keyboard.press("Escape");
    await claraDialog.waitFor({ state: "hidden", timeout: 4000 });

    // Keyboard-only portal navigation test: focus portal -> Enter -> Escape
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const hqBtn = page.locator("#portals").getByRole("button", { name: /^AtlasHQ\s*—/i }).first();
    await hqBtn.focus();
    await page.keyboard.press("Enter");
    await page.locator('[role="dialog"]').waitFor({ state: "visible", timeout: 4000 });
    await page.keyboard.press("Escape");
    await page.locator('[role="dialog"]').waitFor({ state: "hidden", timeout: 4000 });

    // Reduce Motion toggle test + Screenshot 19
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(() => window.scrollY === 0);
    const motionBtn = page.locator("main").getByRole("button", { name: /Reduzir movimento/i }).first();
    await motionBtn.click();
    await sleep(300);
    const reducedAttr = await page.evaluate(() => document.documentElement.getAttribute("data-reduced-motion"));
    if (reducedAttr !== "true") {
      bucket.assertions.push(`Reduce motion toggle failed to set data-reduced-motion="true" (got ${reducedAttr})`);
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "19-reduced-motion-1440.png"),
      fullPage: false,
    });
    // Re-enable motion so subsequent captures show full motion state
    await page.locator("main").getByRole("button", { name: /Ativar movimento/i }).first().click();
    await sleep(250);

    // Language Switcher PT -> EN -> FR -> ES via UI switcher + Screenshots 03, 04, 05
    const captureHomeLocaleScreenshot = async (hreflang, expectedLang, fileName) => {
      const switcher = page.locator('header div[role="group"]').first();
      await switcher.locator(`a[hreflang="${hreflang}"]`).click();
      await page.waitForURL(`${BASE_URL}/${hreflang}`, { timeout: 5000 });
      await page.waitForFunction((lang) => document.documentElement.lang === lang, expectedLang);
      await page.waitForLoadState("networkidle").catch(() => {});
      await sleep(350);
      await page.waitForFunction(
        () => {
          if (Math.round(window.scrollY) !== 0) {
            window.scrollTo({ top: 0, behavior: "instant" });
          }
          return Math.round(window.scrollY) === 0;
        },
        null,
        { timeout: 10000 },
      );
      await sleep(250);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, fileName),
        fullPage: false,
      });
    };

    await captureHomeLocaleScreenshot("en", "en-GB", "03-home-en-desktop-1440.png");
    await captureHomeLocaleScreenshot("fr", "fr-FR", "04-home-fr-desktop-1440.png");
    await captureHomeLocaleScreenshot("es", "es-ES", "05-home-es-desktop-1440.png");

    // 14: Ecosystem page
    await page.goto(`${BASE_URL}/pt/ecosystem`, { waitUntil: "networkidle" });
    await triggerLazyImagesAndCheck(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "14-ecosystem-page-1440.png"),
      fullPage: true,
    });

    // 15: Multiverse Experience page + ArrowRight nav
    await page.goto(`${BASE_URL}/pt/experience`, { waitUntil: "networkidle" });
    await sleep(1300);
    const multiverseCanvas = await page.locator("canvas").count();
    if (multiverseCanvas < 1) {
      bucket.assertions.push("Multiverse /pt/experience 3D canvas did not mount");
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "15-multiverse-experience-1440.png"),
      fullPage: false,
    });
    await page.keyboard.press("ArrowRight");
    await sleep(200);
    await page.keyboard.press("Escape");
    await page.waitForURL(`${BASE_URL}/pt`, { timeout: 5000 });

    const finalDesktopCwv = await page.evaluate(() => window.__atlasCwv);
    const swiftshaderCwv = {
      coldLcpMs: Math.round(cwv.lcp || 0),
      cls: Number(Math.max(cwv.cls || 0, finalDesktopCwv.cls || 0).toFixed(4)),
      jsProcessingMs: Math.round(Math.max(cwv.inpProc || 0, finalDesktopCwv.inpProc || 0)),
    };

    detachDesktop();
    await desktopCtx.close();

    // =========================================================================
    // PHASE 2: OS `prefers-reduced-motion: reduce` EMULATION CHECK
    // =========================================================================
    const rmCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await injectMonitoringScripts(rmCtx);
    const rmPage = await rmCtx.newPage();
    const detachRm = attachRuntimeWatchers(rmPage, bucket, "reduced-motion-media");

    await rmPage.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
    await rmPage.waitForFunction(
      () => document.documentElement.getAttribute("data-reduced-motion") !== null,
      { timeout: 5000 },
    );
    const osRmAttr = await rmPage.evaluate(() => document.documentElement.getAttribute("data-reduced-motion"));
    if (osRmAttr !== "true") {
      bucket.assertions.push(`OS reducedMotion emulation did not set data-reduced-motion="true" (got ${osRmAttr})`);
    }
    await rmPage.goto(`${BASE_URL}/pt/experience`, { waitUntil: "networkidle" });
    const expFallbackCards = await rmPage.locator('[data-multiverse-card="true"]').count();
    if (expFallbackCards !== 5) {
      bucket.assertions.push(`Multiverse reducedMotion 2D grid expected 5 cards, got ${expFallbackCards}`);
    }
    detachRm();
    await rmCtx.close();

    // =========================================================================
    // PHASE 3: MOBILE (390x844) SCREENSHOTS & OVERFLOW CHECK
    // =========================================================================
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    await injectMonitoringScripts(mobileCtx);
    const mPage = await mobileCtx.newPage();
    const detachMobile = attachRuntimeWatchers(mPage, bucket, "mobile-390");

    await mPage.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
    await mPage.evaluate(() => document.fonts.ready);
    await sleep(600);
    const mobileOverflow = await mPage.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    if (mobileOverflow) {
      bucket.assertions.push("Horizontal overflow detected on /pt at 390px mobile");
    }
    await mPage.screenshot({
      path: path.join(SCREENSHOT_DIR, "16-home-mobile-390.png"),
      fullPage: false,
    });

    // Open portal on mobile -> capture 17 & verify zero banner clipping across mobile scenes
    const mobilePortals = mPage.locator("#portals");
    await mobilePortals.scrollIntoViewIfNeeded();
    await sleep(300);
    await mobilePortals.getByRole("button", { name: /^AtlasHQ\s*—/i }).first().click();
    await mPage.locator('[role="dialog"]').waitFor({ state: "visible", timeout: 5000 });
    await sleep(700);
    await mPage.screenshot({
      path: path.join(SCREENSHOT_DIR, "17-portal-mobile-390.png"),
      fullPage: false,
    });
    await mPage.keyboard.press("Escape");
    await mPage.locator('[role="dialog"]').waitFor({ state: "hidden", timeout: 5000 });

    for (const mobileSlug of ["atlashq", "atlasbot", "club-atlas", "gwd"]) {
      await mPage.goto(`${BASE_URL}/pt?portal=${mobileSlug}`, { waitUntil: "networkidle" });
      await sleep(450);
      const clipCheck = await mPage.evaluate(() => {
        const dlg = document.querySelector("[role=dialog]");
        const banner = dlg?.querySelector("picture")?.parentElement;
        if (!banner) return null;
        const overlay = banner.querySelector(".absolute.inset-0.flex");
        const target = overlay || banner;
        return {
          scrollH: target.scrollHeight,
          clientH: target.clientHeight,
          clipped: target.scrollHeight > target.clientHeight + 2,
        };
      });
      if (clipCheck?.clipped) {
        bucket.assertions.push(
          `Mobile 390px portal banner clipped in ${mobileSlug}: scrollH=${clipCheck.scrollH} > clientH=${clipCheck.clientH}`,
        );
      }
    }
    await mPage.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });

    // Footer mobile -> capture 18
    await triggerLazyImagesAndCheck(mPage);
    await mPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(350);
    await mPage.screenshot({
      path: path.join(SCREENSHOT_DIR, "18-footer-mobile-390.png"),
      fullPage: false,
    });

    detachMobile();
    await mobileCtx.close();

    // =========================================================================
    // PHASE 4: EXHAUSTIVE ROUTE AUDIT (ALL 116 LOCALIZED + REDIRECTS + /workshops)
    // =========================================================================
    const auditCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    await injectMonitoringScripts(auditCtx);
    const auditPage = await auditCtx.newPage();
    const detachAudit = attachRuntimeWatchers(auditPage, bucket, "route-audit");

    const auditedRoutes = [];

    for (const locale of LOCALES) {
      for (const suffix of ROUTE_SUFFIXES) {
        const routePath = `/${locale}${suffix}`;
        const res = await auditPage.goto(`${BASE_URL}${routePath}`, { waitUntil: "domcontentloaded" });
        const status = res?.status() ?? 0;
        if (status !== 200) {
          bucket.assertions.push(`Route ${routePath} returned HTTP ${status}`);
        }
        if (res) {
          assertSecurityHeaders(res.headers(), routePath, bucket.assertions);
        }

        // Let Three.js/images settle slightly on dynamic routes
        if (suffix === "/experience" || suffix === "/portals/atlascortex") {
          await sleep(450);
        }

        const imgs = await triggerLazyImagesAndCheck(auditPage);
        if (imgs.broken.length > 0) {
          bucket.assertions.push(
            `Broken images on ${routePath}: ${JSON.stringify(imgs.broken)}`,
          );
        }

        const seo = await checkPageStructureAndSeo(auditPage, {
          locale,
          suffix,
          isLocalized: true,
        });

        if (seo.htmlLang !== seo.expectedLang) {
          bucket.assertions.push(
            `${routePath}: expected <html lang="${seo.expectedLang}">, got "${seo.htmlLang}"`,
          );
        }
        if (!seo.title) {
          bucket.assertions.push(`${routePath}: empty <title>`);
        }
        if (seo.h1Count !== 1 || !seo.h1Texts[0]) {
          bucket.assertions.push(`${routePath}: expected single non-empty <h1>, got ${seo.h1Count}`);
        }
        const expectedCanonical = `https://atlashub.si/${locale}${suffix}`;
        if (seo.canonical !== expectedCanonical) {
          bucket.assertions.push(
            `${routePath}: canonical mismatch (expected ${expectedCanonical}, got ${seo.canonical})`,
          );
        }
        for (const hl of ["pt", "en", "fr", "es", "x-default"]) {
          if (!seo.hreflangs[hl]) {
            bucket.assertions.push(`${routePath}: missing hreflang="${hl}"`);
          }
        }
        if (seo.overflow) {
          bucket.assertions.push(
            `${routePath}: horizontal overflow (${seo.scrollWidth} > ${seo.innerWidth})`,
          );
        }
        if (!seo.landmarks.hasHeader || !seo.landmarks.hasMain) {
          bucket.assertions.push(`${routePath}: missing <header> or <main> landmark`);
        }
        if (suffix !== "/experience" && !seo.landmarks.hasFooter) {
          bucket.assertions.push(`${routePath}: missing <footer> landmark`);
        }
        if (seo.unnamedInteractive.length > 0) {
          bucket.assertions.push(
            `${routePath}: unnamed interactive elements: ${seo.unnamedInteractive.join(" | ")}`,
          );
        }
        if (seo.cspViolations.length > 0) {
          bucket.cspViolations.push(
            `${routePath}: ${JSON.stringify(seo.cspViolations)}`,
          );
        }

        auditedRoutes.push({
          route: routePath,
          status,
          imgCount: imgs.total,
          htmlLang: seo.htmlLang,
          h1Count: seo.h1Count,
          overflow: seo.overflow,
        });
      }
    }

    // Legacy redirects check via HTTP manual fetch + Playwright follow
    for (const redir of LEGACY_REDIRECTS) {
      const manualRes = await fetch(`${BASE_URL}${redir.from}`, { redirect: "manual" });
      const loc = manualRes.headers.get("location") || "";
      if (![307, 308].includes(manualRes.status) || !loc.endsWith(redir.expectedLocationSuffix)) {
        bucket.assertions.push(
          `Legacy redirect ${redir.from} unexpected: status=${manualRes.status}, location=${loc}`,
        );
      }
      const followedRes = await auditPage.goto(`${BASE_URL}${redir.from}`, {
        waitUntil: "domcontentloaded",
      });
      if (!followedRes || followedRes.status() !== 200) {
        bucket.assertions.push(`Legacy redirect ${redir.from} did not resolve 200`);
      }
      auditedRoutes.push({
        route: redir.from,
        redirectStatus: manualRes.status,
        location: loc,
        finalStatus: followedRes?.status() ?? 0,
      });
    }

    // /workshops route check
    const wsRes = await auditPage.goto(`${BASE_URL}/workshops`, { waitUntil: "domcontentloaded" });
    if (!wsRes || wsRes.status() !== 200) {
      bucket.assertions.push(`/workshops returned HTTP ${wsRes?.status()}`);
    } else {
      assertSecurityHeaders(wsRes.headers(), "/workshops", bucket.assertions);
    }
    const wsImgs = await triggerLazyImagesAndCheck(auditPage);
    if (wsImgs.broken.length > 0) {
      bucket.assertions.push(`Broken images on /workshops: ${JSON.stringify(wsImgs.broken)}`);
    }
    const wsSeo = await checkPageStructureAndSeo(auditPage, {
      locale: null,
      suffix: "/workshops",
      isLocalized: false,
    });
    if (wsSeo.h1Count !== 1 || !wsSeo.title || wsSeo.overflow || !wsSeo.landmarks.hasMain) {
      bucket.assertions.push(`/workshops failed structure/SEO check: ${JSON.stringify(wsSeo)}`);
    }
    auditedRoutes.push({
      route: "/workshops",
      status: wsRes?.status() ?? 0,
      imgCount: wsImgs.total,
      htmlLang: wsSeo.htmlLang,
      h1Count: wsSeo.h1Count,
      overflow: wsSeo.overflow,
    });

    detachAudit();
    await auditCtx.close();

    // =========================================================================
    // PHASE 5: 3 INTERACTION VIDEOS (RECORD WEBM -> TRANSCODE MP4 -> CLEAN WEBM)
    // =========================================================================
    async function recordAndTranscode(mp4Filename, scenarioFn) {
      const vCtx = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: TMP_VIDEO_DIR, size: { width: 1280, height: 720 } },
      });
      await injectMonitoringScripts(vCtx);
      const vPage = await vCtx.newPage();
      const detachVid = attachRuntimeWatchers(vPage, bucket, `video:${mp4Filename}`);
      const videoObj = vPage.video();
      await scenarioFn(vPage);
      detachVid();
      await vCtx.close();
      const webmPath = await videoObj.path();
      const outMp4 = path.join(VIDEO_DIR, mp4Filename);
      transcodeToMp4(webmPath, outMp4);
      fs.rmSync(webmPath, { force: true });
      return outMp4;
    }

    const videoOutputs = [];

    // Video 1: Hero, reactive particles & portal cards
    videoOutputs.push(
      await recordAndTranscode("01-hero-and-particles.mp4", async (vp) => {
        await vp.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
        await sleep(800);
        await vp.mouse.move(420, 320);
        await vp.mouse.move(680, 290, { steps: 18 });
        await vp.mouse.move(940, 360, { steps: 18 });
        await sleep(500);
        await vp.locator("#portals").scrollIntoViewIfNeeded();
        await sleep(600);
        const cards = vp.locator("#portals button");
        const count = await cards.count();
        for (let idx = 0; idx < Math.min(count, 5); idx++) {
          await cards.nth(idx).hover();
          await sleep(300);
        }
      }),
    );

    // Video 2: Portal Dive AtlasHQ & AtlasCortex 3D Galaxy
    videoOutputs.push(
      await recordAndTranscode("02-portal-dive-atlashq-and-cortex.mp4", async (vp) => {
        await vp.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
        await vp.locator("#portals").scrollIntoViewIfNeeded();
        await sleep(500);
        await vp.locator("#portals").getByRole("button", { name: /^AtlasHQ\s*—/i }).first().click();
        await vp.locator('[role="dialog"]').waitFor({ state: "visible" });
        await sleep(900);
        await vp.locator('[role="dialog"]').getByRole("tab", { name: "Aprovação humana" }).click();
        await sleep(500);
        await vp.locator('[role="dialog"]').getByRole("button", { name: "Aprovar artefacto" }).click();
        await sleep(600);
        await vp.keyboard.press("Escape");
        await vp.locator('[role="dialog"]').waitFor({ state: "hidden" });
        await sleep(500);

        await vp.locator("#portals").getByRole("button", { name: /^AtlasCortex\s*—/i }).first().click();
        await vp.locator('[role="dialog"]').waitFor({ state: "visible" });
        await sleep(1200);
        await vp.locator('[role="dialog"]').getByRole("button", { name: /versionamento git/i }).click();
        await sleep(600);
        await vp.locator('[role="dialog"]').getByRole("button", { name: /Lista 2D acessível/i }).click();
        await sleep(600);
        await vp.locator('[role="dialog"]').getByRole("button", { name: /Vista Galaxy 3D/i }).click();
        await sleep(700);
        await vp.keyboard.press("Escape");
      }),
    );

    // Video 3: Clara & Multilingual Navigation
    videoOutputs.push(
      await recordAndTranscode("03-clara-and-multilingual-navigation.mp4", async (vp) => {
        await vp.goto(`${BASE_URL}/pt`, { waitUntil: "networkidle" });
        await sleep(600);
        await vp.getByRole("button", { name: "Falar com a Clara" }).last().click();
        const dlg = vp.locator('[role="dialog"]');
        await dlg.waitFor({ state: "visible" });
        await sleep(700);
        await dlg.getByRole("button", { name: /Diagnóstico operacional/i }).click();
        await sleep(500);
        await dlg.getByRole("button", { name: "Seguinte" }).click();
        await sleep(450);
        await dlg.getByRole("button", { name: "Seguinte" }).click();
        await sleep(450);
        await vp.keyboard.press("Escape");
        await dlg.waitFor({ state: "hidden" });
        await sleep(400);

        await vp.locator('header div[role="group"]').first().locator('a[hreflang="en"]').click();
        await vp.waitForURL(`${BASE_URL}/en`);
        await sleep(600);
        await vp.locator('header div[role="group"]').first().locator('a[hreflang="fr"]').click();
        await vp.waitForURL(`${BASE_URL}/fr`);
        await sleep(600);
        await vp.locator('header div[role="group"]').first().locator('a[hreflang="es"]').click();
        await vp.waitForURL(`${BASE_URL}/es`);
        await sleep(600);
      }),
    );

    fs.rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
    await browser.close();
    browser = null;

    // CWV Budget check (from Phase 0 clean uncontended run)
    if (cleanCwv.lcpMs === 0 || cleanCwv.lcpMs > 2500) {
      bucket.assertions.push(`LCP budget exceeded: ${cleanCwv.lcpMs}ms > 2500ms`);
    }
    if (cleanCwv.cls > 0.1) {
      bucket.assertions.push(`CLS budget exceeded: ${cleanCwv.cls} > 0.1`);
    }
    if (cleanCwv.inpMs > 200) {
      bucket.assertions.push(`INP budget exceeded: ${cleanCwv.inpMs}ms > 200ms`);
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalRoutesAudited: auditedRoutes.length,
      cwv: cleanCwv,
      swiftshaderTelemetry: swiftshaderCwv,
      portalsMetrics,
      screenshotsCaptured: fs.readdirSync(SCREENSHOT_DIR).filter((f) => f.endsWith(".png")).sort(),
      videosGenerated: videoOutputs.map((p) => ({
        file: path.basename(p),
        bytes: fs.statSync(p).size,
      })),
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors,
      failedRequests: bucket.failedRequests,
      httpErrors: bucket.httpErrors,
      cspViolations: bucket.cspViolations,
      assertions: bucket.assertions,
    };

    fs.writeFileSync(METRICS_PATH, JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));

    const totalErrors =
      bucket.consoleErrors.length +
      bucket.pageErrors.length +
      bucket.failedRequests.length +
      bucket.httpErrors.length +
      bucket.cspViolations.length +
      bucket.assertions.length;

    if (totalErrors > 0) {
      console.error(`\nQA FAILED with ${totalErrors} issues. Server logs:\n${getLogs()}`);
      process.exitCode = 1;
    } else {
      console.log("\nQA HARNESS PASSED WITH ZERO ERRORS.");
    }
  } finally {
    fs.rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
    if (browser) {
      await browser.close().catch(() => {});
    }
    stopServer(server);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
