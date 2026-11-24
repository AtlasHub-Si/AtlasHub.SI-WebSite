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
  return buildInstitutionalMetadata("technology", params);
}

export default async function TechnologyPage({ params }: LocaleRouteParams) {
  return renderInstitutionalRoute("technology", params);
}
