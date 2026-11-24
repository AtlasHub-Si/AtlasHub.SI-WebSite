"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getPortalBySlug, PORTALS } from "@/lib/v2/portal-data";
import type {
  LocaleDictionary,
  PortalDefinition,
  PortalId,
  PortalLocaleCopy,
} from "@/lib/v2/types";

export interface PortalSceneRouterProps {
  portalId: PortalId;
  dict: LocaleDictionary;
}

interface DynamicSceneProps {
  copy: PortalLocaleCopy;
  dict: LocaleDictionary;
  portal: PortalDefinition;
}

function SceneLoadingPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="h-[380px] animate-pulse rounded-xl border border-[#CBD5E1]/12 bg-[#0E151D]/80"
    />
  );
}

const AtlasHqScene = dynamic<DynamicSceneProps>(
  () => import("./scenes/AtlasHqScene"),
  { ssr: false, loading: () => <SceneLoadingPlaceholder /> },
);

const AtlasBotScene = dynamic<DynamicSceneProps>(
  () => import("./scenes/AtlasBotScene"),
  { ssr: false, loading: () => <SceneLoadingPlaceholder /> },
);

const ClubAtlasScene = dynamic<DynamicSceneProps>(
  () => import("./scenes/ClubAtlasScene"),
  { ssr: false, loading: () => <SceneLoadingPlaceholder /> },
);

const AtlasCortexScene = dynamic<DynamicSceneProps>(
  () => import("./scenes/AtlasCortexScene"),
  { ssr: false, loading: () => <SceneLoadingPlaceholder /> },
);

const GwdScene = dynamic<DynamicSceneProps>(
  () => import("./scenes/GwdScene"),
  { ssr: false, loading: () => <SceneLoadingPlaceholder /> },
);

/**
 * Routes any PortalId to its dynamically imported interactive demonstration scene,
 * yielding one macrotask so the Portal Dive shell commits its first paint before scene hydration.
 */
export function PortalSceneRouter({ portalId, dict }: PortalSceneRouterProps) {
  const [hydratedPortalId, setHydratedPortalId] = useState<PortalId | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHydratedPortalId(portalId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [portalId]);

  if (hydratedPortalId !== portalId) {
    return <SceneLoadingPlaceholder />;
  }

  const portal = getPortalBySlug(portalId) ?? PORTALS[0];
  const copy = dict.portalsSection.items[portalId];

  switch (portalId) {
    case "atlashq":
      return <AtlasHqScene copy={copy} dict={dict} portal={portal} />;
    case "atlasbot":
      return <AtlasBotScene copy={copy} dict={dict} portal={portal} />;
    case "club-atlas":
      return <ClubAtlasScene copy={copy} dict={dict} portal={portal} />;
    case "atlascortex":
      return <AtlasCortexScene copy={copy} dict={dict} portal={portal} />;
    case "gwd":
      return <GwdScene copy={copy} dict={dict} portal={portal} />;
    default:
      return <AtlasHqScene copy={copy} dict={dict} portal={portal} />;
  }
}

export default PortalSceneRouter;
