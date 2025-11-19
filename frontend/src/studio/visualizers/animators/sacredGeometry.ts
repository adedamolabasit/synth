import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSacredGeometry = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.userData.isVertex) {
        const vertexIndex = obj.userData.index || 0;
        const dataIndex = Math.floor((vertexIndex / 9) * frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;

        const scale = 1 + audioValue * 0.8;
        obj.scale.set(scale, scale, scale);

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.emissiveIntensity = 0.5 + audioValue * 0.5;
        }
      } else {
        const layer = obj.userData.layer || 0;
        const angle = obj.userData.angle || 0;
        const dataIndex = Math.floor((layer / 5) * frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;

        obj.rotation.x = scaledTime * (layer + 1) * 0.3;
        obj.rotation.y = scaledTime * (layer + 1) * 0.2;

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          const hue = (layer / 5 + scaledTime * 0.05) % 1;
          obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
          obj.material.opacity = 0.6 + audioValue * 0.3;
        }
      }
    }
  });
};
