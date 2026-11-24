import type { CSSProperties, ReactNode } from "react";
import { PORTAL_THEME_TOKENS } from "../../lib/v2/design-tokens";
import type { PortalId } from "../../lib/v2/types";

export interface PortalChromaticFrameProps {
  portalId: PortalId;
  active?: boolean;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Architectural portal window container applying portal-specific chromatic border,
 * top specular rim highlight, and controlled halo lighting.
 */
export function PortalChromaticFrame({
  portalId,
  active = false,
  interactive = false,
  className = "",
  children,
}: PortalChromaticFrameProps) {
  const theme = PORTAL_THEME_TOKENS[portalId];

  const cssVars = {
    "--portal-accent": theme.accent,
    "--portal-accent-secondary": theme.accentSecondary,
    "--portal-border": theme.border,
    "--portal-border-hover": theme.borderHover,
    "--portal-glow": theme.glow,
    "--portal-glow-strong": theme.glowStrong,
    "--portal-surface-tint": theme.surfaceTint,
  } as CSSProperties;

  return (
    <div
      data-portal-id={portalId}
      data-active={active ? "true" : "false"}
      data-interactive={interactive ? "true" : "false"}
      style={cssVars}
      className={`atlas-portal-frame overflow-hidden ${className}`.trim()}
    >
      {/* Top hairline chromatic refraction */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px transition-opacity duration-300"
        style={{
          opacity: active ? 0.95 : 0.6,
          background: `linear-gradient(90deg, transparent 0%, ${theme.accent} 38%, ${theme.accentSecondary} 62%, transparent 100%)`,
        }}
      />
      {children}
    </div>
  );
}

export default PortalChromaticFrame;
