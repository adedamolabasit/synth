import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateFractalTree = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const depth = obj.userData.depth || 0;
      const pulsePhase = obj.userData.pulsePhase || 0;
      const dataIndex = Math.min(
        Math.floor((depth / 7) * frequencyData.length),
        frequencyData.length - 1
      );
      const audioValue = frequencyData[dataIndex] / 255;

      const pulse = 1 + Math.sin(scaledTime * 2 + pulsePhase) * 0.1 * audioValue;
      obj.scale.y = pulse;

      obj.rotation.z = Math.sin(scaledTime * 0.5 + depth) * 0.1 * audioValue;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (0.3 - depth * 0.05 + audioValue * 0.2) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.5);
      }
    }
  });
};
