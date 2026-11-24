import { MATURITY_STYLES } from "../../lib/v2/design-tokens";
import type { MaturityStatus } from "../../lib/v2/types";

export interface MaturityBadgeProps {
  status: MaturityStatus;
  label: string;
  size?: "sm" | "md";
  surface?: "dark" | "pearl";
  className?: string;
}

/**
 * Editorial truth badge displaying verified product maturity
 * (VERIFIED | IMPLEMENTED | DEMO | PILOT | PROPOSED | HISTORICAL).
 */
export function MaturityBadge({
  status,
  label,
  size = "sm",
  surface = "dark",
  className = "",
}: MaturityBadgeProps) {
  const token = MATURITY_STYLES[status];
  const toneClasses = surface === "pearl" ? token.pearlClasses : token.darkClasses;
  const sizeClasses =
    size === "md"
      ? "px-3 py-1 text-[11px] gap-2"
      : "px-2.5 py-0.5 text-[10px] gap-1.5";

  return (
    <span
      data-maturity={status}
      className={`inline-flex items-center rounded-full border font-mono font-medium uppercase tracking-[0.12em] leading-tight whitespace-nowrap backdrop-blur-xs ${sizeClasses} ${toneClasses} ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: token.dotHex }}
      />
      <span>{label}</span>
    </span>
  );
}

export default MaturityBadge;
