import * as THREE from "three";

export const animateMobiusStrip = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Line) {
      const stripIndex = obj.userData.stripIndex || 0;
      obj.rotation.z += 0.005 * (stripIndex + 1);

      const dataIndex = Math.floor((stripIndex / 3) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      if (obj.material instanceof THREE.LineBasicMaterial) {
        const hue = (stripIndex / 3 + scaledTime * 0.05) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
      }
    } else if (obj.userData.isParticle && obj instanceof THREE.Mesh) {
      const index = obj.userData.index || 0;
      const dataIndex = Math.floor((index / 30) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const scale = 1 + audioValue * 0.8;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.opacity = 0.7 + audioValue * 0.3;
      }
    }
  });
};
