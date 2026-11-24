import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import http from "node:http";
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(process.cwd());
const OUT_SCENES = path.join(ROOT, "public", "v2", "scenes");
const THREE_DIR = path.join(ROOT, "node_modules", "three", "build");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const server = http.createServer((req, res) => {
  if (req.url === "/three.module.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    fs.createReadStream(path.join(THREE_DIR, "three.module.js")).pipe(res);
    return;
  }
  if (req.url === "/three.core.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    fs.createReadStream(path.join(THREE_DIR, "three.core.js")).pipe(res);
    return;
  }
  if (req.url?.startsWith("/earth.webp")) {
    res.writeHead(200, { "Content-Type": "image/webp" });
    fs.createReadStream(path.join(OUT_SCENES, "hero-earth.webp")).pipe(res);
    return;
  }
  if (req.url === "/gwd.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#070c14;">
<canvas id="c" width="1200" height="675"></canvas>
<script type="module">
import * as THREE from "/three.module.js";
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1200, 675, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060b14);
scene.fog = new THREE.FogExp2(0x09111f, 0.022);

const camera = new THREE.PerspectiveCamera(42, 1200 / 675, 0.1, 200);
camera.position.set(0, 3.6, 17.5);
camera.lookAt(0, 1.4, 0);

// Lights
scene.add(new THREE.AmbientLight(0x1f334f, 1.4));
const sunLight = new THREE.DirectionalLight(0xf3cf8a, 3.8);
sunLight.position.set(4, 6, -16);
scene.add(sunLight);
const cyanRim = new THREE.PointLight(0x36bdd0, 22, 28);
cyanRim.position.set(-7, 4, 4);
scene.add(cyanRim);
const goldCore = new THREE.PointLight(0xe5c287, 36, 32);
goldCore.position.set(0, 3.2, 0);
scene.add(goldCore);

// Reflective dark architectural floor / water
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(140, 140, 64, 64),
  new THREE.MeshStandardMaterial({ color: 0x070d18, metalness: 0.92, roughness: 0.18 })
);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// Horizon glow disc & planetary curve
const texLoader = new THREE.TextureLoader();
const earthTex = await new Promise((resolve) => texLoader.load("/earth.webp", resolve));
const planet = new THREE.Mesh(
  new THREE.PlaneGeometry(34, 19.1),
  new THREE.MeshBasicMaterial({ map: earthTex, transparent: true, opacity: 0.72, depthWrite: false })
);
planet.position.set(0, 3.8, -28);
scene.add(planet);

const halo = new THREE.Mesh(
  new THREE.CircleGeometry(14, 64),
  new THREE.MeshBasicMaterial({ color: 0xcda66c, transparent: true, opacity: 0.16, depthWrite: false })
);
halo.position.set(0, 2.5, -24);
scene.add(halo);

// Concentric Circular GWD Campus Rings (Governance, Ventures, Cortex)
const goldMat = new THREE.MeshStandardMaterial({ color: 0xdfb979, metalness: 0.85, roughness: 0.22, emissive: 0x5c3e14, emissiveIntensity: 0.5 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x16253b, metalness: 0.3, roughness: 0.12, transparent: true, opacity: 0.78 });
const cyanMat = new THREE.MeshBasicMaterial({ color: 0x45d0e3, transparent: true, opacity: 0.85 });

for (const [radius, tube, y, mat] of [
  [5.8, 0.11, 0.25, goldMat],
  [4.3, 0.08, 0.68, goldMat],
  [2.8, 0.06, 1.15, cyanMat],
]) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 24, 120), mat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = y;
  scene.add(ring);
}

// Sculpted Architectural Monoliths along circular campus
for (let i = 0; i < 18; i++) {
  const ang = (i / 18) * Math.PI * 2;
  const dist = i % 2 === 0 ? 5.1 : 3.55;
  const h = 1.6 + ((i * 37) % 10) * 0.28 + (i === 4 || i === 13 ? 1.8 : 0);
  const w = 0.52 + ((i * 13) % 4) * 0.14;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), glassMat);
  tower.position.set(Math.cos(ang) * dist, h / 2, Math.sin(ang) * dist - 1.0);
  tower.rotation.y = -ang;
  scene.add(tower);

  const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, 0.05, w + 0.03), goldMat);
  rim.position.set(tower.position.x, h - 0.15, tower.position.z);
  rim.rotation.y = -ang;
  scene.add(rim);
}

// Central Sovereign Spire
const spire = new THREE.Mesh(
  new THREE.CylinderGeometry(0.18, 0.85, 5.2, 6),
  new THREE.MeshStandardMaterial({ color: 0xe6c387, metalness: 0.9, roughness: 0.15, emissive: 0x3b2a0e, emissiveIntensity: 0.4 })
);
spire.position.set(0, 2.6, -1.0);
scene.add(spire);

// Floating Three Governance/Ventures/Cortex Orbs
for (const [x, y, z, col] of [
  [-2.6, 2.5, 1.4, 0xe5c287],
  [0, 3.6, 0.5, 0x36bdd0],
  [2.6, 2.5, 1.4, 0x8b5cf6],
]) {
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 32, 32),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.6, roughness: 0.1 })
  );
  orb.position.set(x, y, z);
  scene.add(orb);
}

// Star particles
const pCount = 900;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  pPos[i * 3] = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 44 - 22;
  pPos[i * 3 + 1] = Math.abs(Math.sin(i * 78.233) * 19341.12 % 1) * 14 + 0.4;
  pPos[i * 3 + 2] = -Math.abs(Math.sin(i * 45.164) * 8192.41 % 1) * 30 + 6;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xf4dca8, size: 0.08, transparent: true, opacity: 0.7 })));

renderer.render(scene, camera);
window.__READY__ = true;
</script></body></html>`);
    return;
  }
  if (req.url === "/cortex.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#050a11;">
<canvas id="c" width="1200" height="675"></canvas>
<script type="module">
import * as THREE from "/three.module.js";
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1200, 675, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050a11);
scene.fog = new THREE.FogExp2(0x050a11, 0.032);

const camera = new THREE.PerspectiveCamera(46, 1200 / 675, 0.1, 120);
camera.position.set(0, 6.2, 13.8);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0x28485c, 1.5));
const coreLight = new THREE.PointLight(0x36bdd0, 40, 26);
scene.add(coreLight);
const violetLight = new THREE.PointLight(0x8b5cf6, 26, 28);
violetLight.position.set(4, 3, -3);
scene.add(violetLight);

// Spiral Galaxy Dust (3500 points)
const count = 3600;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const cCyan = new THREE.Color(0x36bdd0);
const cTeal = new THREE.Color(0x2dd4bf);
const cViolet = new THREE.Color(0xa78bfa);
const cGold = new THREE.Color(0xe5c287);

for (let i = 0; i < count; i++) {
  const arm = i % 3;
  const r = Math.pow((i / count), 0.72) * 9.5 + 0.25;
  const angle = r * 1.15 + (arm * Math.PI * 2) / 3 + Math.sin(i * 7.3) * 0.45;
  const spread = (1 - r / 11) * 0.9 + 0.2;
  positions[i * 3] = Math.cos(angle) * r + Math.sin(i * 19.1) * spread * 0.55;
  positions[i * 3 + 1] = Math.cos(i * 31.7) * spread * 0.48;
  positions[i * 3 + 2] = Math.sin(angle) * r + Math.cos(i * 13.7) * spread * 0.55;

  const col = r < 2.2 ? cGold.clone().lerp(cCyan, 0.6) : arm === 0 ? cCyan : arm === 1 ? cTeal : cViolet;
  colors[i * 3] = col.r;
  colors[i * 3 + 1] = col.g;
  colors[i * 3 + 2] = col.b;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.085, vertexColors: true, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending })));

// Knowledge Crystal Prism Nodes + Synaptic Edges
const nodes = [];
const palette = [0x36bdd0, 0x2dd4bf, 0xa78bfa, 0xe5c287];
for (let i = 0; i < 42; i++) {
  const ang = i * 0.62;
  const rad = 1.4 + (i / 42) * 6.8;
  const x = Math.cos(ang) * rad;
  const y = Math.sin(i * 1.9) * 1.35;
  const z = Math.sin(ang) * rad * 0.78;
  nodes.push(new THREE.Vector3(x, y, z));
  const mesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(i % 5 === 0 ? 0.24 : 0.14, 0),
    new THREE.MeshStandardMaterial({ color: palette[i % 4], emissive: palette[i % 4], emissiveIntensity: 1.4, metalness: 0.4, roughness: 0.15 })
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
}

const linePts = [];
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    if (nodes[i].distanceTo(nodes[j]) < 3.4) {
      linePts.push(nodes[i], nodes[j]);
    }
  }
}
const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x4fd1e5, transparent: true, opacity: 0.3 })));

// Orbital rings
for (const [rad, col, tilt] of [[4.2, 0x36bdd0, 0.25], [6.6, 0x8b5cf6, -0.18]]) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.02, 12, 120), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.32 }));
  ring.rotation.x = Math.PI / 2 + tilt;
  scene.add(ring);
}

renderer.render(scene, camera);
window.__READY__ = true;
</script></body></html>`);
    return;
  }
  res.writeHead(404);
  res.end();
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

const browser = await chromium.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 } });
  for (const [route, outName] of [
    ["/gwd.html", "portal-gwd"],
    ["/cortex.html", "portal-atlascortex"],
  ]) {
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__READY__ === true);
    await page.waitForTimeout(200);
    const pngTmp = path.join(OUT_SCENES, `${outName}.tmp.png`);
    await page.screenshot({ path: pngTmp });
    execFileSync("python", [
      "-c",
      `from PIL import Image; im = Image.open(r'${pngTmp}').convert('RGB'); im.save(r'${path.join(OUT_SCENES, outName + ".webp")}', 'WEBP', quality=88, method=6); im.resize((640,360), Image.Resampling.LANCZOS).save(r'${path.join(OUT_SCENES, outName + "-640.webp")}', 'WEBP', quality=84, method=6)`,
    ]);
    fs.unlinkSync(pngTmp);
    console.log("Rendered 3D WebP:", outName);
  }
} finally {
  await browser.close();
  server.close();
}

// Also upgrade diana-avatar.webp from diana-welcome.png (executive navy blazer!)
const dianaWelcomePng = "C:\\Users\\conta\\.gemini\\antigravity\\brain\\e1688744-3bde-4ec0-9904-7741f7e0f39f\\scratch\\inspect\\diana-welcome.png";
execFileSync("python", [
  "-c",
  `from PIL import Image; im = Image.open(r'${dianaWelcomePng}').convert('RGB'); w, h = im.size; crop = im.crop((0, 0, w, int(w * 1.25))); crop.resize((360, 450), Image.Resampling.LANCZOS).save(r'${path.join(ROOT, "public", "v2", "diana-avatar.webp")}', 'WEBP', quality=88, method=6)`,
]);

// Refresh asset-manifest.json with accurate SHA-256 & dimensions for ALL files in public/v2
const allAssets = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".webp")) {
      const rel = path.relative(ROOT, full).replace(/\\/g, "/");
      const sha = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
      allAssets.push({ path: rel, bytes: fs.statSync(full).size, sha256: sha });
    }
  }
}
walk(path.join(ROOT, "public", "v2"));
fs.writeFileSync(path.join(ROOT, "public", "v2", "asset-manifest.json"), JSON.stringify(allAssets, null, 2));
console.log("Updated asset-manifest.json:", allAssets.length, "entries");
