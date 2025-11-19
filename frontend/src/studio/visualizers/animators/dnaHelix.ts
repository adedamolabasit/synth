import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateDNAHelix = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {

  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {

      // RESET POSITION + SCALE FIRST
      if (obj.userData.basePosition) {
        obj.position.copy(obj.userData.basePosition);
      }

      obj.scale.setScalar(obj.userData.baseScale ?? 1);

      const index = obj.userData.index || 0;
      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      if (obj.userData.isConnector) {
        // connector wobble
        obj.scale.y = 1 + audioValue * 0.4;

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.opacity = 0.4 + audioValue * 0.4;
        }

      } else {
        // DNA ball scale
        const scale = 1 + audioValue * 0.6;
        obj.scale.setScalar(scale);

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          const hue = obj.userData.strand === 1 ? 0.4 : 0.9;
          obj.material.color.setHSL(
            hue + audioValue * 0.1,
            0.8,
            0.5 + audioValue * 0.2
          );
        }
      }

      // subtle breathing motion — NOT cumulative
      obj.position.y += Math.sin(scaledTime * 2 + index) * 0.02;
    }
  });

  // beat effect — TEMPORARY, not permanent
  if (beatInfo?.isBeat) {
    objects.forEach(obj => {
      obj.scale.multiplyScalar(1.05);
    });
  }
};
