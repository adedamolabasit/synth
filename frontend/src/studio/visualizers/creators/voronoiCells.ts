import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createVoronoiCellsVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const cellCount = Math.floor(20 * params.patternDensity);

  for (let i = 0; i < cellCount; i++) {
    const geometry = new THREE.DodecahedronGeometry(0.5, 0);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / cellCount, 0.8, 0.5),
      transparent: true,
      opacity: 0.7,
      wireframe: Math.random() > 0.5,
    });

    const cell = new THREE.Mesh(geometry, material);
    cell.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    );
    cell.userData = { index: i, rotationSpeed: Math.random() * 0.02 };
    scene.add(cell);
    objects.push(cell);
  }

  return objects;
};
