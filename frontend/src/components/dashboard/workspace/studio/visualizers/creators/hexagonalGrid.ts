import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createHexagonalGridVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const size = Math.floor(5 * params.complexity);
  const spacing = 1;

  for (let q = -size; q <= size; q++) {
    for (let r = -size; r <= size; r++) {
      if (Math.abs(q) + Math.abs(r) + Math.abs(-q - r) <= size * 2) {
        const x = spacing * (3/2 * q);
        const z = spacing * (Math.sqrt(3) * (r + q/2));

        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 6);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
          transparent: true,
          opacity: 0.8,
        });

        const hexagon = new THREE.Mesh(geometry, material);
        hexagon.position.set(x, 0, z);
        hexagon.rotation.y = Math.PI / 6;
        hexagon.userData = { q, r, gridPos: { x, z } };
        scene.add(hexagon);
        objects.push(hexagon);
      }
    }
  }

  return objects;
};
