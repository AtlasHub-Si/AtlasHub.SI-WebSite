import type { Metadata } from "next";
import { Suspense } from "react";
import { MultiverseExperience } from "@/components/multiverse/MultiverseExperience";
import { getDictionary } from "@/lib/v2/i18n";
import { isValidLocale } from "@/lib/v2/navigation";
import { buildPageMetadata } from "@/lib/v2/seo";
import {
  buildLocaleStaticParams,
  getValidatedLocale,
  type LocaleRouteParams,
} from "../_lib/route-factory";

export function generateStaticParams() {
  return buildLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: LocaleRouteParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/experience",
    title: dict.multiverse.title,
    description: dict.multiverse.subtitle,
    noIndex: true,
  });
}

export default async function ExperiencePage({ params }: LocaleRouteParams) {
  const locale = await getValidatedLocale(params);
  const dict = getDictionary(locale);

  return (
    <Suspense fallback={null}>
      <MultiverseExperience dict={dict} />
    </Suspense>
  );
}
