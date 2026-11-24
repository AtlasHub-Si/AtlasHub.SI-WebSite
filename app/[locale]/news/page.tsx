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
  return buildInstitutionalMetadata("news", params);
}

export default async function NewsPage({ params }: LocaleRouteParams) {
  return renderInstitutionalRoute("news", params);
}
