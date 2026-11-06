// The bag, shared by every page. It's kept in this browser only (localStorage),
// since this is a showcase site with no checkout.
// Stored as { "<product id>": quantity, ... }.
import { findProduct } from './products.js?v=7';

const KEY = 'maisonpois.bag.items';
const MAX_QTY = 10;

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY)) || {};
    // Drop anything that isn't a current product or a sensible quantity.
    return Object.fromEntries(Object.entries(data)
      .filter(([id, q]) => findProduct(id) && Number.isInteger(q) && q > 0)
      .map(([id, q]) => [id, Math.min(q, MAX_QTY)]));
  } catch { return {}; }
}

let items = read();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked: bag lasts for this page only */ }
  render(true);
  window.dispatchEvent(new CustomEvent('bag:change'));
}

export const getItems = () => ({ ...items });
export const getCount = () => Object.values(items).reduce((a, b) => a + b, 0);

export function addToBag(id) {
  items[id] = Math.min((items[id] || 0) + 1, MAX_QTY);
  save();
  return getCount();
}

export function setQuantity(id, qty) {
  if (qty <= 0) delete items[id];
  else items[id] = Math.min(qty, MAX_QTY);
  save();
}

export const removeFromBag = (id) => setQuantity(id, 0);
export { MAX_QTY };

// Update every bag counter in the nav.
function render(bump = false) {
  const count = getCount();
  document.querySelectorAll('.bag').forEach((link) => {
    link.setAttribute('aria-label', `Bag, ${count} ${count === 1 ? 'item' : 'items'}`);
    const badge = link.querySelector('.bag-count');
    if (!badge) return;
    badge.textContent = count;
    if (bump) {
      badge.classList.remove('is-bumped');
      void badge.offsetWidth;            // restart the animation
      badge.classList.add('is-bumped');
    }
  });
}

// Keep in step when the site is open in another tab.
window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  items = read();
  render();
  window.dispatchEvent(new CustomEvent('bag:change'));
});
render();
