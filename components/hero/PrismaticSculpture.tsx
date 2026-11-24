"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  OVERLAY_ACTIVE_EVENT,
  isOverlayCurrentlyActive,
  useAtlasMotion,
  type OverlayEventDetail,
} from "../motion/MotionContext";

export interface PrismaticSculptureProps {
  className?: string;
  size?: "hero" | "compact";
}

const HALO_MOTES = [
  { cx: 92, cy: 274, r: 2.2, color: "#E5C287", opacity: 0.85 },
  { cx: 138, cy: 176, r: 1.8, color: "#CBD5E1", opacity: 0.72 },
  { cx: 204, cy: 112, r: 2.0, color: "#36BDD0", opacity: 0.78 },
  { cx: 344, cy: 134, r: 2.1, color: "#36BDD0", opacity: 0.82 },
  { cx: 416, cy: 236, r: 2.4, color: "#E5C287", opacity: 0.86 },
  { cx: 442, cy: 332, r: 1.9, color: "#CBD5E1", opacity: 0.7 },
  { cx: 64, cy: 360, r: 1.9, color: "#CDA66C", opacity: 0.74 },
  { cx: 260, cy: 48, r: 2.4, color: "#ECF4F6", opacity: 0.9 },
] as const;

/**
 * Monumental faceted crystal-prism geometric "A" centerpiece for LivingAtlasHero.
 * Mirrors the metallic-glass refraction, warm champagne-gold horizon flare,
 * restrained cyan apex edge, and orbital particle halo of `01_portais_A_dark.png`.
 */
export function PrismaticSculpture({
  className = "",
  size = "hero",
}: PrismaticSculptureProps) {
  const uid = useId().replace(/:/g, "");
  const { reducedMotion } = useAtlasMotion();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50 });
  const haloRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const syncHaloState = (paused: boolean) => {
      if (haloRef.current) {
        haloRef.current.style.animationPlayState = paused ? "paused" : "running";
      }
    };
    syncHaloState(reducedMotion || isOverlayCurrentlyActive());

    const handleOverlay = (event: Event) => {
      const detail = (event as CustomEvent<OverlayEventDetail>).detail;
      const active =
        typeof detail === "boolean"
          ? detail
          : Boolean(detail?.active) || isOverlayCurrentlyActive();
      syncHaloState(reducedMotion || active);
    };

    window.addEventListener(OVERLAY_ACTIVE_EVENT, handleOverlay);
    return () => window.removeEventListener(OVERLAY_ACTIVE_EVENT, handleOverlay);
  }, [reducedMotion]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === "touch") {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const ny = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    setTilt({
      rx: Number((-ny * 6.5).toFixed(2)),
      ry: Number((nx * 7.5).toFixed(2)),
      px: Number(((nx + 0.5) * 100).toFixed(1)),
      py: Number(((ny + 0.5) * 100).toFixed(1)),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 });
  };

  const transformStyle: CSSProperties = reducedMotion
    ? {}
    : {
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
      };

  const dimensionClasses =
    size === "compact"
      ? "h-52 w-52 sm:h-60 sm:w-60"
      : "h-[240px] w-[240px] sm:h-[290px] sm:w-[290px] lg:h-[330px] lg:w-[330px]";

  const idLeft = `${uid}-prism-left`;
  const idRecess = `${uid}-prism-recess`;
  const idGoldBar = `${uid}-prism-goldbar`;
  const idRight = `${uid}-prism-right`;
  const idCyan = `${uid}-prism-cyan`;
  const idBaseGlow = `${uid}-prism-baseglow`;
  const idHalo = `${uid}-prism-halo`;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={`relative flex items-center justify-center select-none ${dimensionClasses} ${className}`.trim()}
    >
      {/* Atmospheric champagne-gold + cyan horizon bloom behind the sculpture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-full"
        style={{
          background: reducedMotion
            ? "radial-gradient(circle at 50% 62%, rgba(205,166,108,0.26), rgba(54,189,208,0.12) 55%, transparent 74%)"
            : `radial-gradient(circle at ${tilt.px}% ${tilt.py}%, rgba(229,194,135,0.32), rgba(54,189,208,0.14) 52%, transparent 74%)`,
        }}
      />

      {/* Fine vertical energy line linking the prismatic A baseline down to the planetary horizon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-px -translate-x-1/2 translate-y-6 bg-gradient-to-b from-[#E5C287]/80 via-[#36BDD0]/45 to-transparent"
      />

      <div
        style={transformStyle}
        className="relative h-full w-full will-change-transform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={idLeft}
              x1="100"
              y1="95"
              x2="275"
              y2="418"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#94A8B8" />
              <stop offset="28%" stopColor="#E2E8F0" />
              <stop offset="52%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#8596A8" />
            </linearGradient>

            <linearGradient
              id={idRecess}
              x1="256"
              y1="175"
              x2="195"
              y2="416"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#0B131C" />
              <stop offset="56%" stopColor="#1F2E3B" />
              <stop offset="100%" stopColor="#8A6228" />
            </linearGradient>

            <linearGradient
              id={idGoldBar}
              x1="178"
              y1="382"
              x2="372"
              y2="382"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFF0CA" />
              <stop offset="32%" stopColor="#E5C287" />
              <stop offset="72%" stopColor="#CDA66C" />
              <stop offset="100%" stopColor="#8A6228" />
            </linearGradient>

            <linearGradient
              id={idCyan}
              x1="238"
              y1="62"
              x2="370"
              y2="274"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#A6F1FA" />
              <stop offset="44%" stopColor="#36BDD0" />
              <stop offset="100%" stopColor="#1377DF" />
            </linearGradient>

            <linearGradient
              id={idRight}
              x1="276"
              y1="210"
              x2="438"
              y2="418"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#1377DF" />
              <stop offset="32%" stopColor="#475569" />
              <stop offset="68%" stopColor="#DCE6EE" />
              <stop offset="100%" stopColor="#E5C287" />
            </linearGradient>

            <radialGradient
              id={idBaseGlow}
              cx="256"
              cy="414"
              r="185"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFF2CE" stopOpacity="0.82" />
              <stop offset="35%" stopColor="#CDA66C" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#CDA66C" stopOpacity="0" />
            </radialGradient>

            <linearGradient
              id={idHalo}
              x1="40"
              y1="250"
              x2="472"
              y2="250"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#36BDD0" stopOpacity="0.08" />
              <stop offset="48%" stopColor="#E5C287" stopOpacity="0.52" />
              <stop offset="100%" stopColor="#36BDD0" stopOpacity="0.16" />
            </linearGradient>
          </defs>

          {/* Elliptical particle orbit arcs */}
          <g
            ref={haloRef}
            className={
              reducedMotion
                ? ""
                : "origin-center animate-[spin_28s_linear_infinite]"
            }
          >
            <ellipse
              cx="256"
              cy="264"
              rx="206"
              ry="94"
              transform="rotate(-14 256 264)"
              fill="none"
              stroke={`url(#${idHalo})`}
              strokeWidth="1.35"
              strokeDasharray="4 10"
            />
            <ellipse
              cx="256"
              cy="258"
              rx="184"
              ry="72"
              transform="rotate(16 256 258)"
              fill="none"
              stroke="rgba(54, 189, 208, 0.25)"
              strokeWidth="1"
              strokeDasharray="2 12"
            />
            {HALO_MOTES.map((mote, index) => (
              <circle
                key={index}
                cx={mote.cx}
                cy={mote.cy}
                r={mote.r}
                fill={mote.color}
                opacity={mote.opacity}
              />
            ))}
          </g>

          {/* Champagne Gold refraction disc along horizon baseline */}
          <ellipse
            cx="256"
            cy="414"
            rx="192"
            ry="34"
            fill={`url(#${idBaseGlow})`}
          />

          {/* Left brushed platinum-silver wing */}
          <polygon
            points="224,132 62,412 146,412 260,188"
            fill={`url(#${idLeft})`}
            stroke="#ECF4F6"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Architectural interior bevel recess */}
          <polygon
            points="260,188 146,412 184,412 276,220"
            fill={`url(#${idRecess})`}
          />

          {/* Interlocking warm Champagne Gold crossbar */}
          <polygon
            points="214,352 184,412 366,412 332,352"
            fill={`url(#${idGoldBar})`}
          />

          {/* Right metallic-glass wing */}
          <polygon
            points="256,68 224,132 366,412 450,412"
            fill={`url(#${idRight})`}
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Restrained Energy Cyan -> Atlas Blue crystalline apex facet */}
          <polygon
            points="256,68 224,132 285,252 368,262"
            fill={`url(#${idCyan})`}
            opacity="0.92"
          />

          {/* Glass internal specular facet lines */}
          <polygon
            points="256,68 294,158 224,132"
            fill="#ECF4F6"
            opacity="0.28"
          />
          <line
            x1="64"
            y1="412"
            x2="448"
            y2="412"
            stroke="#F8E7C2"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.94"
          />
          <line
            x1="256"
            y1="68"
            x2="368"
            y2="262"
            stroke="#ECF4F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.92"
          />
          {/* Apex & base corner specular pinpoints */}
          <circle cx="256" cy="68" r="5" fill="#ECF4F6" opacity="0.9" />
          <circle cx="104" cy="412" r="4" fill="#FFF2CE" opacity="0.88" />
          <circle cx="408" cy="412" r="3.5" fill="#E5C287" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}

export default PrismaticSculpture;
