import type { Metadata } from "next";
import { ContactPageView } from "@/components/sections/ContactPageView";
import { getDictionary } from "@/lib/v2/i18n";
import {
  buildInstitutionalMetadata,
  buildLocaleStaticParams,
  getValidatedLocale,
} from "../_lib/route-factory";

export function generateStaticParams() {
  return buildLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return buildInstitutionalMetadata("contact", params);
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scenario?: string }>;
}) {
  const locale = await getValidatedLocale(params);
  const sp = await searchParams;
  const dict = getDictionary(locale);

  return (
    <ContactPageView
      locale={locale}
      dict={dict}
      initialScenario={sp?.scenario}
    />
  );
}
