import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSupernova = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  const avgAudio = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
  
  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.userData.isCore) {
        const scale = 1 + avgAudio * 1.5;
        obj.scale.set(scale, scale, scale);

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.emissiveIntensity = 1.5 + avgAudio * 1.5;
        }
      } else {
        const direction = obj.userData.direction;
        const speed = obj.userData.speed || 1;
        const index = obj.userData.index || 0;
        const dataIndex = Math.floor((index / 200) * frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;

        obj.position.add(direction.clone().multiplyScalar(0.05 * speed * (1 + audioValue)));

        // Reset particles that go too far
        if (obj.position.length() > 10) {
          obj.position.set(0, 0, 0);
        }

        const scale = 1 + audioValue * 0.8;
        obj.scale.set(scale, scale, scale);

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.opacity = 0.8 - (obj.position.length() / 10) * 0.5;
          obj.material.emissiveIntensity = audioValue;
        }
      }
    }
  });
};
