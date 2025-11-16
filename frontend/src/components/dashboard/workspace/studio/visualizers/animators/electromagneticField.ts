import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateElectromagneticField = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj) => {
    if (obj.userData.isCore && obj instanceof THREE.Mesh) {
      const avgAudio = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
      const scale = 1 + avgAudio * 0.8;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 1 + avgAudio;
      }
    } else if (obj.userData.isFieldLine && obj instanceof THREE.Line) {
      const index = obj.userData.index || 0;
      const dataIndex = Math.floor((index / 12) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.y += 0.01;

      if (obj.material instanceof THREE.LineBasicMaterial) {
        const hue = (0.6 + audioValue * 0.2) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.opacity = 0.4 + audioValue * 0.4;
      }
    }
  });
};
