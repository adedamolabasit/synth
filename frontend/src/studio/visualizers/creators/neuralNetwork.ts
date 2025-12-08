import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createNeuralNetworkVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const coreGroup = new THREE.Group();

  // CENTER CORE
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })
  );
  coreGroup.add(core);

  // NEURON LAYERS
  const layers = 4;
  const nodesPerLayer = 12;
  
  for (let layer = 0; layer < layers; layer++) {
    const radius = 3 + layer * 1.2;
    
    for (let i = 0; i < nodesPerLayer; i++) {
      const angle = (i / nodesPerLayer) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = (layer - layers/2) * 1.5;
      const z = Math.sin(angle) * radius;
      
      const neuron = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(i / nodesPerLayer, 0.8, 0.7),
          transparent: true,
          opacity: 0.8
        })
      );
      neuron.position.set(x, y, z);
      
      neuron.userData = {
        layer, i, radius, angle,
        basePosition: {x, y, z},
        phase: Math.random() * Math.PI * 2
      };
      
      coreGroup.add(neuron);
    }
  }

  // CONNECTIONS
  const connections = [];
  for (let i = 0; i < 50; i++) {
    const start = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 6
    );
    const end = start.clone().add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      )
    );
    
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2
      })
    );
    
    line.userData = { phase: Math.random() * Math.PI * 2 };
    connections.push(line);
    coreGroup.add(line);
  }

  coreGroup.userData = {
    type: "neuralNetwork",
    connections,
    activation: 0
  };

  scene.add(coreGroup);
  objects.push(coreGroup);
  
  // LIGHT
  const light = new THREE.PointLight(0xffffff, 1, 20);
  light.position.set(0, 0, 10);
  scene.add(light);

  return objects;
};