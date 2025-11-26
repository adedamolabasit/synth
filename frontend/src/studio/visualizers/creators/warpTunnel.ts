import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createWarpTunnelVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const rings = Math.floor(30 * params.complexity);
  const segments = 32;

  for (let i = 0; i < rings; i++) {
    const z = i * 0.5 - rings * 0.25;
    const radius = 2 - (i / rings) * 0.5;

    const geometry = new THREE.TorusGeometry(radius, 0.1, 16, segments);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.6 + (i / rings) * 0.4, 1, 0.5),
      transparent: true,
      opacity: 0.7,
      wireframe: i % 2 === 0,
    });

    const ring = new THREE.Mesh(geometry, material);
    ring.position.z = z;
    ring.userData = { index: i };
    scene.add(ring);
    objects.push(ring);
  }

  return objects;
};
