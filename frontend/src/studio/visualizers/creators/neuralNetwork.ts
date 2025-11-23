// creators/neuralNetwork.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createNeuralNetworkVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const layers = 6;
  const nodesPerLayer = 12;
  const neuralGroup = new THREE.Group();

  // Create neural nodes and connections
  const nodes: THREE.Vector3[] = [];
  const connections: THREE.Line[] = [];

  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = 2 + layer * 1.5;
    const angleStep = (Math.PI * 2) / nodesPerLayer;
    
    for (let node = 0; node < nodesPerLayer; node++) {
      const angle = node * angleStep;
      const x = Math.cos(angle) * layerRadius;
      const y = (layer - layers / 2) * 2;
      const z = Math.sin(angle) * layerRadius;

      // Create neuron node
      const geometry = new THREE.SphereGeometry(0.3, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(layer / layers, 0.8, 0.6),
        transparent: true,
        opacity: 0.8
      });
      
      const neuron = new THREE.Mesh(geometry, material);
      neuron.position.set(x, y, z);
      neuralGroup.add(neuron);
      nodes.push(new THREE.Vector3(x, y, z));

      // Connect to previous layer
      if (layer > 0) {
        const prevLayerStart = (layer - 1) * nodesPerLayer;
        for (let prevNode = 0; prevNode < nodesPerLayer; prevNode++) {
          if (Math.random() > 0.7) { // 30% connection density
            const connectionGeometry = new THREE.BufferGeometry();
            const connectionPositions = new Float32Array(6);
            const prevNodePos = nodes[prevLayerStart + prevNode];
            
            connectionPositions[0] = prevNodePos.x;
            connectionPositions[1] = prevNodePos.y;
            connectionPositions[2] = prevNodePos.z;
            connectionPositions[3] = x;
            connectionPositions[4] = y;
            connectionPositions[5] = z;

            connectionGeometry.setAttribute('position', new THREE.BufferAttribute(connectionPositions, 3));
            
            const connectionMaterial = new THREE.LineBasicMaterial({
              color: new THREE.Color().setHSL((layer / layers + prevNode / nodesPerLayer) / 2, 0.6, 0.5),
              transparent: true,
              opacity: 0.3
            });

            const connection = new THREE.Line(connectionGeometry, connectionMaterial);
            neuralGroup.add(connection);
            connections.push(connection);
          }
        }
      }
    }
  }

  neuralGroup.userData = {
    type: "neuralNetwork",
    layers,
    nodesPerLayer,
    nodes,
    connections,
    activationLevels: Array.from({ length: layers * nodesPerLayer }, () => 0),
    signalPropagation: 0,
    isLyrics: false,
  };

  scene.add(neuralGroup);
  objects.push(neuralGroup);
  return objects;
};