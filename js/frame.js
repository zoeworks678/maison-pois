// Shared camera framing for a single garment, used by the New In product
// tiles (live 3D) and by the script that renders their still images, so the
// still and the 3D view line up exactly.
import * as THREE from 'three';

export const TILE_ASPECT = 3 / 4;   // width / height of a product tile
export const RAIL_FROM_TOP = 0.1;   // the hanger hook sits 10% down the tile
const FOV = 22;

// Garments hang side-on along the rail; a quarter turn shows the front.
export const REST_TURN = -Math.PI / 2;

export function makeCamera() {
  return new THREE.PerspectiveCamera(FOV, TILE_ASPECT, 0.05, 50);
}

// Point `camera` at the garment whose pivot node is `pivot` (pivot = hook on
// the rail). Call with the garment at its resting rotation.
export function frameGarment(camera, pivot, root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(pivot);
  const hook = new THREE.Vector3().setFromMatrixPosition(pivot.matrixWorld);
  const length = hook.y - box.min.y;
  const width = box.max.x - box.min.x;
  const span = Math.max(
    length / (1 - RAIL_FROM_TOP - 0.06),                  // fit the height
    (width * 1.18) / camera.aspect                         // and the width
  );
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = span / 2 / Math.tan(fov / 2);
  const centreY = hook.y + RAIL_FROM_TOP * span - span / 2;
  const cx = (box.min.x + box.max.x) / 2;
  camera.position.set(cx, centreY, hook.z + dist);
  camera.lookAt(cx, centreY, hook.z);
  camera.updateProjectionMatrix();
}
