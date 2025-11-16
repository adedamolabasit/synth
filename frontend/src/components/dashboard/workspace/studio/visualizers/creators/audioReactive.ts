import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createAudioReactiveVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const rings = 8;
  const segments = 64;

  for (let ring = 0; ring < rings; ring++) {
    const radius = 2 + ring * 1.5;
    const geometry = new THREE.TorusGeometry(radius, 0.3, 16, segments);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(ring / rings, 0.9, 0.6),
      transparent: true,
      opacity: 0.8,
    });

    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.PI / 2;
    torus.userData = { ring, radius, segments };

    scene.add(torus);
    objects.push(torus);
  }

  return objects;
};