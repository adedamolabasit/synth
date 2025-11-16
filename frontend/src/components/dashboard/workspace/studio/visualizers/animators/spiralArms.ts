import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSpiralArms = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      const arm = obj.userData.arm || 0;
      const index = obj.userData.index || 0;
      const t = obj.userData.t || 0;
      const dataIndex = Math.floor(t * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.position.y = Math.sin(scaledTime * 2 + index * 0.1) * audioValue * 2;
      
      const scale = 1 + audioValue * 0.8;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = ((arm / 4) + scaledTime * 0.05) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.4);
      }

      obj.rotation.y = scaledTime * 0.5;
    }
  });
};
