// Product catalogue shared by the New In page and the Bag page.
// `id` is the photo's file name in assets/products (without .webp).
export const PRODUCTS = [
  { id: 'polka-dot-midi-slip-dress', name: 'Polka dot midi slip dress', price: 259, note: 'Black with cream dots' },
  { id: 'embroidered-denim-mini-dress', name: 'Embroidered denim mini dress', price: 229, note: 'Light wash denim' },
  { id: 'polka-dot-satin-mini-dress', name: 'Polka dot satin mini dress', price: 199, note: 'Chocolate satin' },
  { id: 'cut-out-eyelet-mini-dress', name: 'Cut-out eyelet mini dress', price: 219, note: 'White cotton' },
  { id: 'striped-boxy-long-sleeve-top', name: 'Striped boxy long-sleeve top', price: 139, note: 'Yellow stripe' },
  { id: 'studded-heart-pocket-jeans', name: 'Studded heart-pocket jeans', price: 249, note: 'Mid-blue denim' },
  { id: 'low-rise-denim-mini-skirt', name: 'Low-rise denim mini skirt', price: 159, note: 'Light wash denim' },
  { id: 'brushed-fringe-scarf', name: 'Brushed fringe scarf', price: 129, note: 'Soft pink' },
];

export const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
export const imageUrl = (id) => `assets/products/${id}.webp`;
export const formatPrice = (n) => `RM ${n.toLocaleString('en-MY')}`;
