import type { Metadata } from "next";
import {
  buildLegalMetadata,
  buildLocaleStaticParams,
  renderLegalRoute,
  type LocaleRouteParams,
} from "../_lib/route-factory";

export function generateStaticParams() {
  return buildLocaleStaticParams();
}

export async function generateMetadata({ params }: LocaleRouteParams): Promise<Metadata> {
  return buildLegalMetadata("privacy", params);
}

export default async function PrivacyPage({ params }: LocaleRouteParams) {
  return renderLegalRoute("privacy", params);
}
