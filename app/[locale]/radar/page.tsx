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
  return buildInstitutionalMetadata("radar", params);
}

export default async function RadarPage({ params }: LocaleRouteParams) {
  return renderInstitutionalRoute("radar", params);
}
