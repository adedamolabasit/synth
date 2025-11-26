import * as THREE from "three";

export const animateWarpTunnel = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      const ringIndex = obj.userData.index || 0;
      const dataIndex = Math.floor((ringIndex / 30) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.position.z += 0.05 * (1 + audioValue);

      if (obj.position.z > 15) {
        obj.position.z = -15;
      }

      obj.rotation.z += 0.01 * (ringIndex / 30 + 1);

      const scale = 1 + audioValue * 0.5;
      obj.scale.set(scale, scale, 1);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (0.6 + (ringIndex / 30) * 0.4 + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.opacity = 0.5 + audioValue * 0.4;
      }
    }
  });
};
