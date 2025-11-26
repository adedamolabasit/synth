import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCosmicWebVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const nodes = Math.floor(30 * params.patternDensity);
  const nodePositions: THREE.Vector3[] = [];

  for (let i = 0; i < nodes; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
    nodePositions.push(position);

    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x4488ff,
      transparent: true,
      opacity: 0.9,
    });

    const node = new THREE.Mesh(geometry, material);
    node.position.copy(position);
    node.userData = { index: i, isNode: true };
    scene.add(node);
    objects.push(node);
  }

  const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.3,
  });

  for (let i = 0; i < nodes; i++) {
    for (let j = i + 1; j < nodes; j++) {
      const distance = nodePositions[i].distanceTo(nodePositions[j]);
      if (distance < 3) {
        const points = [nodePositions[i], nodePositions[j]];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, connectionMaterial.clone());
        line.userData = { from: i, to: j, distance, isConnection: true };
        scene.add(line);
        objects.push(line);
      }
    }
  }

  return objects;
};
