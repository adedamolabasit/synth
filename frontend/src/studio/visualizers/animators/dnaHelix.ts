import * as THREE from "three";
import { BeatInfo } from "../../types/visualizer";

export const animateDNAHelix = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const index = obj.userData.index || 0;
    const t = obj.userData.t || 0;
    const baseY = obj.userData.baseY || 0;
    const dataIndex = Math.floor(
      (index / objects.length) * frequencyData.length
    );
    const audioValue = frequencyData[dataIndex] / 255;

    obj.position.y =
      baseY + Math.sin(t * 3 + scaledTime * 4) * 0.5 + audioValue * 1.5;

    const radiusOffset = 0.2 + audioValue * 0.6;
    const radius = 1.8 + radiusOffset;
    const angle = obj.userData.strand === 1 ? t : t + Math.PI;
    obj.position.x = Math.cos(angle + scaledTime * 0.5) * radius;
    obj.position.z = Math.sin(angle + scaledTime * 0.5) * radius;

    const scale =
      0.8 + audioValue * 0.7 + Math.sin(scaledTime * 3 + index) * 0.1;
    obj.scale.setScalar(scale);

    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const baseHue = obj.userData.strand === 1 ? 0.4 : 0.9;
      obj.material.color.setHSL(
        (baseHue + audioValue * 0.15 + scaledTime * 0.1) % 1,
        0.8,
        0.5 + audioValue * 0.2
      );
      obj.material.emissive.setHSL(baseHue, 0.8, audioValue * 0.5);
    }
  });

  if (beatInfo?.isBeat) {
    objects.forEach((obj) => obj.scale.multiplyScalar(1.1));
  }
};
