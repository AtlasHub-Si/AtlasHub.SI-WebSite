import type { Metadata } from "next";
import SiteHeader from "../../../../components/layout/SiteHeader";
import SiteFooter from "../../../../components/layout/SiteFooter";
import { getDictionary } from "../../../../lib/v2/i18n";
import CheckoutView from "../../../../components/CheckoutView";

export const metadata: Metadata = { title: "Pagamento · Workshop", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dict = getDictionary("pt");
  return (
    <>
      <div id="conteudo">
        <SiteHeader locale="pt" dict={dict} />
        <main id="main-content">
          <section className="vp-section" aria-label="Pagamento da inscrição">
            <div className="vp-wrap"><CheckoutView id={id} /></div>
          </section>
        </main>
      </div>
      <SiteFooter locale="pt" dict={dict} />
    </>
  );
}
