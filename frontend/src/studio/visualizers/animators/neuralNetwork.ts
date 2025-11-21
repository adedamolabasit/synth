import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateNeuralNetwork = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj, index) => {
    if (obj.userData.isNode && obj instanceof THREE.Mesh) {
      const { layer, index: nodeIndex, basePosition } = obj.userData;
      const dataIndex = Math.floor((nodeIndex / 8) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      // Node pulsation & wobble
      const scale = 1 + audioValue * 1.5;
      obj.scale.set(scale, scale, scale);

      const wobble = Math.sin(scaledTime * 2 + nodeIndex) * 0.2;
      obj.position.x = basePosition.x + wobble * (layer + 1) * 0.5;
      obj.position.y = basePosition.y + Math.cos(scaledTime * 1.5 + nodeIndex) * 0.2;
      obj.position.z = basePosition.z + Math.sin(scaledTime + nodeIndex) * 0.2;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (layer / 4 + scaledTime * 0.05 + audioValue * 0.3) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.emissive.setHSL(hue, 1, audioValue * 0.5);
        obj.material.opacity = 0.6 + audioValue * 0.4;
      }
    }

    else if (obj.userData.isConnection && obj instanceof THREE.Line) {
      const { layer } = obj.userData;
      const dataIndex = Math.floor((layer / 4) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      if (obj.material instanceof THREE.LineBasicMaterial) {
        obj.material.opacity = 0.1 + audioValue * 0.7;

        // Optional: slight color shift along audio
        const hue = (layer / 4 + scaledTime * 0.1 + audioValue * 0.3) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.6);
      }

      // Animate connections endpoints slightly for organic feel
      if (obj.geometry instanceof THREE.BufferGeometry) {
        const positions = obj.geometry.attributes.position.array as Float32Array;
        positions[0] += (Math.random() - 0.5) * 0.01 * audioValue;
        positions[1] += (Math.random() - 0.5) * 0.01 * audioValue;
        positions[2] += (Math.random() - 0.5) * 0.01 * audioValue;

        positions[3] += (Math.random() - 0.5) * 0.01 * audioValue;
        positions[4] += (Math.random() - 0.5) * 0.01 * audioValue;
        positions[5] += (Math.random() - 0.5) * 0.01 * audioValue;

        obj.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
};
