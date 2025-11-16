import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createNeuralNetworkVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const layers = 4;
  const nodesPerLayer = Math.floor(8 * params.patternDensity);

  const nodeMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x003366,
    transparent: true,
    opacity: 0.9,
  });

  const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.3,
  });

  const nodePositions: THREE.Vector3[][] = [];

  // Create nodes
  for (let layer = 0; layer < layers; layer++) {
    nodePositions[layer] = [];
    const layerZ = (layer - layers / 2) * 2;

    for (let i = 0; i < nodesPerLayer; i++) {
      const angle = (i / nodesPerLayer) * Math.PI * 2;
      const radius = 3;
      const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        layerZ
      );
      nodePositions[layer].push(position);

      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        nodeMaterial.clone()
      );
      node.position.copy(position);
      node.userData = { layer, index: i, isNode: true };
      scene.add(node);
      objects.push(node);
    }
  }

  // Create connections
  for (let layer = 0; layer < layers - 1; layer++) {
    for (let i = 0; i < nodesPerLayer; i++) {
      for (let j = 0; j < nodesPerLayer; j++) {
        if (Math.random() > 0.6) {
          const points = [nodePositions[layer][i], nodePositions[layer + 1][j]];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geometry, connectionMaterial.clone());
          line.userData = { isConnection: true, from: i, to: j, layer };
          scene.add(line);
          objects.push(line);
        }
      }
    }
  }

  return objects;
};
