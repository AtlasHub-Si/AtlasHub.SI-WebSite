import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import config from "../next.config";

test("next.config.ts enforces security headers, strict TS, and approved image config", async () => {
  assert.equal(config.typescript?.ignoreBuildErrors, false);
  assert.equal(config.poweredByHeader, false);
  assert.deepEqual(config.images?.formats, ["image/avif", "image/webp"]);
  assert.deepEqual(config.images?.qualities, [75, 85, 95]);

  const headerRules = await config.headers?.();
  assert.ok(headerRules && headerRules.length > 0);
  const headers = Object.fromEntries(
    headerRules[0].headers.map((h) => [h.key, h.value]),
  );

  assert.ok(headers["Content-Security-Policy"]);
  assert.match(headers["Content-Security-Policy"], /default-src 'self'/);
  assert.match(headers["Content-Security-Policy"], /img-src 'self' data: blob:/);
  assert.match(headers["Content-Security-Policy"], /connect-src 'self'/);
  assert.match(headers["Content-Security-Policy"], /object-src 'none'/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "SAMEORIGIN");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(headers["Permissions-Policy"], /microphone=\(\)/);
});

test("ClaraConcierge never auto-opens, requires explicit consent, and isolates secrets", () => {
  const claraSrc = readFileSync("components/clara/ClaraConcierge.tsx", "utf8");
  assert.match(claraSrc, /useState\(false\)/);
  assert.match(claraSrc, /atlas:open-clara/);
  assert.match(claraSrc, /consent/);
  assert.match(claraSrc, /\/api\/lead/);
  assert.doesNotMatch(claraSrc, /LEAD_WEBHOOK_TOKEN|ARO_SERVER_KEY/i);

  const contactSrc = readFileSync("components/sections/ContactPageView.tsx", "utf8");
  assert.match(contactSrc, /required/);
  assert.match(contactSrc, /\/api\/lead/);
  assert.doesNotMatch(contactSrc, /LEAD_WEBHOOK_TOKEN|ARO_SERVER_KEY/i);
});

test("footer renders verified social links only and avoids external image CDN leaks", () => {
  const footerSrc = readFileSync("components/layout/SiteFooter.tsx", "utf8");
  assert.match(footerSrc, /getVerifiedSocialChannels/);
  assert.match(footerSrc, /getPendingSocialChannels/);

  for (const file of [
    "components/hero/LivingAtlasHero.tsx",
    "components/portals/PortalDiveStage.tsx",
    "components/sections/ClaraInvitationBand.tsx",
  ]) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(src, /https:\/\/images\.|https:\/\/cdn\./i);
  }
});
