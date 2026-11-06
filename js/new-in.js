// Maison Pois — New In page.
// Builds the product grid, wires up "Add to bag", and turns a product's still
// image into a live, slowly turning 3D garment while it is hovered (or tapped).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeCamera, frameGarment, REST_TURN } from './frame.js';
import { addToBag } from './bag.js';

// Product list. `piece` matches garment_N in the model, left to right on the rack.
const PRODUCTS = [
  { piece: 1, name: 'Midnight dot shirt dress', price: 289, note: 'Cotton poplin' },
  { piece: 2, name: 'Navy pin-dot blouse', price: 169, note: 'Silk crêpe' },
  { piece: 3, name: 'Blush dot button-up', price: 159, note: 'Cotton poplin' },
  { piece: 4, name: 'Cream spot overshirt', price: 199, note: 'Washed linen' },
  { piece: 5, name: 'Mint polka cami', price: 129, note: 'Silk crêpe' },
  { piece: 6, name: 'Lilac dot camp shirt', price: 159, note: 'Cotton voile' },
  { piece: 7, name: 'Cornflower dot shirt', price: 159, note: 'Cotton poplin' },
  { piece: 8, name: 'Ivory dot maxi dress', price: 319, note: 'Cotton lawn' },
  { piece: 9, name: 'Classic polka midi dress', price: 279, note: 'Viscose crêpe' },
];

const list = document.getElementById('products');
const bagStatus = document.getElementById('bag-status');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Product cards
list.innerHTML = PRODUCTS.map((p) => `
  <li class="product" data-piece="${p.piece}">
    <div class="product-media">
      <img src="assets/products/piece-${p.piece}.webp" alt="${p.name} on a hanger"
           width="900" height="1200" loading="lazy" decoding="async">
    </div>
    <div class="product-info">
      <h2 class="product-name">${p.name}</h2>
      <p class="product-meta">${p.note}</p>
      <p class="product-price">RM ${p.price}</p>
      <button class="add" type="button">Add to bag</button>
    </div>
  </li>`).join('');

list.addEventListener('click', (e) => {
  const button = e.target.closest('.add');
  if (!button) return;
  const card = button.closest('.product');
  const product = PRODUCTS.find((p) => p.piece === Number(card.dataset.piece));
  const total = addToBag();
  bagStatus.textContent = `Added ${product.name} to your bag. ${total} ${total === 1 ? 'item' : 'items'} in your bag.`;
  button.textContent = 'Added';
  button.classList.add('is-added');
  clearTimeout(button._reset);
  button._reset = setTimeout(() => {
    button.textContent = 'Add to bag';
    button.classList.remove('is-added');
  }, 1600);
});

// ---------------------------------------------------------------------------
// Live 3D view. One renderer and one canvas are shared: the canvas moves into
// whichever product is active, so only one garment is ever drawn at a time.
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch {
  renderer = null;            // no WebGL: the still images stay as they are
}

const canvas = renderer?.domElement;
const scene = new THREE.Scene();
const camera = makeCamera();
let root = null;
const pivots = new Map();     // piece number -> pivot node
let active = null;            // { card, pivot }
let pending = null;           // card hovered before the model finished loading
let spin = 0;

if (renderer) {
  canvas.className = 'product-3d';
  canvas.setAttribute('aria-hidden', 'true');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-1.6, 3, 2.4);
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xfff6f0, 0xc9bfb6, 0.6));

  // Load the model once the page is idle so it never delays the grid.
  const load = () => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('assets/wardrobe-rack.glb', (gltf) => {
      root = gltf.scene;
      root.getObjectByName('rack').visible = false;
      root.traverse((o) => {
        const m = /^garment_(\d+)$/.exec(o.name);
        if (m) { pivots.set(Number(m[1]), o); o.visible = false; }
      });
      scene.add(root);
      if (pending) activate(pending);
    }, undefined, (err) => console.error('3D model failed to load; showing still images only.', err));
  };
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 2500 });
  else setTimeout(load, 800);
}

function activate(card) {
  if (!renderer) return;
  if (!root) { pending = card; return; }
  pending = null;
  if (active?.card === card) return;
  deactivate();
  const pivot = pivots.get(Number(card.dataset.piece));
  if (!pivot) return;
  pivot.visible = true;
  pivot.rotation.set(0, REST_TURN, 0);
  frameGarment(camera, pivot, root);
  spin = 0;
  const media = card.querySelector('.product-media');
  media.appendChild(canvas);
  sizeCanvas(media);
  renderer.render(scene, camera);
  active = { card, pivot };
  requestAnimationFrame(() => card.classList.add('is-3d'));
}

function deactivate() {
  pending = null;
  if (!active) return;
  active.card.classList.remove('is-3d');
  active.pivot.visible = false;
  active.pivot.rotation.set(0, REST_TURN, 0);
  active = null;
}

function sizeCanvas(media) {
  const { clientWidth: w, clientHeight: h } = media;
  renderer.setSize(w, h, false);
}

// Mouse and pen: hover. Touch: tap the image to turn the piece, tap again to stop.
list.addEventListener('pointerover', (e) => {
  if (e.pointerType === 'touch') return;
  const media = e.target.closest('.product-media');
  if (media) activate(media.closest('.product'));
});
list.addEventListener('pointerout', (e) => {
  if (e.pointerType === 'touch') return;
  const media = e.target.closest('.product-media');
  if (media && !media.contains(e.relatedTarget)) {
    if (pending === media.closest('.product')) pending = null;
    if (active?.card === media.closest('.product')) deactivate();
  }
});
list.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'touch') return;
  const media = e.target.closest('.product-media');
  if (!media) return;
  const card = media.closest('.product');
  if (active?.card === card) deactivate(); else activate(card);
});

window.addEventListener('resize', () => {
  if (active) sizeCanvas(active.card.querySelector('.product-media'));
});

// Turn the active garment: a slow full turn, with a soft sway as it goes.
const clock = new THREE.Clock();
renderer?.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 1 / 30);
  if (!active) return;
  spin += dt * (reducedMotion ? 0.35 : 0.9);
  active.pivot.rotation.set(0, REST_TURN + spin, reducedMotion ? 0 : Math.sin(spin * 2) * 0.03);
  renderer.render(scene, camera);
});
