import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { MotionProvider } from "@/components/motion/MotionContext";
import { SITE_URL } from "@/lib/v2/seo";

// Self-hosted Inter variable font (SIL OFL) paired with local Manrope & JetBrains Mono.
const inter = localFont({
  src: "./inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const REDUCED_MOTION_BOOTSTRAP_SCRIPT = `(function(){try{var s=localStorage.getItem("atlas-reduced-motion");var r=s==="true"?true:s==="false"?false:window.matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.setAttribute("data-reduced-motion",r?"true":"false");}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AtlasHub.SI — Intelligence for the Augmented Enterprise",
    template: "%s · AtlasHub.SI",
  },
  description:
    "Um ecossistema vivo de pessoas, agentes e conhecimento: consultoria empresarial, arquitetura AI-First, memória organizacional e portais observáveis com governação humana.",
  icons: {
    icon: "/assets/atlashub-logo.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#080D12",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          // Synchronous pre-hydration sync for prefers-reduced-motion & user preference.
          dangerouslySetInnerHTML={{ __html: REDUCED_MOTION_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className="min-h-screen bg-[#080D12] text-[#ECF4F6] antialiased selection:bg-[#CDA66C]/30 selection:text-[#ECF4F6]">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
