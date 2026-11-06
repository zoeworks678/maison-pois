# Maison Pois — 3D rack hero

A showcase landing-page hero for a fictional clothing label. A 3D clothing rack sits in the hero, and each garment swings from the rail when your cursor brushes past it. On phones, tapping a piece sets it swinging.

Plain HTML, CSS and JavaScript using [Three.js](https://threejs.org) (included in `vendor/`). There's no build step.

## Files

```
index.html               home page with the 3D rack hero
new-in.html              New In product page
bag.html                 Bag page (items, quantities, totals)
css/style.css            layout, colours, type (both pages)
js/hero.js               hero 3D scene and swing physics
js/products.js           product list (names, prices, photos) used by every page
js/new-in.js             product grid and Add to bag
js/bag-page.js           Bag page: quantities, remove, totals
assets/products/         product photos
js/bag.js                the bag, shared by every page (kept in the visitor's browser)
assets/wardrobe-rack.glb 3D model (rack + 9 garments, compressed, 2.1 MB)
vendor/three/            Three.js r170 (MIT licence)
```

## Run it locally

Browsers block 3D models opened straight from disk, so use a small local server:

```
cd maison-pois
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages

1. Create a new public repository on GitHub, for example `maison-pois`.
2. Upload everything in this folder to the repository root. Either drag and drop it under **Add file → Upload files**, or run:
   ```
   git init
   git add .
   git commit -m "3D rack hero"
   git branch -M main
   git remote add origin https://github.com/<your-username>/maison-pois.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**. Under **Source**, choose **Deploy from a branch**, then pick `main` and `/ (root)` and save.
4. After a minute or two, the site is live at `https://<your-username>.github.io/maison-pois/`.

## Editing products

Product names, prices and notes are in the `PRODUCTS` list in `js/products.js`. Each product's `image` is a file name in `assets/products/` (without `.webp`). To add or swap a product, put the photo in that folder and add a line to the list.

## Tweaking the swing

At the top of `js/hero.js`:

- `PUSH` sets how strongly the cursor pushes the clothes.
- `DAMPING` sets how quickly they settle. Raise it for a shorter swing.
- `MAX_ANGLE` is the furthest a garment can swing, in radians.

## Model

The model was generated with Meshy AI. It was split into a rack and nine separate garments, each pivoting at the rail, then compressed (WebP textures and meshopt geometry). Before you publish, check that your Meshy plan allows public use.
