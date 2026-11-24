"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CORTEX_CLUSTER_META,
  CORTEX_EDGES,
  CORTEX_NODES,
} from "@/lib/v2/cortex-dataset";
import type { CortexNode } from "@/lib/v2/types";

export interface CortexGalaxy3DProps {
  nodes?: CortexNode[];
  selectedNodeId: string | null;
  highlightedNodeIds: string[];
  activeCluster: CortexNode["cluster"] | "all";
  reducedMotion: boolean;
  paused?: boolean;
  posterSrc?: string;
  altLabel: string;
  fallbackNotice: string;
  onSelectNode: (node: CortexNode) => void;
  onWebglStateChange?: (ready: boolean) => void;
}

/**
 * Client-only dynamic Three.js 3D Knowledge Galaxy for AtlasCortex.
 * Immediately renders the pre-rendered WebP poster fallback when reducedMotion
 * is active or WebGL initialization fails, shares geometries/materials cleanly,
 * pauses rAF when hidden/paused, and guarantees full GPU resource disposal.
 */
export function CortexGalaxy3D({
  nodes = CORTEX_NODES,
  selectedNodeId,
  highlightedNodeIds,
  activeCluster,
  reducedMotion,
  paused = false,
  posterSrc = "/v2/scenes/portal-atlascortex.webp",
  altLabel,
  fallbackNotice,
  onSelectNode,
  onWebglStateChange,
}: CortexGalaxy3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglReady, setWebglReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  const selectedRef = useRef<string | null>(selectedNodeId);
  const highlightedRef = useRef<Set<string>>(new Set(highlightedNodeIds));
  const clusterRef = useRef<CortexNode["cluster"] | "all">(activeCluster);
  const pausedRef = useRef<boolean>(paused);
  const onSelectRef = useRef(onSelectNode);
  const resumeLoopRef = useRef<(() => void) | null>(null);
  const pauseLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    selectedRef.current = selectedNodeId;
  }, [selectedNodeId]);

  useEffect(() => {
    highlightedRef.current = new Set(highlightedNodeIds);
  }, [highlightedNodeIds]);

  useEffect(() => {
    clusterRef.current = activeCluster;
  }, [activeCluster]);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      pauseLoopRef.current?.();
    } else {
      resumeLoopRef.current?.();
    }
  }, [paused]);

  useEffect(() => {
    onSelectRef.current = onSelectNode;
  }, [onSelectNode]);

  useEffect(() => {
    if (reducedMotion) {
      onWebglStateChange?.(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId = 0;
    let initTimer = 0;
    let cleanupFn: (() => void) | null = null;

    async function initGalaxy() {
      try {
        const THREE = await import("three");
        if (cancelled || !container) return;

        const width = Math.max(container.clientWidth, 320);
        const height = Math.max(container.clientHeight, 320);

        const renderer = new THREE.WebGLRenderer({
          antialias: (window.devicePixelRatio || 1) < 2,
          alpha: false,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x050a11, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(width, height, false);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.domElement.className = "h-full w-full block cursor-pointer outline-none";
        renderer.domElement.setAttribute("aria-label", altLabel);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050a11, 0.032);

        const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
        camera.position.set(0, 4.4, 10.6);
        camera.lookAt(0, -0.1, 0);

        const ambient = new THREE.AmbientLight(0x3a5a72, 1.6);
        scene.add(ambient);
        const coreLight = new THREE.PointLight(0x36bdd0, 34, 26);
        coreLight.position.set(0, 1.5, 0);
        scene.add(coreLight);
        const violetLight = new THREE.PointLight(0xa78bfa, 24, 24);
        violetLight.position.set(4, 3, -3);
        scene.add(violetLight);

        const galaxyGroup = new THREE.Group();
        scene.add(galaxyGroup);

        // Spiral nebula dust
        const dustCount = 420;
        const dustPositions = new Float32Array(dustCount * 3);
        const dustColors = new Float32Array(dustCount * 3);
        const cCyan = new THREE.Color(0x36bdd0);
        const cTeal = new THREE.Color(0x2dd4bf);
        const cViolet = new THREE.Color(0xa78bfa);
        const cGold = new THREE.Color(0xe5c287);

        for (let i = 0; i < dustCount; i++) {
          const arm = i % 3;
          const r = Math.pow(i / dustCount, 0.72) * 8.4 + 0.35;
          const angle = r * 1.05 + (arm * Math.PI * 2) / 3 + Math.sin(i * 6.3) * 0.4;
          const spread = (1 - r / 10.2) * 0.8 + 0.18;
          dustPositions[i * 3] = Math.cos(angle) * r + Math.sin(i * 15.1) * spread * 0.48;
          dustPositions[i * 3 + 1] = Math.cos(i * 27.3) * spread * 0.42;
          dustPositions[i * 3 + 2] = Math.sin(angle) * r + Math.cos(i * 11.7) * spread * 0.48;

          const col =
            r < 1.9
              ? cGold.clone().lerp(cCyan, 0.55)
              : arm === 0
                ? cCyan
                : arm === 1
                  ? cTeal
                  : cViolet;
          dustColors[i * 3] = col.r;
          dustColors[i * 3 + 1] = col.g;
          dustColors[i * 3 + 2] = col.b;
        }

        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
        dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
        const dustMat = new THREE.PointsMaterial({
          size: 0.085,
          vertexColors: true,
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const dustPoints = new THREE.Points(dustGeo, dustMat);
        galaxyGroup.add(dustPoints);

        // Orbital guidance rings
        const ringGeos: InstanceType<typeof THREE.TorusGeometry>[] = [];
        const ringMats: InstanceType<typeof THREE.MeshBasicMaterial>[] = [];
        for (const [radius, color, tilt] of [
          [3.6, 0x36bdd0, 0.22],
          [6.1, 0xa78bfa, -0.16],
        ] as const) {
          const rGeo = new THREE.TorusGeometry(radius, 0.018, 12, 96);
          const rMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.3,
          });
          const ring = new THREE.Mesh(rGeo, rMat);
          ring.rotation.x = Math.PI / 2 + tilt;
          galaxyGroup.add(ring);
          ringGeos.push(rGeo);
          ringMats.push(rMat);
        }

        // Shared geometry + shared cluster/state materials (8 materials total instead of 56)
        const nodeGeoBase = new THREE.OctahedronGeometry(0.19, 0);
        const clusterMaterials: Record<
          CortexNode["cluster"],
          InstanceType<typeof THREE.MeshStandardMaterial>
        > = {
          obsidian: new THREE.MeshStandardMaterial({
            color: CORTEX_CLUSTER_META.obsidian.colorHex,
            emissive: CORTEX_CLUSTER_META.obsidian.colorHex,
            emissiveIntensity: 1.15,
            metalness: 0.4,
            roughness: 0.2,
            transparent: true,
            opacity: 0.94,
          }),
          git: new THREE.MeshStandardMaterial({
            color: CORTEX_CLUSTER_META.git.colorHex,
            emissive: CORTEX_CLUSTER_META.git.colorHex,
            emissiveIntensity: 1.15,
            metalness: 0.4,
            roughness: 0.2,
            transparent: true,
            opacity: 0.94,
          }),
          gbrain: new THREE.MeshStandardMaterial({
            color: CORTEX_CLUSTER_META.gbrain.colorHex,
            emissive: CORTEX_CLUSTER_META.gbrain.colorHex,
            emissiveIntensity: 1.15,
            metalness: 0.4,
            roughness: 0.2,
            transparent: true,
            opacity: 0.94,
          }),
          governance: new THREE.MeshStandardMaterial({
            color: CORTEX_CLUSTER_META.governance.colorHex,
            emissive: CORTEX_CLUSTER_META.governance.colorHex,
            emissiveIntensity: 1.15,
            metalness: 0.4,
            roughness: 0.2,
            transparent: true,
            opacity: 0.94,
          }),
          decisions: new THREE.MeshStandardMaterial({
            color: CORTEX_CLUSTER_META.decisions.colorHex,
            emissive: CORTEX_CLUSTER_META.decisions.colorHex,
            emissiveIntensity: 1.15,
            metalness: 0.4,
            roughness: 0.2,
            transparent: true,
            opacity: 0.94,
          }),
        };

        const highlightedMat = new THREE.MeshStandardMaterial({
          color: 0xf3dfb8,
          emissive: 0xe5c287,
          emissiveIntensity: 1.85,
          metalness: 0.45,
          roughness: 0.15,
          transparent: true,
          opacity: 0.98,
        });

        const selectedMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0x67e8f9,
          emissiveIntensity: 2.3,
          metalness: 0.35,
          roughness: 0.1,
          transparent: true,
          opacity: 1,
        });

        const dimmedMat = new THREE.MeshStandardMaterial({
          color: 0x475569,
          emissive: 0x1e293b,
          emissiveIntensity: 0.45,
          metalness: 0.3,
          roughness: 0.4,
          transparent: true,
          opacity: 0.4,
        });

        const nodeMeshes: InstanceType<typeof THREE.Mesh>[] = [];
        const nodeByMesh = new Map<string, CortexNode>();
        const nodeMap = new Map<string, CortexNode>();

        for (const node of nodes) {
          nodeMap.set(node.id, node);
          const mesh = new THREE.Mesh(nodeGeoBase, clusterMaterials[node.cluster]);
          mesh.position.set(node.x, node.y, node.z);
          mesh.userData.nodeId = node.id;
          galaxyGroup.add(mesh);
          nodeMeshes.push(mesh);
          nodeByMesh.set(mesh.uuid, node);
        }

        // Synaptic edges (base + highlighted overlay)
        const baseLinePositions: number[] = [];
        for (const edge of CORTEX_EDGES) {
          const src = nodeMap.get(edge.source);
          const dst = nodeMap.get(edge.target);
          if (!src || !dst) continue;
          baseLinePositions.push(src.x, src.y, src.z, dst.x, dst.y, dst.z);
        }
        const baseEdgeGeo = new THREE.BufferGeometry();
        baseEdgeGeo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(baseLinePositions, 3),
        );
        const baseEdgeMat = new THREE.LineBasicMaterial({
          color: 0x4fd1e5,
          transparent: true,
          opacity: 0.22,
        });
        const baseEdgeSegments = new THREE.LineSegments(baseEdgeGeo, baseEdgeMat);
        galaxyGroup.add(baseEdgeSegments);

        const activeEdgeGeo = new THREE.BufferGeometry();
        const activeEdgePositions = new Float32Array(CORTEX_EDGES.length * 6);
        activeEdgeGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(activeEdgePositions, 3),
        );
        activeEdgeGeo.setDrawRange(0, 0);
        const activeEdgeMat = new THREE.LineBasicMaterial({
          color: 0xe5c287,
          transparent: true,
          opacity: 0.92,
        });
        const activeEdgeSegments = new THREE.LineSegments(activeEdgeGeo, activeEdgeMat);
        galaxyGroup.add(activeEdgeSegments);

        container.innerHTML = "";
        container.appendChild(renderer.domElement);
        setWebglReady(true);
        setWebglFailed(false);
        onWebglStateChange?.(true);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(-9, -9);
        let isDragging = false;
        let dragMoved = false;
        let prevX = 0;
        let prevY = 0;
        let targetRotY = 0.15;
        let targetRotX = 0.04;
        let isTabHidden = document.visibilityState === "hidden";

        const updatePointer = (ev: PointerEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const handlePointerDown = (ev: PointerEvent) => {
          isDragging = true;
          dragMoved = false;
          prevX = ev.clientX;
          prevY = ev.clientY;
          updatePointer(ev);
        };

        const handlePointerMove = (ev: PointerEvent) => {
          if (pausedRef.current) return;
          updatePointer(ev);
          if (isDragging) {
            const dx = ev.clientX - prevX;
            const dy = ev.clientY - prevY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
            targetRotY += dx * 0.0055;
            targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX + dy * 0.0035));
            prevX = ev.clientX;
            prevY = ev.clientY;
            return;
          }

          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(nodeMeshes, false);
          if (hits.length > 0) {
            const hitNode = nodeByMesh.get(hits[0].object.uuid);
            setHoveredTitle(hitNode ? hitNode.title : null);
          } else {
            setHoveredTitle(null);
          }
        };

        const handlePointerUp = (ev: PointerEvent) => {
          if (!isDragging) return;
          isDragging = false;
          if (!dragMoved && !pausedRef.current) {
            updatePointer(ev);
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(nodeMeshes, false);
            if (hits.length > 0) {
              const hitNode = nodeByMesh.get(hits[0].object.uuid);
              if (hitNode) onSelectRef.current(hitNode);
            }
          }
        };

        const handleResize = () => {
          if (!container || pausedRef.current) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (w < 100 || h < 100) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        };

        let lastTime = performance.now();
        let loopRunning = false;
        let throttleTimer = 0;

        const pauseLoop = () => {
          loopRunning = false;
          if (throttleTimer) {
            window.clearTimeout(throttleTimer);
            throttleTimer = 0;
          }
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        };

        const scheduleNextFrame = (renderElapsedMs: number) => {
          if (cancelled || pausedRef.current) {
            loopRunning = false;
            return;
          }
          if (renderElapsedMs > 35) {
            throttleTimer = window.setTimeout(() => {
              throttleTimer = 0;
              if (!cancelled && !pausedRef.current) {
                rafId = requestAnimationFrame(animate);
              } else {
                loopRunning = false;
              }
            }, 70);
          } else {
            rafId = requestAnimationFrame(animate);
          }
        };

        const animate = (now: number) => {
          if (cancelled || pausedRef.current) {
            loopRunning = false;
            return;
          }
          if (isTabHidden) {
            lastTime = now;
            scheduleNextFrame(0);
            return;
          }

          const dt = Math.min((now - lastTime) / 1000, 0.05);
          lastTime = now;

          if (!isDragging) {
            targetRotY += dt * 0.085;
          }
          galaxyGroup.rotation.y += (targetRotY - galaxyGroup.rotation.y) * 0.08;
          galaxyGroup.rotation.x += (targetRotX - galaxyGroup.rotation.x) * 0.08;

          const activeSet = highlightedRef.current;
          const selectedId = selectedRef.current;
          const clusterFilter = clusterRef.current;
          const hasFilter = activeSet.size > 0 || clusterFilter !== "all";

          for (let i = 0; i < nodeMeshes.length; i++) {
            const mesh = nodeMeshes[i];
            const node = nodeByMesh.get(mesh.uuid);
            if (!node) continue;

            const isSelected = selectedId === node.id;
            const isHighlighted =
              activeSet.has(node.id) ||
              (clusterFilter !== "all" && node.cluster === clusterFilter);

            const targetScale = isSelected ? 1.95 : isHighlighted ? 1.45 : hasFilter ? 0.72 : 1.0;
            mesh.scale.setScalar(mesh.scale.x + (targetScale - mesh.scale.x) * 0.14);
            mesh.rotation.y += dt * (isSelected ? 1.5 : 0.4);

            const desiredMat = isSelected
              ? selectedMat
              : isHighlighted
                ? highlightedMat
                : hasFilter
                  ? dimmedMat
                  : clusterMaterials[node.cluster];
            if (mesh.material !== desiredMat) {
              mesh.material = desiredMat;
            }
          }

          // Update highlighted synaptic edges
          let activeVertCount = 0;
          const posAttr = activeEdgeGeo.getAttribute("position") as InstanceType<
            typeof THREE.BufferAttribute
          >;
          const posArr = posAttr.array as Float32Array;
          for (const edge of CORTEX_EDGES) {
            const relevant =
              edge.source === selectedId ||
              edge.target === selectedId ||
              activeSet.has(edge.source) ||
              activeSet.has(edge.target);
            if (!relevant) continue;
            const src = nodeMap.get(edge.source);
            const dst = nodeMap.get(edge.target);
            if (!src || !dst) continue;
            const base = activeVertCount * 3;
            posArr[base] = src.x;
            posArr[base + 1] = src.y;
            posArr[base + 2] = src.z;
            posArr[base + 3] = dst.x;
            posArr[base + 4] = dst.y;
            posArr[base + 5] = dst.z;
            activeVertCount += 2;
          }
          posAttr.needsUpdate = true;
          activeEdgeGeo.setDrawRange(0, activeVertCount);
          baseEdgeMat.opacity = hasFilter || selectedId ? 0.12 : 0.24;

          const renderStart = performance.now();
          renderer.render(scene, camera);
          const renderElapsed = performance.now() - renderStart;
          scheduleNextFrame(renderElapsed);
        };

        const startLoop = () => {
          if (cancelled || pausedRef.current || loopRunning) return;
          handleResize();
          lastTime = performance.now();
          loopRunning = true;
          rafId = requestAnimationFrame(animate);
        };

        pauseLoopRef.current = pauseLoop;
        resumeLoopRef.current = startLoop;

        const handleVisibility = () => {
          isTabHidden = document.visibilityState === "hidden";
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        renderer.domElement.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("visibilitychange", handleVisibility);

        if (!pausedRef.current) {
          startLoop();
        } else {
          renderer.render(scene, camera);
        }

        cleanupFn = () => {
          pauseLoopRef.current = null;
          resumeLoopRef.current = null;
          pauseLoop();
          resizeObserver.disconnect();
          renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerup", handlePointerUp);
          document.removeEventListener("visibilitychange", handleVisibility);

          dustGeo.dispose();
          dustMat.dispose();
          nodeGeoBase.dispose();
          for (const mat of Object.values(clusterMaterials)) mat.dispose();
          highlightedMat.dispose();
          selectedMat.dispose();
          dimmedMat.dispose();
          for (const g of ringGeos) g.dispose();
          for (const m of ringMats) m.dispose();
          baseEdgeGeo.dispose();
          baseEdgeMat.dispose();
          activeEdgeGeo.dispose();
          activeEdgeMat.dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        };
      } catch {
        if (!cancelled) {
          setWebglFailed(true);
          setWebglReady(false);
          onWebglStateChange?.(false);
        }
      }
    }

    initTimer = window.setTimeout(() => {
      if (!cancelled) {
        initGalaxy();
      }
    }, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(initTimer);
      cancelAnimationFrame(rafId);
      cleanupFn?.();
    };
  }, [altLabel, nodes, onWebglStateChange, reducedMotion]);

  const activeWebgl = webglReady && !reducedMotion && !webglFailed;
  const showFallback = !activeWebgl;

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-[#A78BFA]/30 bg-[#050A11] sm:h-[430px]">
      {/* Immediate poster backdrop for instant LCP and reduced-motion / WebGL fallback */}
      <Image
        src={posterSrc}
        alt={altLabel}
        fill
        unoptimized
        preload
        loading="eager"
        decoding="sync"
        sizes="(max-width: 1024px) 100vw, 45vw"
        className={`object-cover transition-opacity duration-500 ${
          activeWebgl ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />

      {/* Live WebGL Mount */}
      {!reducedMotion && !webglFailed ? (
        <div
          ref={containerRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden={!activeWebgl}
        />
      ) : null}

      {/* Hover node tooltip inside 3D stage */}
      {hoveredTitle && activeWebgl ? (
        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md border border-[#A78BFA]/45 bg-[#080D12]/90 px-2.5 py-1 font-mono text-xs text-[#ECF4F6] shadow-lg">
          {hoveredTitle}
        </div>
      ) : null}

      {/* Fallback status pill when WebGL unavailable or reduced motion active */}
      {showFallback && (reducedMotion || webglFailed) ? (
        <div className="absolute bottom-3 left-3 right-3 z-10 rounded-lg border border-slate-400/25 bg-[#080D12]/92 px-3 py-2 text-xs text-[#CBD5E1]">
          {fallbackNotice}
        </div>
      ) : null}
    </div>
  );
}

export default CortexGalaxy3D;
