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
  return buildInstitutionalMetadata("projects", params);
}

export default async function ProjectsPage({ params }: LocaleRouteParams) {
  return renderInstitutionalRoute("projects", params);
}
