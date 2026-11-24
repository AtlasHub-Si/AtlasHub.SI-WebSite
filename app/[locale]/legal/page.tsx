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
  return buildLegalMetadata("legal", params);
}

export default async function LegalPage({ params }: LocaleRouteParams) {
  return renderLegalRoute("legal", params);
}
