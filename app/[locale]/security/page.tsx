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
  return buildLegalMetadata("security", params);
}

export default async function SecurityPage({ params }: LocaleRouteParams) {
  return renderLegalRoute("security", params);
}
