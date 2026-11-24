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
  return buildLegalMetadata("accessibility", params);
}

export default async function AccessibilityPage({ params }: LocaleRouteParams) {
  return renderLegalRoute("accessibility", params);
}
