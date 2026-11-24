import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { AtlasLogo } from "@/components/brand/AtlasLogo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080D12] px-6 py-16 text-[#ECF4F6]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_20%,rgba(54,189,208,0.12),transparent_70%)]"
      />
      <div className="atlas-glass relative z-10 max-w-xl rounded-2xl p-8 text-center sm:p-12">
        <div className="mb-8 flex justify-center">
          <AtlasLogo variant="dark" showTagline />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5C287]">
          HTTP 404 · ROTA NÃO ENCONTRADA
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-4xl">
          Esta coordenada não existe no ecossistema.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#94A8B8]">
          O endereço solicitado pode ter sido reorganizado para a arquitetura
          multilíngua Living Ecosystem. Utilize os atalhos abaixo para continuar a
          navegação.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/pt"
            className="inline-flex items-center gap-2 rounded-full border border-[#E5C287] bg-[#E5C287] px-5 py-2.5 text-sm font-semibold text-[#080D12] transition hover:brightness-105"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Ir para AtlasHub.SI (/pt)</span>
          </Link>
          <Link
            href="/en"
            className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/25 bg-[#172027] px-5 py-2.5 text-sm font-medium text-[#ECF4F6] transition hover:border-[#CDA66C]"
          >
            <Compass className="h-4 w-4 text-[#36BDD0]" aria-hidden="true" />
            <span>English (/en)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
