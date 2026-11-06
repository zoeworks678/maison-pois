// Maison Pois — 3D rack hero.
// Loads the wardrobe-rack model and makes each garment swing from the rail
// when the cursor brushes past it (or when it is tapped on touch screens).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODEL_URL = 'assets/wardrobe-rack.glb';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Swing tuning. Raise PUSH for bigger swings, raise DAMPING for a quicker settle.
const PUSH = reducedMotion ? 0.35 : 1;
const DAMPING = 1.35;
const MAX_ANGLE = 0.38;      // radians (~22°)
const MAX_SPIN = 4;          // radians per second
const FLOOR_Y = -0.809;

const stage = document.getElementById('stage');
const canvas = document.getElementById('rack');
const status = document.getElementById('stage-status');
const hint = document.getElementById('hint');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (err) {
  status.textContent = 'Your browser can’t show the 3D rack. Try a recent version of Chrome, Safari, Firefox or Edge.';
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.75;

const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);

const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(-1.6, 3, 2.4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -1.6; key.shadow.camera.right = 1.6;
key.shadow.camera.top = 1.6; key.shadow.camera.bottom = -1.6;
key.shadow.radius = 6;
key.shadow.bias = -0.0005;
scene.add(key);
scene.add(new THREE.HemisphereLight(0xfff6f0, 0xc9bfb6, 0.6));

// Invisible floor that only receives the rack's shadow.
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.ShadowMaterial({ color: 0x3d342e, opacity: 0.18 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = FLOOR_Y;
floor.receiveShadow = true;
scene.add(floor);

// ---------------------------------------------------------------------------
// Camera framing: keep the whole rack in view at any aspect ratio.
function resize() {
  const { clientWidth: w, clientHeight: h } = stage;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  // On wide screens the rack sits in the right part of the hero, leaving the
  // left side clear for the copy.
  const wide = w / h > 1.25;
  const share = wide ? 0.64 : 1;          // fraction of the width the rack may use
  const shift = wide ? w * (1 - share) / 2 : 0;
  camera.aspect = (w * share) / h;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const halfH = 0.95;                     // rack half-height plus margin
  const halfW = 1.12;                     // rack half-width plus margin
  const distH = halfH / Math.tan(vFov / 2);
  const distW = halfW / (Math.tan(vFov / 2) * camera.aspect);
  const dist = Math.max(distH, distW) + 0.4;
  camera.aspect = w / h;
  camera.setViewOffset(w, h, -shift, 0, w, h);
  camera.position.set(0, 0.08, dist);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

// ---------------------------------------------------------------------------
// Garments and their swing state.
const garments = [];          // { node, length, stiffness, angle, spin, tilt, tiltSpin }
const hitMeshes = [];

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
loader.load(
  MODEL_URL,
  (gltf) => {
    const root = gltf.scene;
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
    });
    root.updateMatrixWorld(true);
    const pivots = [];
    root.traverse((obj) => { if (/^garment_\d+$/.test(obj.name)) pivots.push(obj); });
    pivots.forEach((node) => {
      const box = new THREE.Box3().setFromObject(node);
      const length = Math.max(0.3, node.position.y - box.min.y);
      // A pendulum's natural frequency depends on its length: long dresses
      // swing slower than short tops.
      const stiffness = (9.8 / length) * 0.55;
      const g = { node, length, stiffness, angle: 0, spin: 0, tilt: 0, tiltSpin: 0 };
      node.traverse((m) => { if (m.isMesh) { m.userData.garment = g; hitMeshes.push(m); } });
      garments.push(g);
    });
    scene.add(root);
    status.textContent = '';
    canvas.classList.add('is-ready');
    if (!reducedMotion) setTimeout(introSweep, 650);
  },
  undefined,
  (err) => {
    console.error(err);
    status.textContent = 'The 3D rack didn’t load. Check that assets/wardrobe-rack.glb is uploaded next to index.html.';
  }
);

// One orchestrated moment on load: a hand runs along the rail, left to right.
function introSweep() {
  garments.forEach((g, i) => {
    setTimeout(() => { g.spin += -1.1 / Math.sqrt(g.length); g.tiltSpin += 0.25; }, i * 85);
  });
}

// ---------------------------------------------------------------------------
// Pointer interaction.
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const railPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const worldPoint = new THREE.Vector3();
let last = null;              // { x, y, t } in world units / ms
let hinted = false;

function pointerToWorld(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  raycaster.ray.intersectPlane(railPlane, worldPoint);
  return worldPoint;
}

function hitGarment() {
  const hit = raycaster.intersectObjects(hitMeshes, false)[0];
  return hit ? { g: hit.object.userData.garment, point: hit.point } : null;
}

function push(g, point, vx, vy) {
  // Angular velocity that would make the garment move with the cursor at the
  // point it was touched: omega = v / r. Blend toward it rather than add, so a
  // fast brush gives a strong swing without the garment spinning out.
  const r = Math.max(0.15, g.node.position.y - point.y);
  const target = THREE.MathUtils.clamp((-vx / r) * PUSH, -MAX_SPIN, MAX_SPIN);
  if (Math.abs(target) > Math.abs(g.spin) || Math.sign(target) !== Math.sign(g.spin)) {
    g.spin += (target - g.spin) * 0.35;
  }
  // A little movement toward/away from the viewer makes it read as 3D.
  g.tiltSpin += THREE.MathUtils.clamp(vy * 0.4 + vx * 0.15, -1, 1) * PUSH;
  if (!hinted) { hinted = true; hint.classList.add('is-done'); }
}

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  const p = pointerToWorld(e);
  const now = performance.now();
  const hit = hitGarment();
  canvas.style.cursor = hit ? 'grab' : '';
  if (last && hit) {
    const dt = Math.max(8, now - last.t) / 1000;
    push(hit.g, hit.point, (p.x - last.x) / dt, (p.y - last.y) / dt);
  }
  last = { x: p.x, y: p.y, t: now };
});
canvas.addEventListener('pointerleave', () => { last = null; });

// Touch: a tap sets the piece swinging, pushed away from where it was tapped.
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return;
  pointerToWorld(e);
  const hit = hitGarment();
  if (!hit) return;
  const side = hit.point.x < hit.g.node.position.x ? 1 : -1;
  push(hit.g, hit.point, side * 1.6, 0);
});

// ---------------------------------------------------------------------------
// Render loop: damped spring per garment, paused when the hero is off screen.
let visible = true;
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(stage);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 1 / 30);
  if (!visible) return;
  for (const g of garments) {
    g.spin += (-g.stiffness * g.angle - DAMPING * g.spin) * dt;
    g.angle = THREE.MathUtils.clamp(g.angle + g.spin * dt, -MAX_ANGLE, MAX_ANGLE);
    if (Math.abs(g.angle) === MAX_ANGLE) g.spin *= -0.3;   // soft bounce at the limit
    g.tiltSpin += (-g.stiffness * 1.2 * g.tilt - DAMPING * 1.3 * g.tiltSpin) * dt;
    g.tilt = THREE.MathUtils.clamp(g.tilt + g.tiltSpin * dt, -0.2, 0.2);
    g.node.rotation.set(g.tilt, 0, g.angle);
  }
  renderer.render(scene, camera);
});
