"use client";

import { useId } from "react";

export interface AtlasPrismMarkProps {
  size?: number;
  variant?: "dark" | "pearl";
  className?: string;
  title?: string;
}

/**
 * Faceted geometric prismatic "A" institutional mark for AtlasHub.SI V2.0.
 * Combines brushed platinum-silver, champagne-gold interlocking base facets,
 * and restrained energy-cyan/Atlas-blue apex optics.
 */
export function AtlasPrismMark({
  size = 32,
  variant = "dark",
  className = "",
  title,
}: AtlasPrismMarkProps) {
  const uid = useId().replace(/:/g, "");
  const isPearl = variant === "pearl";

  const idSilver = `${uid}-silver`;
  const idBevel = `${uid}-bevel`;
  const idGoldBar = `${uid}-goldbar`;
  const idCyanUpper = `${uid}-cyanupper`;
  const idRightLower = `${uid}-rightlower`;
  const idGlow = `${uid}-glow`;

  const accessibilityProps = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      className={className}
      {...accessibilityProps}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient
          id={idSilver}
          x1="110"
          y1="96"
          x2="280"
          y2="416"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={isPearl ? "#475569" : "#94A8B8"} />
          <stop offset="30%" stopColor={isPearl ? "#CBD5E1" : "#ECF4F6"} />
          <stop offset="56%" stopColor="#FFFFFF" />
          <stop offset="82%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor={isPearl ? "#64748B" : "#94A8B8"} />
        </linearGradient>

        <linearGradient
          id={idBevel}
          x1="256"
          y1="170"
          x2="195"
          y2="414"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0E151D" />
          <stop offset="55%" stopColor="#2A3947" />
          <stop offset="100%" stopColor="#7D5720" />
        </linearGradient>

        <linearGradient
          id={idGoldBar}
          x1="186"
          y1="382"
          x2="366"
          y2="382"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F8E7C2" />
          <stop offset="35%" stopColor="#E5C287" />
          <stop offset="72%" stopColor="#CDA66C" />
          <stop offset="100%" stopColor="#8A6228" />
        </linearGradient>

        <linearGradient
          id={idCyanUpper}
          x1="240"
          y1="68"
          x2="365"
          y2="270"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7DE2EE" />
          <stop offset="42%" stopColor="#36BDD0" />
          <stop offset="100%" stopColor={isPearl ? "#0F5FB5" : "#1377DF"} />
        </linearGradient>

        <linearGradient
          id={idRightLower}
          x1="275"
          y1="215"
          x2="430"
          y2="416"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={isPearl ? "#17212B" : "#1377DF"} />
          <stop offset="34%" stopColor="#475569" />
          <stop offset="72%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#E5C287" />
        </linearGradient>

        <radialGradient
          id={idGlow}
          cx="256"
          cy="414"
          r="155"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0%"
            stopColor="#CDA66C"
            stopOpacity={isPearl ? "0.26" : "0.42"}
          />
          <stop
            offset="55%"
            stopColor="#CDA66C"
            stopOpacity={isPearl ? "0.08" : "0.14"}
          />
          <stop offset="100%" stopColor="#CDA66C" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle Champagne Gold baseline refraction */}
      <ellipse cx="256" cy="414" rx="164" ry="30" fill={`url(#${idGlow})`} />

      {/* Left Brushed Platinum-Silver Wing */}
      <polygon
        points="224,132 62,412 146,412 260,188"
        fill={`url(#${idSilver})`}
        stroke={isPearl ? "#475569" : "#E2E8F0"}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Inner Architectural Recess */}
      <polygon
        points="260,188 146,412 184,412 276,220"
        fill={`url(#${idBevel})`}
      />

      {/* Champagne Gold Interlocking Crossbar */}
      <polygon
        points="214,352 184,412 366,412 332,352"
        fill={`url(#${idGoldBar})`}
      />

      {/* Right Satin Wing Silhouette */}
      <polygon
        points="256,68 224,132 366,412 450,412"
        fill={`url(#${idRightLower})`}
        stroke={isPearl ? "#334155" : "#CBD5E1"}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Restrained Energy Cyan -> Atlas Blue Upper Facet */}
      <polygon
        points="256,68 224,132 285,252 368,262"
        fill={`url(#${idCyanUpper})`}
      />

      {/* Precision Specular Edge Hairlines */}
      <line
        x1="64"
        y1="412"
        x2="448"
        y2="412"
        stroke={isPearl ? "#8A6228" : "#E5C287"}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line
        x1="256"
        y1="68"
        x2="368"
        y2="262"
        stroke="#ECF4F6"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.88"
      />
    </svg>
  );
}

export default AtlasPrismMark;
