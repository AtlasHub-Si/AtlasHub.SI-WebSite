"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Database,
  GitBranch,
  Layers3,
  Lock,
  Search,
  Sparkles,
  Table2,
} from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import {
  CORTEX_CLUSTER_META,
  CORTEX_EDGES,
  CORTEX_NODES,
  CORTEX_SAMPLE_QUERIES,
  type CortexSampleQuery,
} from "@/lib/v2/cortex-dataset";
import { PORTAL_THEME_TOKENS } from "@/lib/v2/design-tokens";
import type {
  CortexNode,
  Locale,
  LocaleDictionary,
  PortalDefinition,
  PortalLocaleCopy,
} from "@/lib/v2/types";
import { CortexGalaxy3D } from "./CortexGalaxy3D";

export interface AtlasCortexSceneProps {
  copy: PortalLocaleCopy;
  dict: LocaleDictionary;
  portal: PortalDefinition;
}

const CORTEX_LOCAL_UI: Record<
  Locale,
  {
    clearQuery: string;
    nodesMatchedSuffix: string;
    openConsultingPage: string;
    chainArrow: string;
  }
> = {
  pt: {
    clearQuery: "Limpar consulta",
    nodesMatchedSuffix: "nós em destaque",
    openConsultingPage: "Ver página AtlasCortex",
    chainArrow: "→",
  },
  en: {
    clearQuery: "Clear query",
    nodesMatchedSuffix: "highlighted nodes",
    openConsultingPage: "Open AtlasCortex page",
    chainArrow: "→",
  },
  fr: {
    clearQuery: "Effacer la requête",
    nodesMatchedSuffix: "nœuds mis en avant",
    openConsultingPage: "Ouvrir la page AtlasCortex",
    chainArrow: "→",
  },
  es: {
    clearQuery: "Limpiar consulta",
    nodesMatchedSuffix: "nodos destacados",
    openConsultingPage: "Ver página AtlasCortex",
    chainArrow: "→",
  },
};

export function AtlasCortexScene({ copy, dict, portal }: AtlasCortexSceneProps) {
  const { reducedMotion } = useAtlasMotion();
  const s = copy.sceneLabels;
  const localUi = CORTEX_LOCAL_UI[dict.locale];
  const theme = PORTAL_THEME_TOKENS.atlascortex;

  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterFilter, setClusterFilter] = useState<CortexNode["cluster"] | "all">("all");
  const [activeSampleQuery, setActiveSampleQuery] = useState<CortexSampleQuery | null>(
    CORTEX_SAMPLE_QUERIES[0],
  );
  const [selectedNode, setSelectedNode] = useState<CortexNode>(
    CORTEX_NODES.find((n) => n.id === "gov-01") ?? CORTEX_NODES[0],
  );

  const nodeMap = useMemo(() => {
    const map = new Map<string, CortexNode>();
    for (const node of CORTEX_NODES) map.set(node.id, node);
    return map;
  }, []);

  const filteredNodes = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return CORTEX_NODES.filter((node) => {
      if (clusterFilter !== "all" && node.cluster !== clusterFilter) return false;
      if (!term) return true;
      const summary = node.summary[dict.locale].toLowerCase();
      return (
        node.title.toLowerCase().includes(term) ||
        node.source.toLowerCase().includes(term) ||
        node.accessPolicy.toLowerCase().includes(term) ||
        node.classification.toLowerCase().includes(term) ||
        summary.includes(term)
      );
    });
  }, [clusterFilter, dict.locale, searchQuery]);

  const highlightedNodeIds = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredNodes.map((n) => n.id);
    }
    if (activeSampleQuery) {
      return activeSampleQuery.matchedNodeIds;
    }
    return [];
  }, [activeSampleQuery, filteredNodes, searchQuery]);

  const connectedNodes = useMemo(() => {
    const related: { node: CortexNode; relation: string }[] = [];
    for (const edge of CORTEX_EDGES) {
      if (edge.source === selectedNode.id) {
        const target = nodeMap.get(edge.target);
        if (target) related.push({ node: target, relation: edge.relation });
      } else if (edge.target === selectedNode.id) {
        const src = nodeMap.get(edge.source);
        if (src) related.push({ node: src, relation: edge.relation });
      }
    }
    return related.slice(0, 6);
  }, [nodeMap, selectedNode.id]);

  const handleSelectQuery = (q: CortexSampleQuery) => {
    setActiveSampleQuery(q);
    setClusterFilter("all");
    setSearchQuery("");
    const firstMatch = nodeMap.get(q.matchedNodeIds[0]);
    if (firstMatch) setSelectedNode(firstMatch);
  };

  const handleTriggerClara = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("atlas:open-clara", {
        detail: { path: "diagnostic", source: "atlascortex" },
      }),
    );
  };

  return (
    <div
      className="flex h-full flex-col gap-3.5 rounded-2xl border bg-[#070B14]/95 p-4 text-[#ECF4F6] md:p-5"
      style={{ borderColor: theme.border }}
    >
      {/* Top Bar: Maturity + Mandatory Permission Notice + 3D / 2D Explorer Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <MaturityBadge
            status={portal.maturity}
            label={dict.maturityLabels[portal.maturity]}
            size="sm"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C]/35 bg-[#12161F] px-3 py-0.5 text-[11px] font-medium text-[#E5C287]">
            <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{s.permissionNotice}</span>
          </span>
        </div>

        <div
          role="group"
          aria-label={copy.name}
          className="inline-flex rounded-full border border-[#A78BFA]/35 bg-[#0C1220] p-0.5"
        >
          <button
            type="button"
            aria-pressed={viewMode === "3d"}
            onClick={() => setViewMode("3d")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === "3d"
                ? "bg-[#A78BFA] text-[#080D12]"
                : "text-[#CBD5E1] hover:text-[#ECF4F6]"
            }`}
          >
            <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.view3dLabel}</span>
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "2d"}
            onClick={() => setViewMode("2d")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === "2d"
                ? "bg-[#2DD4BF] text-[#080D12]"
                : "text-[#CBD5E1] hover:text-[#ECF4F6]"
            }`}
          >
            <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.view2dLabel}</span>
          </button>
        </div>
      </div>

      {/* Query Pills + Search & Cluster Filters */}
      <div className="space-y-2.5 rounded-xl border border-[#A78BFA]/20 bg-[#0B111E]/90 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4B5FD]">
            {s.queriesTitle}
          </span>
          {activeSampleQuery || searchQuery || clusterFilter !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setActiveSampleQuery(null);
                setSearchQuery("");
                setClusterFilter("all");
              }}
              className="text-[11px] text-[#94A8B8] underline underline-offset-2 hover:text-[#ECF4F6]"
            >
              {localUi.clearQuery}
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CORTEX_SAMPLE_QUERIES.map((q) => {
            const active = activeSampleQuery?.id === q.id && !searchQuery;
            return (
              <button
                key={q.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectQuery(q)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-[#2DD4BF] bg-[#0F2A2C] text-[#ECF4F6]"
                    : "border-[#A78BFA]/25 bg-[#080D16] text-[#CBD5E1] hover:border-[#A78BFA]/60"
                }`}
              >
                <Sparkles className="h-3 w-3 text-[#2DD4BF]" aria-hidden="true" />
                <span>{s[q.labelKey]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A8B8]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) setActiveSampleQuery(null);
              }}
              placeholder={s.searchPlaceholder}
              aria-label={s.searchPlaceholder}
              className="w-full rounded-lg border border-slate-400/20 bg-[#070B12] py-1.5 pl-8 pr-3 text-xs text-[#ECF4F6] placeholder:text-[#94A8B8]"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              aria-pressed={clusterFilter === "all"}
              onClick={() => setClusterFilter("all")}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                clusterFilter === "all"
                  ? "border-[#A78BFA] bg-[#1E1635] text-[#ECF4F6]"
                  : "border-slate-400/15 bg-[#070B12] text-[#94A8B8] hover:text-[#ECF4F6]"
              }`}
            >
              {s.allClustersLabel}
            </button>
            {(
              Object.keys(CORTEX_CLUSTER_META) as Array<keyof typeof CORTEX_CLUSTER_META>
            ).map((cluster) => {
              const meta = CORTEX_CLUSTER_META[cluster];
              const active = clusterFilter === cluster;
              return (
                <button
                  key={cluster}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setClusterFilter(cluster)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                    active
                      ? "border-[#ECF4F6]/60 bg-[#17202E] text-[#ECF4F6]"
                      : "border-slate-400/15 bg-[#070B12] text-[#94A8B8] hover:text-[#ECF4F6]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: meta.colorHex }}
                  />
                  <span>{s[meta.labelKey]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeSampleQuery && !searchQuery ? (
          <div className="rounded-lg border border-[#2DD4BF]/30 bg-[#08161B] p-2.5 text-xs">
            <p className="text-[#ECF4F6]">{activeSampleQuery.answerSummary[dict.locale]}</p>
            <p className="mt-1 font-mono text-[10px] text-[#2DD4BF]">
              {activeSampleQuery.decisionOutcome[dict.locale]} ·{" "}
              {activeSampleQuery.matchedNodeIds.length} {localUi.nodesMatchedSuffix}
            </p>
          </div>
        ) : null}
      </div>

      {/* Main Split: 3D Galaxy OR Accessible 2D Table + Provenance Chain Inspector */}
      <div className="grid flex-1 items-start gap-3.5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div
            className={viewMode === "3d" ? "block h-[380px] w-full sm:h-[430px]" : "hidden"}
            aria-hidden={viewMode !== "3d"}
          >
            <CortexGalaxy3D
              nodes={CORTEX_NODES}
              selectedNodeId={selectedNode.id}
              highlightedNodeIds={highlightedNodeIds}
              activeCluster={clusterFilter}
              reducedMotion={reducedMotion}
              paused={viewMode !== "3d"}
              posterSrc={portal.posterSrc}
              altLabel={copy.name}
              fallbackNotice={s.webglFallbackLabel}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          </div>

          <div
            className={
              viewMode === "2d"
                ? "flex h-[380px] w-full flex-col overflow-hidden rounded-xl border border-[#2DD4BF]/30 bg-[#070B12] sm:h-[430px]"
                : "hidden"
            }
            aria-hidden={viewMode !== "2d"}
          >
            <div className="overflow-y-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 border-b border-slate-400/20 bg-[#0D1522] font-mono text-[10px] uppercase tracking-[0.08em] text-[#94A8B8]">
                  <tr>
                    <th scope="col" className="px-3 py-2">
                      {s.tableHeadersTitle}
                    </th>
                    <th scope="col" className="px-2.5 py-2">
                      {s.tableHeadersCluster}
                    </th>
                    <th scope="col" className="hidden px-2.5 py-2 sm:table-cell">
                      {s.tableHeadersPolicy}
                    </th>
                    <th scope="col" className="px-2.5 py-2">
                      {s.tableHeadersVersion}
                    </th>
                    <th scope="col" className="px-2.5 py-2">
                      {s.tableHeadersStatus}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400/10">
                  {filteredNodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-xs text-[#94A8B8]">
                        {s.noResultsLabel}
                      </td>
                    </tr>
                  ) : (
                    filteredNodes.map((node) => {
                      const isSelected = node.id === selectedNode.id;
                      const isMatch = highlightedNodeIds.includes(node.id);
                      const meta = CORTEX_CLUSTER_META[node.cluster];
                      return (
                        <tr
                          key={node.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-[#1A1633]"
                              : isMatch
                                ? "bg-[#0D1E22]"
                                : "hover:bg-[#0E1520]"
                          }`}
                        >
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setSelectedNode(node)}
                              className="text-left font-medium text-[#ECF4F6] underline-offset-2 hover:underline"
                            >
                              {node.title}
                            </button>
                          </td>
                          <td className="px-2.5 py-2 font-mono text-[11px]">
                            <span className="inline-flex items-center gap-1.5 text-[#CBD5E1]">
                              <span
                                aria-hidden="true"
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: meta.colorHex }}
                              />
                              {s[meta.labelKey]}
                            </span>
                          </td>
                          <td className="hidden px-2.5 py-2 text-[11px] text-[#94A8B8] sm:table-cell">
                            {node.accessPolicy}
                          </td>
                          <td className="px-2.5 py-2 font-mono text-[11px] text-[#67E8F9]">
                            {node.version}
                          </td>
                          <td className="px-2.5 py-2">
                            <MaturityBadge
                              status={node.status}
                              label={dict.maturityLabels[node.status]}
                              size="sm"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Provenance Chain Inspector + Knowledge Consulting Card */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="rounded-xl border border-[#A78BFA]/30 bg-[#0B111E]/95 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4B5FD]">
                {s.provenanceTitle}
              </p>
              <MaturityBadge
                status={selectedNode.status}
                label={dict.maturityLabels[selectedNode.status]}
                size="sm"
              />
            </div>

            <h4 className="mt-1.5 text-sm font-semibold text-[#ECF4F6]">{selectedNode.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
              {selectedNode.summary[dict.locale]}
            </p>

            {/* Provenance Chain: Source -> Classification -> Access Policy -> Version -> Decision */}
            <dl className="mt-3 space-y-1.5 rounded-lg border border-slate-400/15 bg-[#070B12] p-2.5 text-[11px]">
              <div className="flex items-start justify-between gap-2">
                <dt className="inline-flex items-center gap-1 text-[#94A8B8]">
                  <Database className="h-3 w-3 text-[#36BDD0]" aria-hidden="true" />
                  <span>{s.sourceLabel}</span>
                </dt>
                <dd className="text-right font-mono text-[#ECF4F6]">{selectedNode.source}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-[#94A8B8]">{s.classificationLabel}</dt>
                <dd className="text-right text-[#CBD5E1]">{selectedNode.classification}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="inline-flex items-center gap-1 text-[#94A8B8]">
                  <Lock className="h-3 w-3 text-[#CDA66C]" aria-hidden="true" />
                  <span>{s.accessPolicyLabel}</span>
                </dt>
                <dd className="text-right font-medium text-[#E5C287]">
                  {selectedNode.accessPolicy}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="inline-flex items-center gap-1 text-[#94A8B8]">
                  <GitBranch className="h-3 w-3 text-[#2DD4BF]" aria-hidden="true" />
                  <span>{s.versionLabel}</span>
                </dt>
                <dd className="text-right font-mono text-[#67E8F9]">
                  {selectedNode.version} · {s.updatedLabel} {selectedNode.updatedAt}
                </dd>
              </div>
            </dl>

            {/* Connected Galaxy Nodes */}
            {connectedNodes.length > 0 ? (
              <div className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#94A8B8]">
                  {s.relationsLabel}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {connectedNodes.map(({ node, relation }) => (
                    <button
                      key={`${node.id}-${relation}`}
                      type="button"
                      onClick={() => setSelectedNode(node)}
                      className="rounded-md border border-[#A78BFA]/25 bg-[#0E1627] px-2 py-1 text-left text-[11px] text-[#CBD5E1] transition-colors hover:border-[#2DD4BF] hover:text-[#ECF4F6]"
                    >
                      <span className="font-mono text-[10px] text-[#A78BFA]">{relation}</span>{" "}
                      {localUi.chainArrow} {node.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Knowledge Consulting Card */}
          <div className="rounded-xl border border-[#CDA66C]/35 bg-[#121620] p-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#E5C287]">
              {s.consultingTitle}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">{s.consultingDesc}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleTriggerClara}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C] bg-[#211A10] px-3.5 py-1.5 text-xs font-semibold text-[#F3DFB8] transition-colors hover:bg-[#2F2415]"
              >
                <span>{s.consultingCta}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <Link
                href={`/${dict.locale}/cortex`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/25 bg-[#080D16] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] hover:border-[#A78BFA] hover:text-[#ECF4F6]"
              >
                <span>{localUi.openConsultingPage}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Dataset Footer Notice */}
      <p className="text-[11px] text-[#94A8B8]">{s.syntheticNotice}</p>
    </div>
  );
}

export default AtlasCortexScene;
