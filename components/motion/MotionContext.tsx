"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "atlas-reduced-motion";
const STORAGE_CHANGE_EVENT = "atlas-motion-preference-change";
export const OVERLAY_ACTIVE_EVENT = "atlas:overlay-active";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type OverlayEventDetail =
  | boolean
  | { active: boolean; source?: string };

const activeOverlaySources = new Set<string>();

/**
 * Updates the shared overlay source registry and notifies canvas/ambient listeners
 * without triggering root React context re-renders across the entire page tree.
 */
export function broadcastOverlayActive(active: boolean, source = "default"): void {
  if (typeof window === "undefined") {
    return;
  }
  if (active) {
    activeOverlaySources.add(source);
  } else {
    activeOverlaySources.delete(source);
  }
  window.dispatchEvent(
    new CustomEvent<OverlayEventDetail>(OVERLAY_ACTIVE_EVENT, {
      detail: { active: activeOverlaySources.size > 0, source },
    }),
  );
}

export function isOverlayCurrentlyActive(): boolean {
  return activeOverlaySources.size > 0;
}

export interface MotionContextValue {
  reducedMotion: boolean;
  prefersSystemReduced: boolean;
  hasManualOverride: boolean;
  overlayActive: boolean;
  toggleReducedMotion: () => void;
  setReducedMotion: (value: boolean) => void;
  resetMotionPreference: () => void;
  setOverlayActive: (active: boolean, source?: string) => void;
}

const DEFAULT_MOTION_CONTEXT: MotionContextValue = {
  reducedMotion: false,
  prefersSystemReduced: false,
  hasManualOverride: false,
  overlayActive: false,
  toggleReducedMotion: () => {},
  setReducedMotion: () => {},
  resetMotionPreference: () => {},
  setOverlayActive: broadcastOverlayActive,
};

const MotionContext = createContext<MotionContextValue>(DEFAULT_MOTION_CONTEXT);

function subscribeSystemReducedMotion(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  }
  mediaQuery.addListener(callback);
  return () => mediaQuery.removeListener(callback);
}

function getSystemReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeManualOverride(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_CHANGE_EVENT, callback);
  };
}

function getManualOverrideSnapshot(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return null;
  } catch {
    return null;
  }
}

export interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Synchronizes OS `prefers-reduced-motion` with an explicit user toggle persisted
 * in `localStorage` and mirrors `data-reduced-motion` onto `document.documentElement`.
 * Overlay pausing is broadcast directly via `OVERLAY_ACTIVE_EVENT` so opening modals
 * never triggers root-tree context re-renders.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  const prefersSystemReduced = useSyncExternalStore(
    subscribeSystemReducedMotion,
    getSystemReducedMotionSnapshot,
    () => false,
  );

  const manualOverride = useSyncExternalStore(
    subscribeManualOverride,
    getManualOverrideSnapshot,
    () => null,
  );

  const reducedMotion =
    manualOverride !== null ? manualOverride : prefersSystemReduced;

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.setAttribute(
      "data-reduced-motion",
      reducedMotion ? "true" : "false",
    );
  }, [reducedMotion]);

  const setReducedMotion = useCallback((value: boolean) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-reduced-motion",
        value ? "true" : "false",
      );
    }
    startTransition(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
      } catch {
        // Ignore restricted storage environments.
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
      }
    });
  }, []);

  const toggleReducedMotion = useCallback(() => {
    const nextValue = !reducedMotion;
    // Let urgent click frame paint immediately before full-document style/motion updates
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setReducedMotion(nextValue);
      }, 0);
    } else {
      setReducedMotion(nextValue);
    }
  }, [reducedMotion, setReducedMotion]);

  const resetMotionPreference = useCallback(() => {
    startTransition(() => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore restricted storage environments.
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
      }
    });
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({
      reducedMotion,
      prefersSystemReduced,
      hasManualOverride: manualOverride !== null,
      overlayActive: false,
      toggleReducedMotion,
      setReducedMotion,
      resetMotionPreference,
      setOverlayActive: broadcastOverlayActive,
    }),
    [
      reducedMotion,
      prefersSystemReduced,
      manualOverride,
      toggleReducedMotion,
      setReducedMotion,
      resetMotionPreference,
    ],
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

/**
 * Access current reduced-motion state and toggle controls.
 * Safe to invoke outside `MotionProvider`.
 */
export function useAtlasMotion(): MotionContextValue {
  return useContext(MotionContext);
}

export default MotionProvider;
