"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAtlasMotion } from "./MotionContext";

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  as?: "div" | "section" | "article";
}

/**
 * Lightweight IntersectionObserver viewport reveal container without MotionConfig
 * tree overhead or scroll-jacking. Keeps resting opacity at `1` so tall bands
 * and full-page captures can never stay hidden at `opacity: 0`.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  yOffset = 12,
  as = "div",
}: ScrollRevealProps) {
  const { reducedMotion } = useAtlasMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reducedMotion || revealed) {
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "80px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, revealed]);

  const Tag = as;

  if (reducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      ref={ref as never}
      style={{
        transform: revealed ? "translate3d(0, 0, 0)" : `translate3d(0, ${yOffset}px, 0)`,
        transition: `transform 420ms cubic-bezier(0.22, 1, 0.36, 1) ${Math.round(delay * 1000)}ms`,
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}

export default ScrollReveal;
