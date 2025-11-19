import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateNebulaCloud = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Points) {
      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.x += 0.001;
      obj.rotation.y += 0.002;

      if (obj.material instanceof THREE.PointsMaterial) {
        obj.material.size = 0.15 + audioValue * 0.3;
        const hue = (index / objects.length + scaledTime * 0.05) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.5 + audioValue * 0.4);
        obj.material.opacity = 0.4 + audioValue * 0.4;
      }
    }
  });
};
