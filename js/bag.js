// Shared bag counter for every page. The count is kept in this browser only
// (localStorage), since this is a showcase site with no checkout.
const KEY = 'maisonpois.bag';

function read() {
  try { return Math.max(0, parseInt(localStorage.getItem(KEY), 10) || 0); }
  catch { return 0; }
}

function write(n) {
  try { localStorage.setItem(KEY, String(n)); } catch { /* storage blocked: count lasts for this page only */ }
}

let count = read();

function render(bump = false) {
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

export function addToBag() {
  count += 1;
  write(count);
  render(true);
  return count;
}

// Keep the count in step if the site is open in another tab.
window.addEventListener('storage', (e) => { if (e.key === KEY) { count = read(); render(); } });
render();
