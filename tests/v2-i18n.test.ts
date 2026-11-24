import test from "node:test";
import assert from "node:assert/strict";
import { DICTIONARIES, getDictionary, isSupportedLocale } from "../lib/v2/i18n";
import { INSTITUTIONAL_PAGE_SLUGS, LEGAL_PAGE_SLUGS, PORTAL_SLUGS } from "../lib/v2/navigation";
import { buildOrganizationJsonLd, buildPageMetadata, buildWebsiteJsonLd } from "../lib/v2/seo";
import { LOCALES, type Locale } from "../lib/v2/types";

function collectLeafKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") {
    return [prefix];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, idx) => collectLeafKeys(item, `${prefix}[${idx}]`));
  }
  return Object.entries(obj).flatMap(([key, value]) =>
    collectLeafKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

test("all four locales (pt, en, fr, es) are supported and have identical structure", () => {
  assert.deepEqual([...LOCALES], ["pt", "en", "fr", "es"]);
  const ptKeys = collectLeafKeys(DICTIONARIES.pt).filter((k) => !k.endsWith(".locale") && !k.endsWith(".htmlLang") && !k.endsWith(".ogLocale"));

  for (const locale of ["en", "fr", "es"] as Locale[]) {
    assert.equal(isSupportedLocale(locale), true);
    const dict = getDictionary(locale);
    assert.equal(dict.locale, locale);
    const keys = collectLeafKeys(dict).filter((k) => !k.endsWith(".locale") && !k.endsWith(".htmlLang") && !k.endsWith(".ogLocale"));
    assert.deepEqual(keys, ptKeys, `Key structure mismatch for locale: ${locale}`);
  }
});

test("every locale defines all 5 portals, institutional pages, and legal pages", () => {
  for (const locale of LOCALES) {
    const dict = getDictionary(locale);
    for (const portalId of PORTAL_SLUGS) {
      const portalCopy = dict.portalsSection.items[portalId];
      assert.ok(portalCopy, `${locale} missing portal copy: ${portalId}`);
      assert.equal(portalCopy.steps.length, 3);
      assert.ok(portalCopy.name.trim().length > 0);
      assert.ok(portalCopy.limitationNotice.trim().length > 0);
    }

    for (const slug of INSTITUTIONAL_PAGE_SLUGS) {
      assert.ok(dict.pages[slug], `${locale} missing institutional page: ${slug}`);
      assert.ok(dict.pages[slug].title.trim().length > 0);
      assert.ok(dict.pages[slug].lead.trim().length > 0);
    }

    for (const slug of LEGAL_PAGE_SLUGS) {
      assert.ok(dict.legalPages[slug], `${locale} missing legal page: ${slug}`);
      assert.ok(dict.legalPages[slug].sections.length > 0);
    }
  }
});

test("clara diagnostic questions strictly match lib/leads.ts schema options across all locales", () => {
  const expectedOptions: Record<string, readonly string[]> = {
    scenario: [
      "sales",
      "support",
      "retail",
      "industry",
      "realestate",
      "healthcare",
      "documents",
      "operations",
    ],
    channel: ["email", "whatsapp", "system", "manual"],
    systems: ["api", "sheets", "docs", "unknown"],
    frequency: ["low", "daily", "high"],
    approach: ["draft", "bounded", "explore"],
    model: ["managed", "build", "cobuild", "unsure"],
  };

  for (const locale of LOCALES) {
    const questions = getDictionary(locale).claraDrawer.diagnosticQuestions;
    assert.equal(questions.length, 6);
    for (const q of questions) {
      assert.deepEqual(
        q.options.map((o) => o.value),
        expectedOptions[q.id],
        `${locale} diagnostic question ${q.id} diverged from lib/leads.ts schema`,
      );
      for (const opt of q.options) {
        assert.ok(opt.label.trim().length > 0);
      }
    }
  }
});

test("SEO helpers generate localized canonical, hreflang alternates, OpenGraph, and JSON-LD", () => {
  for (const locale of LOCALES) {
    const meta = buildPageMetadata({
      locale,
      pathname: "/consulting",
      title: "Consulting",
      description: "Architecture and engineering",
    });
    assert.equal(meta.alternates?.canonical, `https://atlashub.si/${locale}/consulting`);
    const langs = meta.alternates?.languages as Record<string, string>;
    assert.equal(langs.pt, "https://atlashub.si/pt/consulting");
    assert.equal(langs.en, "https://atlashub.si/en/consulting");
    assert.equal(langs.fr, "https://atlashub.si/fr/consulting");
    assert.equal(langs.es, "https://atlashub.si/es/consulting");
    assert.equal(langs["x-default"], "https://atlashub.si/pt/consulting");

    const org = buildOrganizationJsonLd(locale);
    assert.equal(org.identifier.value, "17379237");
    const web = buildWebsiteJsonLd(locale);
    assert.equal(web.url, `https://atlashub.si/${locale}`);
  }
});
