import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateMoleculeBonds = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj) => {
    if (obj.userData.isAtom && obj instanceof THREE.Mesh) {
      const atomIndex = obj.userData.index || 0;
      const dataIndex = Math.floor((atomIndex / 15) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const scale = 1 + audioValue * 0.7;
      obj.scale.set(scale, scale, scale);

      obj.position.x += Math.sin(scaledTime + atomIndex) * 0.01;
      obj.position.y += Math.cos(scaledTime + atomIndex) * 0.01;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissive = obj.material.color.clone().multiplyScalar(audioValue * 0.5);
      }
    } else if (obj.userData.isBond && obj instanceof THREE.Mesh) {
      const from = obj.userData.from || 0;
      const dataIndex = Math.floor((from / 15) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.scale.x = 1 + audioValue * 0.4;
      obj.scale.z = 1 + audioValue * 0.4;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.opacity = 0.6 + audioValue * 0.3;
      }
    }
  });
};
