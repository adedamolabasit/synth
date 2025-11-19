import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createMandalaVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const symmetry = 8;
  const rings = Math.floor(6 * params.complexity);

  for (let ring = 0; ring < rings; ring++) {
    const radius = 0.5 + ring * 0.5;
    
    for (let i = 0; i < symmetry; i++) {
      const angle = (i / symmetry) * Math.PI * 2;
      const geometry = new THREE.SphereGeometry(0.15, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((ring / rings), 1, 0.5),
        transparent: true,
        opacity: 0.9,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );
      sphere.userData = { ring, symmetry: i, angle };
      scene.add(sphere);
      objects.push(sphere);

      // Petals
      const petalGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
      const petal = new THREE.Mesh(petalGeometry, material.clone());
      petal.position.copy(sphere.position);
      petal.lookAt(
        Math.cos(angle) * (radius + 0.5),
        Math.sin(angle) * (radius + 0.5),
        0
      );
      petal.userData = { ring, symmetry: i, isPetal: true };
      scene.add(petal);
      objects.push(petal);
    }
  }

  return objects;
};
