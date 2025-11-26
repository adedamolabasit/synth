import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCrystalLatticeVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const layers = Math.floor(4 + params.patternDensity * 3); 
  const crystalsPerLayer = Math.floor(30 + params.complexity * 20);

  for (let layer = 0; layer < layers; layer++) {
    const radius = 2 + layer * 1.5;
    const angleOffset = Math.random() * Math.PI * 2;

    for (let i = 0; i < crystalsPerLayer; i++) {
      const angle = (i / crystalsPerLayer) * Math.PI * 2 + angleOffset;
      const geometry = new THREE.OctahedronGeometry(0.15 + Math.random() * 0.1, 0);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        emissive: new THREE.Color().setHSL(Math.random(), 0.6, 0.2),
        transparent: true,
        opacity: 0.8,
        flatShading: true,
      });

      const crystal = new THREE.Mesh(geometry, material);

      crystal.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2 + layer * 0.5,
        Math.sin(angle) * radius
      );

      crystal.userData = {
        basePosition: crystal.position.clone(),
        angle,
        radius,
        layer,
        floatSpeed: 0.3 + Math.random() * 0.7,
        rotationSpeed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      };

      scene.add(crystal);
      objects.push(crystal);
    }
  }

  return objects;
};
