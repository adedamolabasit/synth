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
      const layer = obj.userData.layer || 0;
      const nodeIndex = obj.userData.index || 0;
      const dataIndex = Math.floor((nodeIndex / 8) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const scale = 1 + audioValue * 1.5;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (layer / 4 + scaledTime * 0.05) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.emissive.setHSL(hue, 1, audioValue * 0.5);
      }

      obj.position.y += Math.sin(scaledTime * 2 + nodeIndex) * 0.01;
    } else if (obj.userData.isConnection && obj instanceof THREE.Line) {
      const layer = obj.userData.layer || 0;
      const dataIndex = Math.floor((layer / 4) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      if (obj.material instanceof THREE.LineBasicMaterial) {
        obj.material.opacity = 0.2 + audioValue * 0.6;
      }
    }
  });
};
