import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateKaleidoscope = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const segment = obj.userData.segment || 0;
      const layer = obj.userData.layer || 0;
      const dataIndex = Math.floor((segment / 8) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.z = scaledTime * (layer + 1) * 0.5;
      
      const scale = 1 + audioValue * 0.5;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (segment / 8 + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
      }
    }
  });
};
