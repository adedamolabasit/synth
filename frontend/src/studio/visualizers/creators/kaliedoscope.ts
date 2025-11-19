import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createKaleidoscopeVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const segments = Math.floor(8 * params.complexity);
  const layers = Math.floor(5 * params.patternDensity);

  for (let layer = 0; layer < layers; layer++) {
    const radius = 2 + layer * 0.8;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / segments, 1, 0.5),
        transparent: true,
        opacity: 0.8,
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        layer * 0.3 - layers * 0.15
      );
      cube.userData = { angle, layer, segment: i };
      scene.add(cube);
      objects.push(cube);
    }
  }

  return objects;
};
