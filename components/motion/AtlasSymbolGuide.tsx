"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EyeOff } from "lucide-react";
import { AtlasPrismMark } from "../brand/AtlasPrismMark";
import { PORTAL_THEME_TOKENS } from "../../lib/v2/design-tokens";
import type { PortalId } from "../../lib/v2/types";
import { useAtlasMotion } from "./MotionContext";

export interface AtlasSymbolGuideProps {
  activePortalId?: PortalId | null;
  progressLabel?: string;
  label?: string;
  dismissLabel?: string;
  className?: string;
}

const TRANSIT_PARTICLES = Array.from({ length: 18 }, (_, index) => {
  const angle = (index / 18) * Math.PI * 2;
  const radius = 14 + (index % 3) * 6;
  return {
    id: index,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    size: index % 2 === 0 ? 2.5 : 1.8,
  };
});

/**
 * Subtle non-intrusive orientation guide: a compact geometric `A` beacon
 * that marks discovery and portal transitions with a restrained particle
 * dissolve/reintegrate transit (never blocks text or buttons and can be hidden).
 */
export function AtlasSymbolGuide({
  activePortalId = null,
  progressLabel,
  label,
  dismissLabel = "Hide orientation beacon",
  className = "",
}: AtlasSymbolGuideProps) {
  const [hidden, setHidden] = useState(false);
  const { reducedMotion } = useAtlasMotion();

  const accentHex = useMemo(() => {
    if (!activePortalId) return "#CDA66C";
    return PORTAL_THEME_TOKENS[activePortalId].accent;
  }, [activePortalId]);

  if (hidden) {
    return null;
  }

  return (
    <div
      data-atlas-symbol-guide="true"
      className={`inline-flex items-center gap-2.5 rounded-full border border-[#CBD5E1]/16 bg-[#0E151D] px-3 py-1.5 text-xs text-[#CBD5E1] ${className}`.trim()}
    >
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        {!reducedMotion ? (
          <motion.span
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: `${accentHex}66` }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${accentHex}55` }}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activePortalId ?? "ecosystem"}
            initial={reducedMotion ? false : { opacity: 0.4, scale: 0.78 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0.3, scale: 0.8 }}
            transition={{ duration: reducedMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            {!reducedMotion && activePortalId ? (
              <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                {TRANSIT_PARTICLES.map((particle) => (
                  <motion.span
                    key={particle.id}
                    initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                    animate={{
                      x: particle.x,
                      y: particle.y,
                      opacity: 0,
                      scale: 0.4,
                    }}
                    transition={{
                      duration: 0.52,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute left-1/2 top-1/2 rounded-full"
                    style={{
                      width: particle.size,
                      height: particle.size,
                      marginLeft: -particle.size / 2,
                      marginTop: -particle.size / 2,
                      backgroundColor: accentHex,
                    }}
                  />
                ))}
              </span>
            ) : null}
            <AtlasPrismMark size={16} />
          </motion.div>
        </AnimatePresence>
      </div>

      {progressLabel ? (
        <span className="font-mono text-[11px] tracking-[0.12em] text-[#ECF4F6]">
          {progressLabel}
        </span>
      ) : null}

      {label ? (
        <span className="hidden text-[11px] text-[#94A8B8] sm:inline">
          {label}
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label={dismissLabel}
        title={dismissLabel}
        className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[#94A8B8] transition-colors hover:bg-[#172027] hover:text-[#ECF4F6]"
      >
        <EyeOff className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
}

export default AtlasSymbolGuide;
