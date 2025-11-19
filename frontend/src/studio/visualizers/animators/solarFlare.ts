import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSolarFlare = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.userData.isSun) {
        const avgAudio = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
        const scale = 1 + avgAudio * 0.3;
        obj.scale.set(scale, scale, scale);

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.emissiveIntensity = 0.8 + avgAudio * 0.5;
        }

        obj.rotation.y += 0.005;
      } else {
        const flareIndex = obj.userData.index || 0;
        const angle = obj.userData.angle || 0;
        const dataIndex = Math.floor((flareIndex / 12) * frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;

        const baseDistance = 1.2;
        const distance = baseDistance + audioValue * 2;
        obj.position.set(
          Math.cos(angle + scaledTime * 0.5) * distance,
          Math.sin(angle + scaledTime * 0.5) * distance,
          0
        );

        obj.lookAt(
          Math.cos(angle + scaledTime * 0.5) * (distance + 3),
          Math.sin(angle + scaledTime * 0.5) * (distance + 3),
          0
        );

        obj.scale.y = 1 + audioValue * 2;

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.opacity = 0.6 + audioValue * 0.4;
          obj.material.emissiveIntensity = audioValue;
        }
      }
    }
  });
};
