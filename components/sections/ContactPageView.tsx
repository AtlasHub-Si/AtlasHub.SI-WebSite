"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { localePath } from "@/lib/v2/navigation";
import { OFFICIAL_WHATSAPP_DISPLAY, OFFICIAL_WHATSAPP_URL } from "@/lib/v2/social-registry";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";

export interface ContactPageViewProps {
  locale: Locale;
  dict: LocaleDictionary;
  initialScenario?: string;
}

function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      Number(c) ^
      (Math.floor(Math.random() * 256) & (15 >> (Number(c) / 4)))
    ).toString(16),
  );
}

const VALID_SCENARIOS = [
  "sales",
  "support",
  "retail",
  "industry",
  "realestate",
  "healthcare",
  "documents",
  "operations",
] as const;

export function ContactPageView({
  locale,
  dict,
  initialScenario,
}: ContactPageViewProps) {
  const drawer = dict.claraDrawer;
  const page = dict.pages.contact;

  const defaultScenario =
    initialScenario && (VALID_SCENARIOS as readonly string[]).includes(initialScenario)
      ? initialScenario
      : "sales";

  const [diagnostic, setDiagnostic] = useState({
    scenario: defaultScenario,
    channel: "email",
    systems: "api",
    frequency: "daily",
    approach: "draft",
    model: "unsure",
  });

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<"contact" | "meeting" | "quote">("contact");
  const [preferredWindow, setPreferredWindow] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "fallback" | "validation">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const whatsappPrefilledHref = `${OFFICIAL_WHATSAPP_URL}?text=${encodeURIComponent(
    `AtlasHub.SI (${locale.toUpperCase()}) · ${diagnostic.scenario}/${diagnostic.channel}/${diagnostic.model}${
      name ? ` · ${name}` : ""
    }${company ? ` (${company})` : ""}`,
  )}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!consent || !name.trim() || (!email.trim() && !phone.trim())) {
      setStatus("validation");
      setErrorMessage(drawer.privacySummary);
      return;
    }

    if (intent === "meeting" && !preferredWindow.trim()) {
      setStatus("validation");
      setErrorMessage(drawer.preferredWindowLabel);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: generateUuidV4(),
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          intent,
          preferredWindow: preferredWindow.trim(),
          consent: true,
          website,
          diagnostic,
        }),
      });

      if (response.status === 202) {
        setStatus("success");
      } else {
        setStatus("fallback");
      }
    } catch {
      setStatus("fallback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#080D12] py-16 text-[#ECF4F6] sm:py-24">
      <div className="atlas-container space-y-12">
        {/* Header */}
        <header className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5C287]">
              {page.eyebrow}
            </p>
            <MaturityBadge
              status="IMPLEMENTED"
              label={dict.maturityLabels.IMPLEMENTED}
            />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-5xl">
            {page.title}
          </h1>
          <p className="text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
            {page.lead}
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Contact & Diagnostic Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="atlas-glass space-y-6 rounded-3xl p-6 sm:p-8"
            >
              <div className="space-y-1 border-b border-[#CBD5E1]/12 pb-4">
                <h2 className="font-display text-xl font-bold text-[#ECF4F6]">
                  {drawer.formTitle}
                </h2>
                <p className="text-xs leading-relaxed text-[#94A8B8]">
                  {drawer.aiDisclosure}
                </p>
              </div>

              {/* 6 Diagnostic Parameters matching lib/leads.ts */}
              <div className="grid gap-4 sm:grid-cols-2">
                {drawer.diagnosticQuestions.map((question) => (
                  <label
                    key={question.id}
                    className="block space-y-1.5 text-xs font-medium text-[#CBD5E1]"
                  >
                    <span>{question.prompt}</span>
                    <select
                      value={diagnostic[question.id]}
                      onChange={(e) =>
                        setDiagnostic((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-[#CBD5E1]/20 bg-[#080D12] px-3 py-2.5 text-sm text-[#ECF4F6]"
                    >
                      {question.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              {/* Contact Fields */}
              <div className="grid gap-4 border-t border-[#CBD5E1]/12 pt-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-xs font-medium text-[#CBD5E1]">
                  <span>{drawer.nameLabel} *</span>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1]/20 bg-[#080D12] px-3.5 py-2.5 text-sm text-[#ECF4F6]"
                  />
                </label>

                <label className="block space-y-1.5 text-xs font-medium text-[#CBD5E1]">
                  <span>{drawer.companyLabel}</span>
                  <input
                    type="text"
                    maxLength={160}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1]/20 bg-[#080D12] px-3.5 py-2.5 text-sm text-[#ECF4F6]"
                  />
                </label>

                <label className="block space-y-1.5 text-xs font-medium text-[#CBD5E1]">
                  <span>{drawer.emailLabel}</span>
                  <input
                    type="email"
                    maxLength={160}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1]/20 bg-[#080D12] px-3.5 py-2.5 text-sm text-[#ECF4F6]"
                  />
                </label>

                <label className="block space-y-1.5 text-xs font-medium text-[#CBD5E1]">
                  <span>{drawer.phoneLabel}</span>
                  <input
                    type="tel"
                    maxLength={30}
                    placeholder="+351 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1]/20 bg-[#080D12] px-3.5 py-2.5 text-sm text-[#ECF4F6]"
                  />
                </label>

                <label className="block space-y-1.5 text-xs font-medium text-[#CBD5E1]">
                  <span>{drawer.intentLabel}</span>
                  <select
                    value={intent}
                    onChange={(e) =>
                      setIntent(e.target.value as "contact" | "meeting" | "quote")
                    }
                    className="w-full rounded-xl border border-[#CBD5E1]/20 bg-[#080D12] px-3 py-2.5 text-sm text-[#ECF4F6]"
                  >
                    {drawer.intentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                {intent === "meeting" ? (
                  <label className="block space-y-1.5 text-xs font-medium text-[#CBD5E1]">
                    <span>{drawer.preferredWindowLabel} *</span>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      value={preferredWindow}
                      onChange={(e) => setPreferredWindow(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1]/20 bg-[#080D12] px-3.5 py-2.5 text-sm text-[#ECF4F6]"
                    />
                  </label>
                ) : null}
              </div>

              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="pointer-events-none fixed -left-[9999px] h-px w-px opacity-0"
              />

              {/* Consent */}
              <label className="flex items-start gap-3 rounded-xl border border-[#CBD5E1]/12 bg-[#0E151D] p-3.5 text-xs leading-relaxed text-[#CBD5E1]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#E5C287]"
                />
                <span>
                  {drawer.consentText}{" "}
                  <Link
                    href={localePath(locale, "/privacy")}
                    className="text-[#36BDD0] underline"
                  >
                    {drawer.privacyLinkLabel}
                  </Link>
                </span>
              </label>

              {/* Status Feedback */}
              {status === "validation" ? (
                <p
                  role="status"
                  className="rounded-xl border border-[#CDA66C]/45 bg-[#2A2012] px-4 py-3 text-xs text-[#F3DFB8]"
                >
                  {errorMessage}
                </p>
              ) : null}

              {status === "success" ? (
                <div
                  role="status"
                  className="space-y-2 rounded-2xl border border-emerald-400/35 bg-emerald-950/60 p-4 text-sm text-emerald-100"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    <span>{drawer.successTitle}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{drawer.successBody}</p>
                </div>
              ) : null}

              {status === "fallback" ? (
                <div
                  role="status"
                  className="space-y-3 rounded-2xl border border-[#CDA66C]/50 bg-[#172027] p-4"
                >
                  <p className="font-semibold text-[#E5C287]">
                    {drawer.fallbackTitle}
                  </p>
                  <p className="text-xs leading-relaxed text-[#CBD5E1]">
                    {drawer.fallbackBody}
                  </p>
                  <a
                    href={whatsappPrefilledHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E5C287] bg-[#E5C287] px-4 py-2 text-xs font-semibold text-[#080D12]"
                  >
                    <span>{drawer.whatsappDirect}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E5C287] bg-[#E5C287] px-6 py-3 text-sm font-semibold text-[#080D12] transition hover:brightness-105 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {submitting ? drawer.submittingLabel : drawer.submitLabel}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Direct Channels & Institutional Context */}
          <aside className="space-y-5 lg:col-span-5">
            <div className="rounded-3xl border border-[#CDA66C]/35 bg-[#0E151D] p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#36BDD0]">
                {dict.footer.verifiedChannelsLabel}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#ECF4F6]">
                WhatsApp · {OFFICIAL_WHATSAPP_DISPLAY}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                {drawer.privacySummary}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={whatsappPrefilledHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#36BDD0]/55 bg-[#172027] px-5 py-2.5 text-sm font-semibold text-[#ECF4F6] transition hover:border-[#36BDD0]"
                >
                  <MessageSquare className="h-4 w-4 text-[#36BDD0]" aria-hidden="true" />
                  <span>{drawer.whatsappDirect}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {page.highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D] p-5"
              >
                <h3 className="font-display text-base font-semibold text-[#ECF4F6]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#94A8B8]">
                  {item.body}
                </p>
              </div>
            ))}

            <div className="rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D] p-5 text-xs leading-relaxed text-[#94A8B8]">
              {dict.footer.corporateEntitiesNote}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ContactPageView;
