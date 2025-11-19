import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateMandala = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const ring = obj.userData.ring || 0;
      const symmetry = obj.userData.symmetry || 0;
      const dataIndex = Math.floor((symmetry / 8) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.z = scaledTime * (ring + 1) * 0.3;
      
      const scale = 1 + audioValue * 0.6;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = ((ring / 6) + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
      }
    }
  });
};
