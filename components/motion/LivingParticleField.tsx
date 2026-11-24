"use client";

import { useEffect, useRef } from "react";
import {
  OVERLAY_ACTIVE_EVENT,
  isOverlayCurrentlyActive,
  useAtlasMotion,
  type OverlayEventDetail,
} from "./MotionContext";

export interface LivingParticleFieldProps {
  className?: string;
  density?: "hero" | "ambient";
  interactive?: boolean;
}

interface MineralParticle {
  u: number;
  band: number;
  baseYRatio: number;
  amp: number;
  freq: number;
  phase: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}

interface RippleWave {
  x: number;
  y: number;
  startedAt: number;
  duration: number;
  maxRadius: number;
}

const MINERAL_COLORS = [
  "#CDA66C", // Champagne Gold
  "#E5C287", // Bright Champagne Gold
  "#CBD5E1", // Platinum Silver
  "#ECF4F6", // Light Mineral Ink
  "#36BDD0", // Restrained Energy Cyan
] as const;

const ATTRACTION_RADIUS = 100;

function seededUnit(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createParticles(count: number): MineralParticle[] {
  const particles: MineralParticle[] = [];
  for (let i = 0; i < count; i += 1) {
    const r1 = seededUnit(i, 1);
    const r2 = seededUnit(i, 2);
    const r3 = seededUnit(i, 3);
    const r4 = seededUnit(i, 4);
    const r5 = seededUnit(i, 5);

    const band = i % 3;
    const colorPick =
      r5 < 0.38
        ? MINERAL_COLORS[0]
        : r5 < 0.56
          ? MINERAL_COLORS[1]
          : r5 < 0.78
            ? MINERAL_COLORS[2]
            : r5 < 0.88
              ? MINERAL_COLORS[3]
              : MINERAL_COLORS[4];

    const baseYRatio =
      band === 0
        ? 0.64 + (r2 - 0.5) * 0.16
        : band === 1
          ? 0.74 + (r2 - 0.5) * 0.18
          : 0.84 + (r2 - 0.5) * 0.14;

    particles.push({
      u: (i + r1 * 0.85) / count,
      band,
      baseYRatio,
      amp: 14 + r3 * 28,
      freq: 1.6 + band * 0.7 + r4 * 0.8,
      phase: r1 * Math.PI * 2 + band * 1.4,
      speed: (0.18 + r3 * 0.24) * (band === 1 ? -1 : 1),
      size: 0.9 + r4 * 1.5,
      alpha: 0.24 + r3 * 0.54,
      color: colorPick,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
    });
  }
  return particles;
}

/**
 * Performant Canvas 2D mineral wave particle field inspired by `01_portais_A_dark.png`.
 * Subscribes directly to `OVERLAY_ACTIVE_EVENT` without root-context re-renders,
 * defers resume/resize to post-paint timers/rAF so motion toggles stay <100ms INP,
 * pauses on hidden tabs and off-screen scroll, and renders a serene static
 * constellation when `reducedMotion === true`.
 */
export function LivingParticleField({
  className = "",
  density = "hero",
  interactive = true,
}: LivingParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reducedMotion } = useAtlasMotion();

  const reducedMotionRef = useRef(reducedMotion);
  const overlayActiveRef = useRef(false);
  const syncPlaybackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    let rafHandle: number | null = null;
    const delayMs = reducedMotion ? 0 : 80;
    const timeoutId = window.setTimeout(() => {
      rafHandle = window.requestAnimationFrame(() => {
        syncPlaybackRef.current?.();
      });
    }, delayMs);
    return () => {
      window.clearTimeout(timeoutId);
      if (rafHandle !== null) {
        window.cancelAnimationFrame(rafHandle);
      }
    };
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: MineralParticle[] = [];
    let rafId: number | null = null;
    let initRafId: number | null = null;
    let overlayTimerId: number | null = null;
    let isInViewport = true;
    let isTabVisible =
      typeof document === "undefined" || document.visibilityState !== "hidden";

    overlayActiveRef.current = isOverlayCurrentlyActive();
    const localSources = new Set<string>();

    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const ripples: RippleWave[] = [];
    let lastRippleAt = 0;
    const startTime = performance.now();

    const getTargetCount = (viewportWidth: number) => {
      if (density === "ambient") {
        return viewportWidth < 768 ? 48 : 130;
      }
      return viewportWidth < 768 ? 80 : 240;
    };

    const drawFrame = (timeSec: number, animatePhysics: boolean) => {
      if (width === 0 || height === 0) {
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle mineral contour wave filaments beneath the particles
      const waveCount = 3;
      for (let w = 0; w < waveCount; w += 1) {
        ctx.beginPath();
        const baseY = height * (0.64 + w * 0.1);
        const step = Math.max(24, width / 32);
        for (let x = 0; x <= width + step; x += step) {
          const normX = x / Math.max(width, 1);
          const waveY =
            baseY +
            Math.sin(
              normX * Math.PI * (2.2 + w * 0.5) +
                timeSec * (0.28 + w * 0.08) +
                w * 1.3,
            ) *
              (16 + w * 6) +
            Math.cos(normX * Math.PI * 4.1 - timeSec * 0.16) * 7;
          if (x === 0) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }
        ctx.strokeStyle =
          w === 2 ? "rgba(54, 189, 208, 0.07)" : "rgba(205, 166, 108, 0.09)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const nowMs = performance.now();
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const ripple = ripples[i];
        const progress = (nowMs - ripple.startedAt) / ripple.duration;
        if (progress >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const radius = progress * ripple.maxRadius;
        const opacity = (1 - progress) * 0.34;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(229, 194, 135, ${opacity.toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const homeX = p.u * width;
        const homeY =
          height * p.baseYRatio +
          Math.sin(p.u * Math.PI * p.freq + p.phase + timeSec * p.speed) *
            p.amp +
          Math.cos(p.u * Math.PI * (p.freq * 1.7) - timeSec * 0.22 + p.band) *
            (p.amp * 0.32);

        let boost = 0;

        if (animatePhysics) {
          let fx = 0;
          let fy = 0;

          if (interactive && pointer.active) {
            const dx = pointer.x - (homeX + p.dx);
            const dy = pointer.y - (homeY + p.dy);
            const dist = Math.hypot(dx, dy);
            if (dist > 0.5 && dist < ATTRACTION_RADIUS) {
              const force = (1 - dist / ATTRACTION_RADIUS) * 0.82;
              fx += (dx / dist) * force * 3.1;
              fy += (dy / dist) * force * 3.1;
              boost = Math.max(boost, (1 - dist / ATTRACTION_RADIUS) * 0.38);
            }
          }

          for (let rIdx = 0; rIdx < ripples.length; rIdx += 1) {
            const ripple = ripples[rIdx];
            const progress = (nowMs - ripple.startedAt) / ripple.duration;
            const ringRadius = progress * ripple.maxRadius;
            const rx = homeX + p.dx - ripple.x;
            const ry = homeY + p.dy - ripple.y;
            const dist = Math.hypot(rx, ry);
            const delta = Math.abs(dist - ringRadius);
            if (dist > 1 && delta < 32) {
              const waveForce = (1 - delta / 32) * (1 - progress) * 2.8;
              fx += (rx / dist) * waveForce;
              fy += (ry / dist) * waveForce;
              boost = Math.max(boost, (1 - delta / 32) * 0.42);
            }
          }

          p.vx = (p.vx + fx - p.dx * 0.055) * 0.84;
          p.vy = (p.vy + fy - p.dy * 0.055) * 0.84;
          p.dx += p.vx;
          p.dy += p.vy;
        } else {
          p.dx = 0;
          p.dy = 0;
          p.vx = 0;
          p.vy = 0;
        }

        const x = homeX + p.dx;
        const y = homeY + p.dy;

        const textZoneFade =
          x < width * 0.48 && y < height * 0.56 ? 0.48 : 1;
        const finalAlpha = Math.min(0.95, (p.alpha + boost) * textZoneFade);

        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size + boost * 1.1, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 1.85 || boost > 0.16) {
          ctx.globalAlpha = finalAlpha * 0.24;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 2.6 + boost * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    const stopLoop = () => {
      if (initRafId !== null) {
        cancelAnimationFrame(initRafId);
        initRafId = null;
      }
      if (overlayTimerId !== null) {
        window.clearTimeout(overlayTimerId);
        overlayTimerId = null;
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const tick = (now: number) => {
      if (
        reducedMotionRef.current ||
        overlayActiveRef.current ||
        !isTabVisible ||
        !isInViewport
      ) {
        rafId = null;
        return;
      }
      const elapsedSec = (now - startTime) * 0.001;
      drawFrame(elapsedSec, true);
      rafId = requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (reducedMotionRef.current) {
        stopLoop();
        drawFrame(0, false);
        return;
      }
      if (overlayActiveRef.current || !isTabVisible || !isInViewport) {
        stopLoop();
        return;
      }
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    syncPlaybackRef.current = ensureLoop;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = getTargetCount(width);
      if (particles.length !== targetCount) {
        particles = createParticles(targetCount);
      }

      drawFrame(0, false);
    };

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState !== "hidden";
      ensureLoop();
    };

    const handleOverlayEvent = (event: Event) => {
      const detail = (event as CustomEvent<OverlayEventDetail>).detail;
      if (typeof detail === "boolean") {
        if (detail) {
          localSources.add("default");
        } else {
          localSources.delete("default");
        }
        overlayActiveRef.current = localSources.size > 0;
      } else if (detail && typeof detail.active === "boolean") {
        const key = detail.source || "default";
        if (detail.active) {
          localSources.add(key);
        } else {
          localSources.delete(key);
        }
        overlayActiveRef.current =
          localSources.size > 0 || isOverlayCurrentlyActive();
      }

      if (overlayActiveRef.current) {
        stopLoop();
      } else {
        if (overlayTimerId !== null) {
          window.clearTimeout(overlayTimerId);
        }
        overlayTimerId = window.setTimeout(() => {
          overlayTimerId = null;
          ensureLoop();
        }, 80);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotionRef.current || overlayActiveRef.current || !interactive) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        pointer.active = false;
        return;
      }
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotionRef.current || overlayActiveRef.current || !interactive) {
        return;
      }
      const now = performance.now();
      if (now - lastRippleAt < 180) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        return;
      }

      lastRippleAt = now;
      if (ripples.length >= 4) {
        ripples.shift();
      }
      ripples.push({
        x,
        y,
        startedAt: now,
        duration: 620,
        maxRadius: 150,
      });
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => resize())
        : null;
    resizeObserver?.observe(canvas);

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              isInViewport = entry ? entry.isIntersecting : true;
              ensureLoop();
            },
            { threshold: 0.02 },
          )
        : null;
    intersectionObserver?.observe(canvas);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(OVERLAY_ACTIVE_EVENT, handleOverlayEvent);
    if (interactive) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerdown", handlePointerDown, { passive: true });
      window.addEventListener("blur", handlePointerLeave);
    }

    initRafId = window.requestAnimationFrame(() => {
      initRafId = null;
      resize();
      ensureLoop();
    });

    return () => {
      syncPlaybackRef.current = null;
      stopLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(OVERLAY_ACTIVE_EVENT, handleOverlayEvent);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, [density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-particle-field={density}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={`pointer-events-none block h-full w-full ${className}`.trim()}
    />
  );
}

export default LivingParticleField;
