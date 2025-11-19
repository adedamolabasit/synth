import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateDNAOrigami = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh && !obj.userData.isConnector) {
      const objIndex = obj.userData.index || 0;
      const dataIndex = Math.floor((objIndex / 40) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.x += 0.01;
      obj.rotation.y += 0.02;

      const scale = 1 + audioValue * 0.5;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (objIndex / 40 + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.5 + audioValue * 0.3);
      }
    }
  });
};
