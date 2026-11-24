import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DICTIONARIES } from "../lib/v2/i18n";
import { PORTALS } from "../lib/v2/portal-data";
import {
  getPendingSocialChannels,
  getVerifiedSocialChannels,
  SOCIAL_REGISTRY,
} from "../lib/v2/social-registry";
import {
  communities_and_programs,
  technologies_used,
  verified_partnerships,
} from "../lib/v2/technology-registry";
import { LOCALES } from "../lib/v2/types";

test("zero forbidden unverified claims across all four locale dictionaries", () => {
  for (const locale of LOCALES) {
    const serialized = JSON.stringify(DICTIONARIES[locale]);
    assert.doesNotMatch(serialized, /\d+\s?%/, `${locale} contains unverified percentage`);
    assert.doesNotMatch(serialized, /24\/7/i, `${locale} contains 24/7 claim`);
    assert.doesNotMatch(serialized, /atlas[-\s]?hardness/i, `${locale} contains forbidden Atlas-Hardness typo`);
    assert.doesNotMatch(
      serialized,
      /\b(invest now|investir já|investir maintenant|invertir ya|invertir ahora)\b/i,
      `${locale} contains FCA-prohibited Invest now CTA`,
    );
  }
});

test("technology registry strictly separates stack, communities, and verified commercial partnerships", () => {
  assert.ok(technologies_used.length >= 15);
  for (const tech of technologies_used) {
    assert.ok(tech.relationshipType === "used" || tech.relationshipType === "tested");
    assert.notEqual(tech.category, "verified_partnerships");
  }

  const gcNvidia = communities_and_programs.find((e) => e.id === "google-cloud-nvidia-community");
  assert.ok(gcNvidia);
  assert.equal(gcNvidia.relationshipType, "community_member");

  const awsActivate = communities_and_programs.find((e) => e.id === "aws-activate");
  assert.ok(awsActivate);
  assert.equal(awsActivate.status, "pending");

  assert.equal(verified_partnerships.length, 0);
});

test("social registry exposes only verified GitHub and WhatsApp channels", () => {
  const verified = getVerifiedSocialChannels();
  assert.deepEqual(
    verified.map((c) => c.network).sort(),
    ["GitHub", "WhatsApp"],
  );
  assert.equal(verified.find((c) => c.network === "GitHub")?.url, "https://github.com/AtlasHub-Si");
  assert.equal(verified.find((c) => c.network === "WhatsApp")?.url, "https://wa.me/5562991903462");

  const pending = getPendingSocialChannels();
  assert.ok(pending.length >= 8);
  for (const entry of SOCIAL_REGISTRY) {
    if (entry.status !== "verified") {
      assert.equal(entry.url, null);
    }
  }
});

test("corporate disclosure separates ATLASHUB DIGITAL LTD (17379237) and Atlas Global Tech Ltd (17401190)", () => {
  for (const locale of LOCALES) {
    const dict = DICTIONARIES[locale];
    assert.match(dict.footer.corporateEntitiesNote, /17379237/);
    assert.match(dict.footer.corporateEntitiesNote, /17401190/);
    assert.match(dict.footer.corporateEntitiesNote, /ATLASHUB DIGITAL LTD/);
  }
});

test("GWD retains independent entity status and brand components never use AtlasBot mascots", () => {
  const gwd = PORTALS.find((p) => p.id === "gwd");
  assert.ok(gwd);
  assert.equal(gwd.isIndependentEntity, true);
  assert.equal(gwd.externalUrl, "https://explore.goworld.digital");

  for (const brandFile of [
    "components/brand/AtlasLogo.tsx",
    "components/brand/AtlasPrismMark.tsx",
    "components/layout/SiteHeader.tsx",
    "components/layout/SiteFooter.tsx",
  ]) {
    const src = readFileSync(brandFile, "utf8");
    assert.doesNotMatch(src, /mascots\//i, `${brandFile} must not use AtlasBot mascot`);
    assert.doesNotMatch(src, /atlas[-\s]?hardness/i, `${brandFile} must not contain historical typo`);
  }
});
