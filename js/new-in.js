// Maison Pois — New In page.
// Builds the product grid from the list below and wires up "Add to bag".
// Photos zoom in slightly on hover.
import { addToBag } from './bag.js';

// `image` is the file name in assets/products (without .webp).
const PRODUCTS = [
  { image: 'polka-dot-midi-slip-dress', name: 'Polka dot midi slip dress', price: 259, note: 'Black with cream dots' },
  { image: 'embroidered-denim-mini-dress', name: 'Embroidered denim mini dress', price: 229, note: 'Light wash denim' },
  { image: 'polka-dot-satin-mini-dress', name: 'Polka dot satin mini dress', price: 199, note: 'Chocolate satin' },
  { image: 'cut-out-eyelet-mini-dress', name: 'Cut-out eyelet mini dress', price: 219, note: 'White cotton' },
  { image: 'striped-boxy-long-sleeve-top', name: 'Striped boxy long-sleeve top', price: 139, note: 'Yellow stripe' },
  { image: 'studded-heart-pocket-jeans', name: 'Studded heart-pocket jeans', price: 249, note: 'Mid-blue denim' },
  { image: 'low-rise-denim-mini-skirt', name: 'Low-rise denim mini skirt', price: 159, note: 'Light wash denim' },
  { image: 'brushed-fringe-scarf', name: 'Brushed fringe scarf', price: 129, note: 'Soft pink' },
];

const list = document.getElementById('products');
const bagStatus = document.getElementById('bag-status');

list.innerHTML = PRODUCTS.map((p, i) => `
  <li class="product" data-image="${p.image}">
    <div class="product-media">
      <img src="assets/products/${p.image}.webp" alt="${p.name}"
           width="1024" height="1536" ${i < 4 ? '' : 'loading="lazy"'} decoding="async">
    </div>
    <div class="product-info">
      <h2 class="product-name">${p.name}</h2>
      <p class="product-price">RM ${p.price}</p>
      <p class="product-meta">${p.note}</p>
      <button class="add" type="button">Add to bag</button>
    </div>
  </li>`).join('');

list.addEventListener('click', (e) => {
  const button = e.target.closest('.add');
  if (!button) return;
  const card = button.closest('.product');
  const product = PRODUCTS.find((p) => p.image === card.dataset.image);
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
