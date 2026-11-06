// Maison Pois — New In page.
// Builds the product grid and wires up "Add to bag".
import { PRODUCTS, findProduct, imageUrl, formatPrice } from './products.js?v=7';
import { addToBag } from './bag.js?v=7';

const list = document.getElementById('products');
const bagStatus = document.getElementById('bag-status');

list.innerHTML = PRODUCTS.map((p, i) => `
  <li class="product" data-id="${p.id}">
    <div class="product-media">
      <img src="${imageUrl(p.id)}" alt="${p.name}"
           width="1024" height="1536" ${i < 4 ? '' : 'loading="lazy"'} decoding="async">
    </div>
    <div class="product-info">
      <h2 class="product-name">${p.name}</h2>
      <p class="product-price">${formatPrice(p.price)}</p>
      <p class="product-meta">${p.note}</p>
      <button class="add" type="button">Add to bag</button>
    </div>
  </li>`).join('');

list.addEventListener('click', (e) => {
  const button = e.target.closest('.add');
  if (!button) return;
  const product = findProduct(button.closest('.product').dataset.id);
  const total = addToBag(product.id);
  bagStatus.textContent = `Added ${product.name} to your bag. ${total} ${total === 1 ? 'item' : 'items'} in your bag.`;
  button.textContent = 'Added to bag';
  button.classList.add('is-added');
  clearTimeout(button._reset);
  button._reset = setTimeout(() => {
    button.textContent = 'Add to bag';
    button.classList.remove('is-added');
  }, 1800);
});
