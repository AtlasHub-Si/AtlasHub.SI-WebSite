import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { LEGAL_PAGE_SLUGS, localePath } from "@/lib/v2/navigation";
import type { LegalPageCopy, Locale, LocaleDictionary } from "@/lib/v2/types";

export interface LegalPageViewProps {
  locale: Locale;
  dict: LocaleDictionary;
  page: LegalPageCopy;
}

export function LegalPageView({ locale, dict, page }: LegalPageViewProps) {
  return (
    <div className="bg-[#080D12] py-16 text-[#ECF4F6] sm:py-24">
      <div className="atlas-container grid gap-12 lg:grid-cols-12">
        {/* Sidebar Directory */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6 rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D] p-6">
            <Link
              href={localePath(locale, "/")}
              className="inline-flex items-center gap-2 font-mono text-xs text-[#E5C287] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.portalsSection.backToEcosystem}</span>
            </Link>
            <nav aria-label={dict.footer.columns.supportLegal}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A8B8]">
                {dict.footer.columns.supportLegal}
              </p>
              <ul className="mt-3 space-y-1.5">
                {LEGAL_PAGE_SLUGS.map((slug) => {
                  const item = dict.legalPages[slug];
                  if (!item) return null;
                  const active = slug === page.slug;
                  return (
                    <li key={slug}>
                      <Link
                        href={localePath(locale, `/${slug}`)}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                          active
                            ? "bg-[#172027] font-semibold text-[#E5C287]"
                            : "text-[#CBD5E1] hover:bg-[#172027]/60 hover:text-[#ECF4F6]"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Legal Document Body */}
        <article className="space-y-10 lg:col-span-8">
          <header className="space-y-4 border-b border-[#CBD5E1]/12 pb-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5C287]">
              {page.eyebrow}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-5xl">
              {page.title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
              {page.lead}
            </p>
          </header>

          <div className="space-y-8">
            {page.sections.map((section) => (
              <section
                key={section.heading}
                className="space-y-4 rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D]/85 p-6 sm:p-8"
              >
                <h2 className="font-display text-xl font-semibold text-[#ECF4F6] sm:text-2xl">
                  {section.heading}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-relaxed text-[#CBD5E1] sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.list?.length ? (
                  <ul className="space-y-2.5 pt-2">
                    {section.list.map((entry) => (
                      <li
                        key={entry}
                        className="flex items-start gap-2.5 text-sm text-[#ECF4F6]"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#36BDD0]"
                          aria-hidden="true"
                        />
                        <span>{entry}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

export default LegalPageView;
