import * as THREE from "three";
import { BeatInfo } from "../../types/visualizer";

export const animateSpiralArms = (
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

    const arm = obj.userData.arm || 0;
    const index = obj.userData.index || 0;
    const t = obj.userData.t || 0;
    const baseRadius = obj.userData.baseRadius || 1;
    const baseY = obj.userData.baseY || 0;

    const dataIndex = Math.floor(t * frequencyData.length);
    const audioValue = frequencyData[dataIndex] / 255;

    const angle =
      t * Math.PI * 6 + (arm / 4) * Math.PI * 2 + scaledTime * (0.5 + mid);
    const radius = baseRadius * (1 + bass * audioValue);
    const height =
      baseY + Math.sin(scaledTime * 2 + index * 0.2) * audioValue * 1.5;

    obj.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    const scale = 0.5 + audioValue * 1.2;
    obj.scale.set(scale, scale, scale);

    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (arm / 4 + scaledTime * 0.1 + treble * 0.3) % 1;
      obj.material.color.setHSL(hue, 0.9, 0.5 + audioValue * 0.4);
      obj.material.emissiveIntensity = 0.2 + audioValue * 0.5;
    }

    obj.rotation.y = scaledTime * 0.3;
  });
};
