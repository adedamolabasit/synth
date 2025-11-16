import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCrystalLatticeVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const size = Math.floor(5 * params.complexity);
  const spacing = 1.5;

  const geometry = new THREE.OctahedronGeometry(0.3, 0);
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ddff,
    transparent: true,
    opacity: 0.7,
    flatShading: true,
  });

  for (let x = -size; x <= size; x++) {
    for (let y = -size; y <= size; y++) {
      for (let z = -size; z <= size; z++) {
        if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= size) {
          const crystal = new THREE.Mesh(geometry, material.clone());
          crystal.position.set(x * spacing, y * spacing, z * spacing);
          crystal.userData = {
            basePosition: crystal.position.clone(),
            phase: Math.random() * Math.PI * 2,
          };
          scene.add(crystal);
          objects.push(crystal);
        }
      }
    }
  }

  return objects;
};
