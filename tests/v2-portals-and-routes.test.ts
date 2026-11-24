import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CORTEX_EDGES,
  CORTEX_NODES,
  CORTEX_SAMPLE_QUERIES,
} from "../lib/v2/cortex-dataset";
import { getHeaderNav, V2_ROUTE_SLUGS } from "../lib/v2/navigation";
import { ATLASBOT_MASCOTS, PORTALS } from "../lib/v2/portal-data";
import { LOCALES } from "../lib/v2/types";

test("all 5 portals and verified public/v2 visual assets exist on disk", () => {
  assert.equal(PORTALS.length, 5);
  assert.deepEqual(
    PORTALS.map((p) => p.slug),
    ["atlashq", "atlasbot", "club-atlas", "atlascortex", "gwd"],
  );

  for (const portal of PORTALS) {
    assert.ok(
      existsSync(path.join("public", portal.posterSrc.replace(/^\//, ""))),
      `Missing poster asset: ${portal.posterSrc}`,
    );
    assert.ok(
      existsSync(path.join("public", portal.mobilePosterSrc.replace(/^\//, ""))),
      `Missing mobile poster asset: ${portal.mobilePosterSrc}`,
    );
  }

  for (const mascot of ATLASBOT_MASCOTS) {
    assert.ok(existsSync(path.join("public", mascot.imageSrc.replace(/^\//, ""))));
    assert.ok(existsSync(path.join("public", mascot.hdImageSrc.replace(/^\//, ""))));
  }

  for (const asset of [
    "public/v2/clara-avatar.webp",
    "public/v2/clara-portrait.webp",
    "public/v2/diana-avatar.webp",
    "public/v2/scenes/hero-cosmos.webp",
    "public/v2/scenes/hero-earth.webp",
    "public/v2/scenes/club-learner.webp",
  ]) {
    assert.ok(existsSync(asset), `Missing required asset: ${asset}`);
  }
});

test("AtlasCortex synthetic dataset covers 48-64 nodes across all 5 clusters with valid edges", () => {
  assert.ok(CORTEX_NODES.length >= 48 && CORTEX_NODES.length <= 64);
  const clusters = new Set(CORTEX_NODES.map((n) => n.cluster));
  assert.deepEqual(
    [...clusters].sort(),
    ["decisions", "gbrain", "git", "governance", "obsidian"],
  );

  const nodeIds = new Set(CORTEX_NODES.map((n) => n.id));
  for (const edge of CORTEX_EDGES) {
    assert.ok(nodeIds.has(edge.source), `Missing edge source: ${edge.source}`);
    assert.ok(nodeIds.has(edge.target), `Missing edge target: ${edge.target}`);
  }
  assert.ok(CORTEX_SAMPLE_QUERIES.length >= 4);
});

test("every V2 route slug has a page component and sitemap excludes workshops & experience", () => {
  for (const slug of V2_ROUTE_SLUGS) {
    const filePath = slug.startsWith("portals/")
      ? "app/[locale]/portals/[slug]/page.tsx"
      : `app/[locale]/${slug}/page.tsx`;
    assert.ok(existsSync(filePath), `Missing route file for ${slug}: ${filePath}`);
  }

  for (const legacyFile of [
    "app/sobre/page.tsx",
    "app/metodo/page.tsx",
    "app/diagnostico/page.tsx",
    "app/solucoes/ai-workforce/page.tsx",
    "app/solucoes/enterprise-transformation/page.tsx",
    "app/casos/page.tsx",
    "app/academy/page.tsx",
    "app/servicos/setup-agentico/page.tsx",
  ]) {
    assert.ok(existsSync(legacyFile), `Missing legacy redirect: ${legacyFile}`);
  }

  // Ensure app/fr/page.tsx does not shadow app/[locale]/page.tsx for /fr
  assert.equal(existsSync("app/fr/page.tsx"), false);

  const sitemap = readFileSync("public/sitemap.xml", "utf8");
  assert.doesNotMatch(sitemap, /workshops/);
  assert.doesNotMatch(sitemap, /experience/);
  for (const locale of LOCALES) {
    assert.match(sitemap, new RegExp(`https://atlashub\\.si/${locale}<`));
    assert.match(sitemap, new RegExp(`https://atlashub\\.si/${locale}/consulting<`));
    assert.ok(getHeaderNav(locale).length >= 5);
  }
});
