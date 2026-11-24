import { AtlasPrismMark } from "./AtlasPrismMark";

export interface AtlasLogoProps {
  variant?: "dark" | "pearl";
  showTagline?: boolean;
  className?: string;
}

/**
 * Institutional AtlasHub.SI wordmark paired with the geometric Prismatic A mark.
 */
export function AtlasLogo({
  variant = "dark",
  showTagline = false,
  className = "",
}: AtlasLogoProps) {
  const isPearl = variant === "pearl";

  return (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className}`.trim()}
    >
      <AtlasPrismMark
        size={showTagline ? 36 : 30}
        variant={variant}
        className="shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-lg font-bold tracking-[-0.03em] whitespace-nowrap sm:text-[1.2rem] ${
            isPearl ? "text-[#17212B]" : "text-[#ECF4F6]"
          }`}
        >
          AtlasHub
          <span className={isPearl ? "text-[#0F5FB5]" : "text-[#36BDD0]"}>
            .SI
          </span>
        </span>
        {showTagline ? (
          <span
            className={`mt-1 text-[9.5px] font-medium uppercase tracking-[0.19em] whitespace-nowrap ${
              isPearl ? "text-[#475569]" : "text-[#94A8B8]"
            }`}
          >
            Intelligence for the Augmented Enterprise
          </span>
        ) : null}
      </span>
    </span>
  );
}

export default AtlasLogo;
