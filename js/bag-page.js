// Maison Pois — Bag page: lists what's in the bag, lets people change
// quantities or remove items, and shows the totals.
import { findProduct, imageUrl, formatPrice } from './products.js?v=7';
import { getItems, getCount, setQuantity, removeFromBag, MAX_QTY } from './bag.js?v=7';

const listEl = document.getElementById('bag-items');
const layout = document.getElementById('bag-layout');
const empty = document.getElementById('bag-empty');
const summaryLine = document.getElementById('bag-summary-line');
const status = document.getElementById('bag-status');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const totalEl = document.getElementById('total');

const FREE_DELIVERY_FROM = 300;
const DELIVERY_FEE = 15;

function render() {
  const items = Object.entries(getItems());
  const count = getCount();

  empty.hidden = items.length > 0;
  layout.hidden = items.length === 0;
  summaryLine.textContent = count ? `${count} ${count === 1 ? 'item' : 'items'}` : '';
  if (!items.length) return;

  listEl.innerHTML = items.map(([id, qty]) => {
    const p = findProduct(id);
    return `
    <li class="bag-item" data-id="${id}">
      <a class="bag-thumb" href="new-in.html" tabindex="-1" aria-hidden="true">
        <img src="${imageUrl(id)}" alt="" width="1024" height="1536">
      </a>
      <div class="bag-item-info">
        <h2 class="bag-item-name">${p.name}</h2>
        <p class="bag-item-meta">${p.note}</p>
        <p class="bag-item-unit">${formatPrice(p.price)} each</p>
        <div class="qty" role="group" aria-label="Quantity of ${p.name}">
          <button type="button" data-action="dec" aria-label="Remove one ${p.name}">−</button>
          <span class="qty-value" aria-live="polite">${qty}</span>
          <button type="button" data-action="inc" aria-label="Add one more ${p.name}" ${qty >= MAX_QTY ? 'disabled' : ''}>+</button>
        </div>
        <button type="button" class="bag-remove" data-action="remove">Remove</button>
      </div>
      <p class="bag-item-total">${formatPrice(p.price * qty)}</p>
    </li>`;
  }).join('');

  const subtotal = items.reduce((sum, [id, qty]) => sum + findProduct(id).price * qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  subtotalEl.textContent = formatPrice(subtotal);
  deliveryEl.textContent = delivery ? formatPrice(delivery) : 'Free';
  totalEl.textContent = formatPrice(subtotal + delivery);
}

listEl.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  const id = button.closest('.bag-item').dataset.id;
  const p = findProduct(id);
  const qty = getItems()[id] || 0;
  const action = button.dataset.action;
  if (action === 'inc') setQuantity(id, qty + 1);
  if (action === 'dec') setQuantity(id, qty - 1);
  if (action === 'remove') removeFromBag(id);
  const now = getItems()[id] || 0;
  status.textContent = now ? `${p.name}: quantity ${now}.` : `Removed ${p.name} from your bag.`;
  // Keep keyboard focus on the same control after the list redraws.
  const again = listEl.querySelector(`.bag-item[data-id="${id}"] button[data-action="${action}"]`);
  (again && !again.disabled ? again : listEl.querySelector('button') || document.querySelector('.bag-empty a'))?.focus();
});

document.getElementById('checkout').addEventListener('click', () => {
  document.getElementById('checkout-note').textContent =
    'Checkout isn’t available, because Maison Pois is a showcase site.';
});

window.addEventListener('bag:change', render);
render();
