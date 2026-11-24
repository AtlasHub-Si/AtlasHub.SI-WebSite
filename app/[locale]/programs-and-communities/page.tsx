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
  return buildInstitutionalMetadata("programs-and-communities", params);
}

export default async function ProgramsAndCommunitiesPage({ params }: LocaleRouteParams) {
  return renderInstitutionalRoute("programs-and-communities", params);
}
