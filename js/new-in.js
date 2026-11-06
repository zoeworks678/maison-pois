// Maison Pois — New In page.
// Builds the product grid from the list below and wires up "Add to bag".
// Products with a second photo fade to it on hover; the rest zoom in slightly.
import { addToBag } from './bag.js';

// Photos are free stock photos from Pexels (pexels.com/license), loaded
// straight from Pexels. `photo` is the Pexels photo id; `turn` is an optional
// second photo from the same shoot, shown on hover. The first product is shown large.
const PRODUCTS = [
  { photo: 3746241, credit: 'Anna Shvets', name: 'Studio polka midi dress', price: 289, note: 'Viscose crêpe',
    story: 'Our signature dot on a fluid midi that moves as you walk. Fitted through the bodice, softly flared below the waist.' },
  { photo: 5885738, credit: 'Polina', name: 'Ivory spot tea dress', price: 259, note: 'Cotton lawn' },
  { photo: 21175953, credit: 'Kinz-studio Photographe', name: 'Monochrome dot blouse', price: 169, note: 'Silk crêpe' },
  { photo: 29625628, credit: 'Robinson Luque', name: 'Cherry dot swing dress', price: 299, note: 'Cotton poplin' },
  { photo: 8350511, turn: 8350517, credit: 'Mikhail Nilov', name: 'Midnight dot maxi dress', price: 279, note: 'Viscose twill' },
  { photo: 11203434, credit: 'Lany-Jade Mondou', name: 'Cropped dot blouse', price: 149, note: 'Cotton voile' },
  { photo: 3968443, turn: 3968444, credit: 'Anna Kanifatova', name: 'Garden dot dress', price: 249, note: 'Cotton lawn' },
  { photo: 5764472, credit: 'Daria Ivanenko', name: 'Seaside red dot dress', price: 269, note: 'Washed linen' },
  { photo: 34097018, credit: 'Alena Evseenko', name: 'Relaxed dot day dress', price: 229, note: 'Cotton voile' },
];

const photoUrl = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const srcset = (id) => [500, 800, 1200].map((w) => `${photoUrl(id, w)} ${w}w`).join(', ');

const list = document.getElementById('products');
const bagStatus = document.getElementById('bag-status');

list.innerHTML = PRODUCTS.map((p, i) => {
  const sizes = i === 0 ? '(max-width: 1000px) 100vw, 50vw' : '(max-width: 1000px) 50vw, 25vw';
  return `
  <li class="product${i === 0 ? ' product-feature' : ''}" data-photo="${p.photo}">
    <div class="product-media${p.turn ? ' has-turn' : ''}">
      <img class="img-front" src="${photoUrl(p.photo, 800)}" srcset="${srcset(p.photo)}" sizes="${sizes}"
           alt="${p.name}" ${i < 3 ? '' : 'loading="lazy"'} decoding="async">
      ${p.turn ? `<img class="img-turn" src="${photoUrl(p.turn, 800)}" srcset="${srcset(p.turn)}" sizes="${sizes}"
           alt="" loading="lazy" decoding="async">` : ''}
    </div>
    <div class="product-info">
      <h2 class="product-name">${p.name}</h2>
      <p class="product-price">RM ${p.price}</p>
      <p class="product-meta">${p.note}</p>
      ${p.story ? `<p class="product-story">${p.story}</p>` : ''}
      <button class="add" type="button">Add to bag</button>
    </div>
  </li>`;
}).join('');

// Photo credits in the footer.
const credits = document.getElementById('photo-credits');
if (credits) {
  const names = [...new Set(PRODUCTS.map((p) => p.credit))];
  credits.innerHTML = `Photography by ${names.join(', ')} on <a href="https://www.pexels.com">Pexels</a>.`;
}

list.addEventListener('click', (e) => {
  const button = e.target.closest('.add');
  if (!button) return;
  const card = button.closest('.product');
  const product = PRODUCTS.find((p) => p.photo === Number(card.dataset.photo));
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

// Touch screens have no hover: a tap on the photo shows the second photo.
list.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'touch') return;
  const media = e.target.closest('.product-media.has-turn');
  if (media) media.classList.toggle('is-turned');
});
