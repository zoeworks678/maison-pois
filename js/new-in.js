// Maison Pois — New In page.
// Builds the product grid from the list below and wires up "Add to bag".
// Each product has two photos: the front, and a turned view that fades in on hover.
import { addToBag } from './bag.js';

// `piece` matches the image files in assets/products (piece-N.webp and
// piece-N-alt.webp). The first product is shown large.
const PRODUCTS = [
  { piece: 9, name: 'Classic polka midi dress', price: 279, note: 'Viscose crêpe',
    story: 'Our signature dot on a fluid midi that moves as you walk. Fitted through the bodice, softly flared below the waist.' },
  { piece: 8, name: 'Ivory dot maxi dress', price: 319, note: 'Cotton lawn' },
  { piece: 5, name: 'Mint polka cami', price: 129, note: 'Silk crêpe' },
  { piece: 3, name: 'Blush dot button-up', price: 159, note: 'Cotton poplin' },
  { piece: 7, name: 'Cornflower dot shirt', price: 159, note: 'Cotton poplin' },
  { piece: 1, name: 'Midnight dot shirt dress', price: 289, note: 'Cotton poplin' },
  { piece: 2, name: 'Navy pin-dot blouse', price: 169, note: 'Silk crêpe' },
  { piece: 4, name: 'Cream spot overshirt', price: 199, note: 'Washed linen' },
  { piece: 6, name: 'Lilac dot camp shirt', price: 159, note: 'Cotton voile' },
];

const list = document.getElementById('products');
const bagStatus = document.getElementById('bag-status');

list.innerHTML = PRODUCTS.map((p, i) => `
  <li class="product${i === 0 ? ' product-feature' : ''}" data-piece="${p.piece}">
    <div class="product-media">
      <img class="img-front" src="assets/products/piece-${p.piece}.webp" alt="${p.name}"
           width="900" height="1200" ${i < 3 ? '' : 'loading="lazy"'} decoding="async">
      <img class="img-turn" src="assets/products/piece-${p.piece}-alt.webp" alt=""
           width="900" height="1200" loading="lazy" decoding="async">
    </div>
    <div class="product-info">
      <h2 class="product-name">${p.name}</h2>
      <p class="product-price">RM ${p.price}</p>
      <p class="product-meta">${p.note}</p>
      ${p.story ? `<p class="product-story">${p.story}</p>` : ''}
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
  button.textContent = 'Added to bag';
  button.classList.add('is-added');
  clearTimeout(button._reset);
  button._reset = setTimeout(() => {
    button.textContent = 'Add to bag';
    button.classList.remove('is-added');
  }, 1800);
});

// Touch screens have no hover: a tap on the photo shows the turned view.
list.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'touch') return;
  const media = e.target.closest('.product-media');
  if (media) media.classList.toggle('is-turned');
});
