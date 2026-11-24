import type { Metadata } from "next";
import { LivingAtlasHero } from "@/components/hero/LivingAtlasHero";
import { PortalDiveStage } from "@/components/portals/PortalDiveStage";
import { ArchitectureLayersBand } from "@/components/sections/ArchitectureLayersBand";
import { ClaraInvitationBand } from "@/components/sections/ClaraInvitationBand";
import { CommunityResearchBand } from "@/components/sections/CommunityResearchBand";
import { EcosystemBridgeBand } from "@/components/sections/EcosystemBridgeBand";
import { MethodologyBand } from "@/components/sections/MethodologyBand";
import { PearlConsultingBand } from "@/components/sections/PearlConsultingBand";
import { ProofRelationsBand } from "@/components/sections/ProofRelationsBand";
import { getDictionary } from "@/lib/v2/i18n";
import { isValidLocale } from "@/lib/v2/navigation";
import { buildPageMetadata } from "@/lib/v2/seo";
import { LOCALES } from "@/lib/v2/types";
import { getValidatedLocale } from "./_lib/route-factory";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  return buildPageMetadata({ locale, pathname: "/" });
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await getValidatedLocale(params);
  const dict = getDictionary(locale);

  return (
    <>
      {/* Stage 2: Living Atlas Hero (SSR-first, Canvas 2D mineral wave + Prismatic A) */}
      <LivingAtlasHero dict={dict} />

      {/* Stage 3: Five Luminous Portals + Dive-In Theater */}
      <PortalDiveStage dict={dict} />

      {/* Stage 4: Ecosystem Bridge ("Um ecossistema, múltiplos mundos") */}
      <EcosystemBridgeBand locale={locale} dict={dict} />

      {/* Stage 5: Four AI-Native Governance Layers on Mineral Graphite */}
      <ArchitectureLayersBand dict={dict} />

      {/* Stage 6: Warm Pearl (#EDEBE5) Editorial Daylight Consulting Section */}
      <PearlConsultingBand locale={locale} dict={dict} />

      {/* Stage 7: 6-Step Execution Methodology on Warm Pearl */}
      <MethodologyBand dict={dict} />

      {/* Stage 8: Community, Genesis & Editorial Research */}
      <CommunityResearchBand locale={locale} dict={dict} />

      {/* Stage 9: Public Proof, Maturity Legend & Institutional Relations */}
      <ProofRelationsBand locale={locale} dict={dict} />

      {/* Stage 10: Clara Institutional Invitation */}
      <ClaraInvitationBand dict={dict} />
    </>
  );
}
