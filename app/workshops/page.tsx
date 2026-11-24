import type { Metadata } from "next";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { getDictionary } from "../../lib/v2/i18n";
import Workshops from "../../components/Workshops";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workshops empresariais — online e em Anápolis",
  description: "Workshops online e presenciais da AtlasHub Enterprise Transformation em Anápolis.",
  alternates: { canonical: "/workshops" },
  openGraph: { type: "website", url: "/workshops", title: "Workshops empresariais — online e em Anápolis", description: "Três experiências com pessoas, IA e operações. Online e presencial em Anápolis.", images: ["/assets/cro-v2/index.webp"] },
  twitter: { card: "summary_large_image", title: "Workshops empresariais — online e em Anápolis", description: "Três experiências com pessoas, IA e operações. Online e presencial em Anápolis.", images: ["/assets/cro-v2/index.webp"] },
  robots: { index: false, follow: true },
};

export default function WorkshopsIndex() {
  const dict = getDictionary("pt");
  return (
    <>
      <div id="conteudo">
        <SiteHeader locale="pt" dict={dict} />
        <main id="main-content"><Workshops headingLevel={1} /></main>
      </div>
      <SiteFooter locale="pt" dict={dict} />
    </>
  );
}
