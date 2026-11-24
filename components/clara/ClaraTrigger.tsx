"use client";

import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { AtlasPrismMark } from "@/components/brand/AtlasPrismMark";
import type { LocaleDictionary } from "@/lib/v2/types";

export interface ClaraTriggerProps {
  dict: LocaleDictionary;
  onOpen?: () => void;
  className?: string;
}

/**
 * Floating bottom-right Clara concierge pill matching 01_portais_A_dark.png:
 * glowing prismatic A emblem, Clara avatar, frosted mineral glass, and champagne gold rim.
 */
export function ClaraTrigger({ dict, onOpen, className = "" }: ClaraTriggerProps) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("atlas:open-clara", {
          detail: { source: "floating-trigger" },
        }),
      );
    }
    onOpen?.();
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 ${className}`.trim()}>
      <button
        type="button"
        onClick={handleClick}
        aria-haspopup="dialog"
        aria-label={dict.claraDrawer.triggerLabel}
        className="atlas-glass-gold group relative flex items-center gap-2.5 rounded-full py-1.5 pl-2.5 pr-4 text-left text-[#ECF4F6] shadow-2xl transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C287]"
      >
        {/* Subtle prismatic A glow halo */}
        <span
          aria-hidden="true"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#36BDD0]/40 bg-[#080D12]/90 shadow-[0_0_20px_-2px_rgba(54,189,208,0.45)]"
        >
          <AtlasPrismMark size={22} variant="dark" />
        </span>

        {/* Clara circular portrait */}
        <Image
          src="/v2/clara-avatar.webp"
          alt=""
          aria-hidden="true"
          width={34}
          height={34}
          unoptimized
          loading="eager"
          decoding="async"
          className="-ml-4 h-8 w-8 shrink-0 rounded-full border border-[#E5C287]/80 object-cover shadow-md"
        />

        <span className="flex items-center gap-2 pr-0.5">
          <MessageSquare
            className="h-3.5 w-3.5 text-[#E5C287] transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold tracking-tight text-[#ECF4F6] sm:text-sm">
            {dict.claraDrawer.triggerLabel}
          </span>
        </span>
      </button>
    </div>
  );
}

export default ClaraTrigger;
