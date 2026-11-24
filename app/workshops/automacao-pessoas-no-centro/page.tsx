import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../components/layout/SiteHeader";
import SiteFooter from "../../../components/layout/SiteFooter";
import { getDictionary } from "../../../lib/v2/i18n";

export const metadata: Metadata = {
  title: "Automação com Pessoas no Centro — Concluído",
  description:
    "Workshop LL01 encerrado. Inscrições encerradas. Conheça as próximas jornadas da AtlasHub.",
  robots: { index: true, follow: true },
};

export default function ConcluidoLL01() {
  const dict = getDictionary("pt");
  return (
    <>
      <SiteHeader locale="pt" dict={dict} />
      <main id="main-content">
        <section className="vp-hero">
          <div className="vp-wrap">
            <p className="vp-eyebrow">LL01 · AUTOMAÇÃO COM PESSOAS NO CENTRO</p>
            <div className="cro-event-completed">CONCLUÍDO · INSCRIÇÕES ENCERRADAS</div>
            <h1 className="vp-h1" style={{ marginTop: 24 }}>
              A inteligência também <em>se constrói.</em>
            </h1>
            <p className="vp-lead">
              A edição LL01, anunciada para 27 e 29 de outubro de 2026, está encerrada para novas
              inscrições. Esta página mantém o registo editorial da experiência, mas não recebe
              reservas nem emite novos pagamentos.
            </p>
            <div className="vp-actions">
              <Link href="/academy" className="vp-btn vp-btn-primary">
                Conhecer a jornada Academy →
              </Link>
              <Link href="/diagnostico" className="vp-btn vp-btn-secondary">
                Diagnosticar a minha operação ↗
              </Link>
            </div>
          </div>
        </section>

        <section className="vp-section vp-band">
          <div className="vp-wrap">
            <div className="vp-intro">
              <p className="vp-eyebrow">CONTEÚDO DA EXPERIÊNCIA</p>
              <h2 className="vp-h2">
                Da conversa com IA à <em>arquitetura agêntica.</em>
              </h2>
              <p className="vp-lead">
                O programa explorou a passagem de ferramentas isoladas para agentes com
                responsabilidades, contexto, tarefas e supervisão humana.
              </p>
            </div>
            <div className="vp-grid vp-grid-2">
              <article className="vp-card">
                <h3>A Empresa Aumentada</h3>
                <p>
                  Como integrar pessoas, dados, processos e agentes numa organização orientada a
                  resultados.
                </p>
              </article>
              <article className="vp-card">
                <h3>Construção orientada</h3>
                <p>
                  Como desenhar uma função digital, estabelecer limites e testar antes de permitir
                  ações reais.
                </p>
              </article>
            </div>
            <div className="vp-cta" style={{ marginTop: 32 }}>
              <h2 className="vp-h2">Quer continuar a construção?</h2>
              <p className="vp-lead">
                A AtlasHub está a organizar as próximas jornadas de aprendizagem e implementação.
                Consulte a Academy ou solicite um diagnóstico profissional.
              </p>
              <div className="vp-actions">
                <Link href="/academy" className="vp-btn vp-btn-primary">
                  Explorar Academy →
                </Link>
                <Link href="/diagnostico" className="vp-btn vp-btn-secondary">
                  Solicitar diagnóstico ↗
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="pt" dict={dict} />
    </>
  );
}
