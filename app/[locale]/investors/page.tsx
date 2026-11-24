import type { Metadata } from "next";
import {
  buildInstitutionalMetadata,
  buildLocaleStaticParams,
  renderInstitutionalRoute,
  type LocaleRouteParams,
} from "../_lib/route-factory";

export function generateStaticParams() {
  return buildLocaleStaticParams();
}

export async function generateMetadata({ params }: LocaleRouteParams): Promise<Metadata> {
  return buildInstitutionalMetadata("investors", params);
}

export default async function InvestorsPage({ params }: LocaleRouteParams) {
  return renderInstitutionalRoute("investors", params);
}
