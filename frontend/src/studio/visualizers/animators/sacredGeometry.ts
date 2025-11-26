import * as THREE from "three";
import { BeatInfo } from "../../types/visualizer";

export const animateSacredGeometry = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;

  const bass = (beatInfo?.bandStrengths?.bass ?? 0) * 0.01;
  const mid = (beatInfo?.bandStrengths?.mid ?? 0) * 0.01;
  const treble = (beatInfo?.bandStrengths?.treble ?? 0) * 0.01;

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    if (obj.userData.type === "vertex") {
      const index = obj.userData.index;
      const dataIndex = Math.floor((index / 9) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.position.y = obj.userData.baseY + bass * 3 * audioValue;
      obj.scale.setScalar(1 + bass * 0.8 * audioValue);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 0.5 + bass * audioValue;
        obj.material.emissive.setHSL(audioValue * 0.1, 1, 0.5);
      }
    } else if (obj.userData.type === "ring") {
      const layer = obj.userData.layer;
      const index = obj.userData.index;
      const baseRadius = obj.userData.baseRadius;
      const dataIndex = Math.floor((layer / 5) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const angleOffset = scaledTime * 0.5 * (layer + 1) + index * 0.1;
      const radius = baseRadius + mid * 1.5 * audioValue;

      obj.position.x = Math.cos(obj.userData.angle + angleOffset) * radius;
      obj.position.z = Math.sin(obj.userData.angle + angleOffset) * radius;
      obj.position.y = Math.sin(scaledTime * 2 + layer) * 0.5 * audioValue;

      obj.rotation.x = scaledTime * 0.3 * (layer + 1);
      obj.rotation.y = scaledTime * 0.2 * (layer + 1);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (layer / 5 + scaledTime * 0.05 + treble * 0.2) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.opacity = 0.6 + audioValue * 0.4;
      }
    }
  });
};
