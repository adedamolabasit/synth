// creators/holographicGrid.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createHolographicGridVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const gridGroup = new THREE.Group();
  
  const gridSize = 15;
  const gridPoints: THREE.Mesh[] = [];
  const gridLines: THREE.Line[] = [];

  // Create grid points
  for (let x = -gridSize; x <= gridSize; x += 2) {
    for (let z = -gridSize; z <= gridSize; z += 2) {
      if (Math.random() > 0.6) continue; // Sparse grid
      
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.7 + Math.random() * 0.2, 0.9, 0.6),
        transparent: true,
        opacity: 0.7
      });

      const gridPoint = new THREE.Mesh(geometry, material);
      gridPoint.position.set(x, 0, z);
      gridGroup.add(gridPoint);
      gridPoints.push(gridPoint);
    }
  }

  // Create vertical lines
  for (let x = -gridSize; x <= gridSize; x += 4) {
    for (let z = -gridSize; z <= gridSize; z += 4) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([x, -5, z, x, 5, z]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.7, 0.8, 0.5),
        transparent: true,
        opacity: 0.3
      });

      const line = new THREE.Line(geometry, material);
      gridGroup.add(line);
      gridLines.push(line);
    }
  }

  // Create horizontal grid lines
  for (let x = -gridSize; x <= gridSize; x += 2) {
    for (let y = -4; y <= 4; y += 2) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([-gridSize, y, x, gridSize, y, x]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.6, 0.8, 0.5),
        transparent: true,
        opacity: 0.2
      });

      const line = new THREE.Line(geometry, material);
      gridGroup.add(line);
      gridLines.push(line);
    }
  }

  gridGroup.userData = {
    type: "holographicGrid",
    gridPoints,
    gridLines,
    baseHeights: gridPoints.map(p => p.position.y),
    dataFlows: gridPoints.map(() => Math.random()),
    scanPosition: 0,
    isLyrics: false,
  };

  scene.add(gridGroup);
  objects.push(gridGroup);
  return objects;
};