"use client";

import { useEffect, useRef } from "react";
import { PORTALS } from "../../lib/v2/portal-data";
import type { PortalId } from "../../lib/v2/types";

export interface MultiverseThreeCanvasProps {
  activePortalId: PortalId;
  onSelectPortal: (portalId: PortalId) => void;
  onActivatePortal: (portalId: PortalId) => void;
  onWebglUnavailable: () => void;
  paused?: boolean;
  className?: string;
}

const PORTAL_ARC_POSITIONS: {
  x: number;
  y: number;
  z: number;
  rotY: number;
}[] = [
  { x: -6.2, y: 0.35, z: -0.9, rotY: 0.38 },
  { x: -3.2, y: 0.45, z: -2.2, rotY: 0.18 },
  { x: 0.0, y: 0.55, z: -2.85, rotY: 0.0 },
  { x: 3.2, y: 0.45, z: -2.2, rotY: -0.18 },
  { x: 6.2, y: 0.35, z: -0.9, rotY: -0.38 },
];

/**
 * Client-only Three.js orbital Multiverse stage matching `05_multiverse_exploration.png`.
 * Renders 5 tall glowing portal monoliths + central geometric "A" above the planetary
 * horizon, with click raycasting, visibilitychange pausing, and complete GPU disposal.
 */
export function MultiverseThreeCanvas({
  activePortalId,
  onSelectPortal,
  onActivatePortal,
  onWebglUnavailable,
  paused = false,
  className = "",
}: MultiverseThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activePortalRef = useRef<PortalId>(activePortalId);
  const onSelectRef = useRef(onSelectPortal);
  const onActivateRef = useRef(onActivatePortal);
  const onUnavailableRef = useRef(onWebglUnavailable);
  const pausedRef = useRef(paused);

  useEffect(() => {
    activePortalRef.current = activePortalId;
    onSelectRef.current = onSelectPortal;
    onActivateRef.current = onActivatePortal;
    onUnavailableRef.current = onWebglUnavailable;
    pausedRef.current = paused;
  }, [
    activePortalId,
    onSelectPortal,
    onActivatePortal,
    onWebglUnavailable,
    paused,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cleanupHandlers: (() => void) | null = null;

    const init = async () => {
      try {
        const probeCanvas = document.createElement("canvas");
        const gl =
          probeCanvas.getContext("webgl2") ||
          probeCanvas.getContext("webgl") ||
          probeCanvas.getContext("experimental-webgl");

        if (!gl) {
          onUnavailableRef.current();
          return;
        }

        const THREE = await import("three");
        if (cancelled || !containerRef.current) return;

        const width = Math.max(container.clientWidth, 320);
        const height = Math.max(container.clientHeight, 320);

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.domElement.className = "block h-full w-full outline-none";
        renderer.domElement.setAttribute("aria-hidden", "true");

        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        const disposables: { dispose: () => void }[] = [];
        const track = <T extends { dispose: () => void }>(item: T): T => {
          disposables.push(item);
          return item;
        };

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060b13);
        scene.fog = new THREE.FogExp2(0x060b13, 0.028);

        const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 140);
        camera.position.set(0, 2.0, 11.4);
        camera.lookAt(0, 0.35, -2.6);

        // Lighting
        scene.add(new THREE.AmbientLight(0x28435e, 1.35));
        const keyGold = new THREE.DirectionalLight(0xe5c287, 2.1);
        keyGold.position.set(5, 8, 6);
        scene.add(keyGold);

        const cyanRim = new THREE.PointLight(0x36bdd0, 24, 34);
        cyanRim.position.set(-7, 4.5, 2);
        scene.add(cyanRim);

        const activeLight = new THREE.PointLight(0xe5c287, 28, 22);
        activeLight.position.set(0, 2.4, -1);
        scene.add(activeLight);

        // Reflective dark mineral floor
        const floorGeo = track(new THREE.PlaneGeometry(80, 80));
        const floorMat = track(
          new THREE.MeshStandardMaterial({
            color: 0x070d16,
            metalness: 0.88,
            roughness: 0.24,
          }),
        );
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1.45;
        scene.add(floor);

        // Glowing orbital floor rings
        const ringGoldMat = track(
          new THREE.MeshBasicMaterial({
            color: 0xcda66c,
            transparent: true,
            opacity: 0.28,
          }),
        );
        const ringCyanMat = track(
          new THREE.MeshBasicMaterial({
            color: 0x36bdd0,
            transparent: true,
            opacity: 0.24,
          }),
        );
        for (const [radius, mat] of [
          [7.4, ringGoldMat],
          [5.1, ringCyanMat],
          [3.1, ringGoldMat],
        ] as const) {
          const ringGeo = track(new THREE.TorusGeometry(radius, 0.02, 12, 128));
          const ringMesh = new THREE.Mesh(ringGeo, mat);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.position.set(0, -1.42, -2.4);
          scene.add(ringMesh);
        }

        // Planetary horizon texture + dome arc behind center "A"
        const texLoader = new THREE.TextureLoader();
        const earthTexture = track(texLoader.load("/v2/scenes/hero-earth.webp"));
        earthTexture.colorSpace = THREE.SRGBColorSpace;
        const earthGeo = track(new THREE.PlaneGeometry(24, 13.5));
        const earthMat = track(
          new THREE.MeshBasicMaterial({
            map: earthTexture,
            transparent: true,
            opacity: 0.72,
            depthWrite: false,
          }),
        );
        const earthPlane = new THREE.Mesh(earthGeo, earthMat);
        earthPlane.position.set(0, 1.35, -13.5);
        scene.add(earthPlane);

        // Central sculpted prismatic "A" landmark rising behind the arc
        const centralGroup = new THREE.Group();
        centralGroup.position.set(0, 3.35, -6.2);

        const prismSilverMat = track(
          new THREE.MeshStandardMaterial({
            color: 0xcbd5e1,
            metalness: 0.78,
            roughness: 0.2,
            emissive: 0x1377df,
            emissiveIntensity: 0.24,
          }),
        );
        const prismGoldMat = track(
          new THREE.MeshStandardMaterial({
            color: 0xe5c287,
            metalness: 0.85,
            roughness: 0.18,
            emissive: 0xcda66c,
            emissiveIntensity: 0.45,
          }),
        );

        const legGeo = track(new THREE.BoxGeometry(0.42, 3.1, 0.34));
        const leftLeg = new THREE.Mesh(legGeo, prismSilverMat);
        leftLeg.position.set(-0.62, 0, 0);
        leftLeg.rotation.z = -0.34;
        centralGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, prismSilverMat);
        rightLeg.position.set(0.62, 0, 0);
        rightLeg.rotation.z = 0.34;
        centralGroup.add(rightLeg);

        const barGeo = track(new THREE.BoxGeometry(1.55, 0.34, 0.36));
        const crossbar = new THREE.Mesh(barGeo, prismGoldMat);
        crossbar.position.set(0, -0.58, 0.04);
        centralGroup.add(crossbar);

        const apexGeo = track(new THREE.OctahedronGeometry(0.32, 0));
        const apexMat = track(
          new THREE.MeshStandardMaterial({
            color: 0x36bdd0,
            emissive: 0x36bdd0,
            emissiveIntensity: 0.9,
            metalness: 0.4,
            roughness: 0.15,
          }),
        );
        const apex = new THREE.Mesh(apexGeo, apexMat);
        apex.position.set(0, 1.48, 0.05);
        centralGroup.add(apex);
        scene.add(centralGroup);

        // Ambient mineral starfield
        const starCount = 520;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const colGold = new THREE.Color(0xe5c287);
        const colCyan = new THREE.Color(0x36bdd0);
        const colSilver = new THREE.Color(0xcbd5e1);

        for (let i = 0; i < starCount; i += 1) {
          const s1 = Math.sin(i * 12.9898) * 43758.5453;
          const s2 = Math.sin(i * 78.233) * 19341.12;
          const s3 = Math.sin(i * 45.164) * 8192.41;
          const r1 = s1 - Math.floor(s1);
          const r2 = s2 - Math.floor(s2);
          const r3 = s3 - Math.floor(s3);

          starPositions[i * 3] = (r1 - 0.5) * 34;
          starPositions[i * 3 + 1] = r2 * 11 - 1.2;
          starPositions[i * 3 + 2] = -r3 * 22 + 2;

          const col = i % 5 === 0 ? colCyan : i % 3 === 0 ? colGold : colSilver;
          starColors[i * 3] = col.r;
          starColors[i * 3 + 1] = col.g;
          starColors[i * 3 + 2] = col.b;
        }
        const starGeo = track(new THREE.BufferGeometry());
        starGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(starPositions, 3),
        );
        starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
        const starMat = track(
          new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.78,
          }),
        );
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // 5 Tall Glowing Portal Monoliths
        interface MonolithEntry {
          portalId: PortalId;
          group: InstanceType<typeof THREE.Group>;
          frameMat: InstanceType<typeof THREE.MeshStandardMaterial>;
          screenMat: InstanceType<typeof THREE.MeshBasicMaterial>;
          hitMesh: InstanceType<typeof THREE.Mesh>;
          baseY: number;
          accentHex: number;
        }

        const monoliths: MonolithEntry[] = [];
        const monolithPlaneGeo = track(new THREE.PlaneGeometry(2.15, 3.65));
        const frameTopGeo = track(new THREE.BoxGeometry(2.38, 0.08, 0.14));
        const frameSideGeo = track(new THREE.BoxGeometry(0.08, 3.85, 0.14));
        const backingGeo = track(new THREE.BoxGeometry(2.28, 3.78, 0.08));

        PORTALS.forEach((portal, index) => {
          const arc = PORTAL_ARC_POSITIONS[index];
          const group = new THREE.Group();
          group.position.set(arc.x, arc.y, arc.z);
          group.rotation.y = arc.rotY;

          const accentNum = Number.parseInt(portal.accentHex.slice(1), 16);

          const tex = track(texLoader.load(portal.posterSrc));
          tex.colorSpace = THREE.SRGBColorSpace;

          const backingMat = track(
            new THREE.MeshStandardMaterial({
              color: 0x0b121c,
              metalness: 0.65,
              roughness: 0.3,
            }),
          );
          const backing = new THREE.Mesh(backingGeo, backingMat);
          backing.position.z = -0.05;
          group.add(backing);

          const screenMat = track(
            new THREE.MeshBasicMaterial({
              map: tex,
              transparent: true,
              opacity: 0.92,
            }),
          );
          const screen = new THREE.Mesh(monolithPlaneGeo, screenMat);
          screen.position.z = 0.02;
          screen.userData.portalId = portal.id;
          group.add(screen);

          // Layer approved Guide mascot onto Monolith #2 (AtlasBot)
          if (portal.id === "atlasbot") {
            const guideTex = track(texLoader.load("/v2/mascots/guide-640.webp"));
            guideTex.colorSpace = THREE.SRGBColorSpace;
            const guideGeo = track(new THREE.PlaneGeometry(1.9, 1.9));
            const guideMat = track(
              new THREE.MeshBasicMaterial({
                map: guideTex,
                transparent: true,
                alphaTest: 0.05,
              }),
            );
            const guideMesh = new THREE.Mesh(guideGeo, guideMat);
            guideMesh.position.set(0, -0.25, 0.06);
            guideMesh.userData.portalId = portal.id;
            group.add(guideMesh);
          }

          const frameMat = track(
            new THREE.MeshStandardMaterial({
              color: accentNum,
              emissive: accentNum,
              emissiveIntensity: 0.75,
              metalness: 0.7,
              roughness: 0.22,
            }),
          );

          const topBar = new THREE.Mesh(frameTopGeo, frameMat);
          topBar.position.y = 1.9;
          group.add(topBar);

          const bottomBar = new THREE.Mesh(frameTopGeo, frameMat);
          bottomBar.position.y = -1.9;
          group.add(bottomBar);

          const leftBar = new THREE.Mesh(frameSideGeo, frameMat);
          leftBar.position.x = -1.16;
          group.add(leftBar);

          const rightBar = new THREE.Mesh(frameSideGeo, frameMat);
          rightBar.position.x = 1.16;
          group.add(rightBar);

          scene.add(group);
          monoliths.push({
            portalId: portal.id,
            group,
            frameMat,
            screenMat,
            hitMesh: screen,
            baseY: arc.y,
            accentHex: accentNum,
          });
        });

        // Pointer parallax & monolith click raycaster
        const pointerNdc = new THREE.Vector2(0, 0);
        const raycaster = new THREE.Raycaster();
        let targetCamOffsetX = 0;
        let targetCamOffsetY = 0;
        let isTabHidden = document.visibilityState === "hidden";

        const updatePointer = (clientX: number, clientY: number) => {
          const rect = renderer.domElement.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
          pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
          targetCamOffsetX = pointerNdc.x * 0.65;
          targetCamOffsetY = pointerNdc.y * 0.25;
        };

        const handlePointerMove = (event: PointerEvent) => {
          updatePointer(event.clientX, event.clientY);
          raycaster.setFromCamera(pointerNdc, camera);
          const hits = raycaster.intersectObjects(
            monoliths.map((m) => m.hitMesh),
            false,
          );
          renderer.domElement.style.cursor = hits.length > 0 ? "pointer" : "default";
        };

        const handleClick = (event: MouseEvent) => {
          updatePointer(event.clientX, event.clientY);
          raycaster.setFromCamera(pointerNdc, camera);
          const hits = raycaster.intersectObjects(
            monoliths.map((m) => m.hitMesh),
            false,
          );
          if (hits.length > 0) {
            const hitId = hits[0].object.userData.portalId as PortalId | undefined;
            if (!hitId) return;
            if (hitId === activePortalRef.current) {
              onActivateRef.current(hitId);
            } else {
              onSelectRef.current(hitId);
            }
          }
        };

        const handleResize = () => {
          if (!containerRef.current) return;
          const w = Math.max(containerRef.current.clientWidth, 320);
          const h = Math.max(containerRef.current.clientHeight, 320);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        };

        const handleVisibility = () => {
          isTabHidden = document.visibilityState === "hidden";
          if (!isTabHidden && !pausedRef.current && rafId === null) {
            rafId = requestAnimationFrame(renderLoop);
          }
        };

        renderer.domElement.addEventListener("pointermove", handlePointerMove);
        renderer.domElement.addEventListener("click", handleClick);
        document.addEventListener("visibilitychange", handleVisibility);

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(handleResize);
          resizeObserver.observe(container);
        }

        const start = performance.now();
        const lookTarget = new THREE.Vector3(0, 0.35, -2.6);

        const renderLoop = (now: number) => {
          if (cancelled || isTabHidden) {
            rafId = null;
            return;
          }

          const t = (now - start) * 0.001;
          const activeIndex = PORTALS.findIndex(
            (p) => p.id === activePortalRef.current,
          );
          const focusIdx = activeIndex >= 0 ? activeIndex : 2;
          const focusArc = PORTAL_ARC_POSITIONS[focusIdx];

          // Smooth restrained orbital camera pan toward active monolith
          const desiredX = focusArc.x * 0.34 + targetCamOffsetX;
          const desiredY = 2.0 + targetCamOffsetY;
          camera.position.x += (desiredX - camera.position.x) * 0.055;
          camera.position.y += (desiredY - camera.position.y) * 0.055;

          lookTarget.x += (focusArc.x * 0.48 - lookTarget.x) * 0.06;
          lookTarget.y += (0.35 - lookTarget.y) * 0.06;
          camera.lookAt(lookTarget);

          // Update monolith elevations & highlights
          for (let i = 0; i < monoliths.length; i += 1) {
            const item = monoliths[i];
            const isActive = item.portalId === activePortalRef.current;
            const targetY =
              item.baseY +
              (isActive ? 0.32 : 0) +
              (pausedRef.current ? 0 : Math.sin(t * 1.1 + i * 0.9) * 0.07);
            item.group.position.y += (targetY - item.group.position.y) * 0.08;

            const targetScale = isActive ? 1.08 : 0.96;
            item.group.scale.x += (targetScale - item.group.scale.x) * 0.08;
            item.group.scale.y += (targetScale - item.group.scale.y) * 0.08;

            item.frameMat.emissiveIntensity +=
              ((isActive ? 1.65 : 0.55) - item.frameMat.emissiveIntensity) * 0.1;
            item.screenMat.opacity +=
              ((isActive ? 1 : 0.72) - item.screenMat.opacity) * 0.1;

            if (isActive) {
              activeLight.color.setHex(item.accentHex);
              activeLight.position.x +=
                (item.group.position.x - activeLight.position.x) * 0.1;
            }
          }

          if (!pausedRef.current) {
            centralGroup.rotation.y = Math.sin(t * 0.35) * 0.08;
            stars.rotation.y = t * 0.015;
          }

          renderer.render(scene, camera);
          rafId = requestAnimationFrame(renderLoop);
        };

        rafId = requestAnimationFrame(renderLoop);

        cleanupHandlers = () => {
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          renderer.domElement.removeEventListener(
            "pointermove",
            handlePointerMove,
          );
          renderer.domElement.removeEventListener("click", handleClick);
          document.removeEventListener("visibilitychange", handleVisibility);
          resizeObserver?.disconnect();

          for (const item of disposables) {
            item.dispose();
          }
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        };
      } catch {
        onUnavailableRef.current();
      }
    };

    void init();

    return () => {
      cancelled = true;
      cleanupHandlers?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`.trim()}
    />
  );
}

export default MultiverseThreeCanvas;
