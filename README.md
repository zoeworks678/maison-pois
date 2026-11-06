# Maison Pois — 3D rack hero

A showcase landing-page hero for a fictional clothing label. A 3D clothing rack sits in the hero, and each garment swings from the rail when your cursor brushes past it. On phones, tapping a piece sets it swinging.

Plain HTML, CSS and JavaScript using [Three.js](https://threejs.org) (included in `vendor/`). There's no build step.

## Files

```
index.html               home page with the 3D rack hero
new-in.html              New In product page
css/style.css            layout, colours, type (both pages)
js/hero.js               hero 3D scene and swing physics
js/new-in.js             product grid, hover photo swap, Add to bag
js/bag.js                bag counter shared by both pages (kept in the browser)
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

Product names, prices and fabric notes are in the `PRODUCTS` list at the top of `js/new-in.js`. Photos are free stock photos from [Pexels](https://www.pexels.com/license/), loaded straight from Pexels. `photo` is the Pexels photo id (the number at the end of a Pexels photo page URL), and the optional `turn` is a second photo shown on hover. To swap a photo, find one on Pexels and paste its id. The first product in the list is shown large.

## Tweaking the swing

At the top of `js/hero.js`:

- `PUSH` sets how strongly the cursor pushes the clothes.
- `DAMPING` sets how quickly they settle. Raise it for a shorter swing.
- `MAX_ANGLE` is the furthest a garment can swing, in radians.

## Model

The model was generated with Meshy AI. It was split into a rack and nine separate garments, each pivoting at the rail, then compressed (WebP textures and meshopt geometry). Before you publish, check that your Meshy plan allows public use.
