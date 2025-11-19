import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCrystalLattice = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;
      const phase = obj.userData.phase;

      obj.rotation.x = scaledTime + phase;
      obj.rotation.y = scaledTime * 0.7 + phase;
      
      const scale = 0.8 + audioValue * 0.5;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (index / objects.length + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.5 + audioValue * 0.3);
        obj.material.emissive.setHSL(hue, 0.8, audioValue * 0.5);
      }
    }
  });
};
