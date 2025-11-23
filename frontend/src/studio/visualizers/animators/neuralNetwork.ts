// animations/neuralNetwork.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateNeuralNetwork = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[5] / 255;
  const mid = frequencyData[60] / 255;
  const treble = frequencyData[110] / 255;

  // Neural network camera - orbiting around the brain
  if (camera) {
    camera.position.x = Math.sin(time * 0.1) * 15;
    camera.position.y = Math.sin(time * 0.05) * 3;
    camera.position.z = Math.cos(time * 0.1) * 15;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "neuralNetwork") return;

    const activationLevels = obj.userData.activationLevels as number[];
    const nodes = obj.userData.nodes as THREE.Vector3[];
    const connections = obj.userData.connections as THREE.Line[];
    const signalPropagation = obj.userData.signalPropagation;

    // Update signal propagation
    obj.userData.signalPropagation = (signalPropagation + params.speed * 0.01) % 1;

    // Process each neural node
    obj.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        // Neuron activation based on frequency data
        const layer = Math.floor(index / obj.userData.nodesPerLayer);
        const nodeIndex = index % obj.userData.nodesPerLayer;
        const freqIndex = Math.floor((nodeIndex / obj.userData.nodesPerLayer) * frequencyData.length);
        const activation = frequencyData[freqIndex] / 255;

        // Pulsing effect based on activation
        const pulse = Math.sin(time * 3 + layer * 0.5) * 0.2 + 0.8;
        const scale = 0.3 + activation * 0.4 * pulse;
        child.scale.setScalar(scale);

        // Color based on activation and layer
        const material = child.material as THREE.MeshBasicMaterial;
        const hue = (layer / obj.userData.layers + activation * 0.3) % 1;
        const saturation = 0.7 + activation * 0.3;
        material.color.setHSL(hue, saturation, 0.6);
        material.opacity = 0.6 + activation * 0.4;

        // Neural firing - random spikes
        if (Math.random() < activation * 0.1) {
          child.scale.setScalar(scale * 1.5);
          material.opacity = 1;
        }
      }
    });

    // Animate connections
    connections.forEach((connection, index) => {
      const material = connection.material as THREE.LineBasicMaterial;
      const pulse = Math.sin(time * 2 + index * 0.1) * 0.3 + 0.7;
      material.opacity = 0.2 + bass * 0.3 * pulse;

      // Signal propagation along connections
      if (beatInfo?.isBeat && Math.random() < 0.3) {
        material.opacity = 1;
        material.color.setHSL(Math.random(), 0.8, 0.7);
      }
    });

    // Global network rotation
    obj.rotation.y += params.rotationSpeed * 0.001;
    obj.rotation.x += Math.sin(time * 0.2) * 0.01;

    // Beat-induced neural cascade
    if (beatInfo?.isBeat) {
      // Cascade activation through layers
      for (let layer = 0; layer < obj.userData.layers; layer++) {
        setTimeout(() => {
          const layerStart = layer * obj.userData.nodesPerLayer;
          const layerEnd = layerStart + obj.userData.nodesPerLayer;
          
          for (let i = layerStart; i < layerEnd; i++) {
            if (i < obj.children.length && obj.children[i] instanceof THREE.Mesh) {
              const neuron = obj.children[i] as THREE.Mesh;
              neuron.scale.setScalar(1.2);
              (neuron.material as THREE.MeshBasicMaterial).opacity = 1;
            }
          }
        }, layer * 50);
      }
    }
  });
};