import * as THREE from "three";

export const animateFibonacciSpiral = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      const objIndex = obj.userData.index || 0;
      const dataIndex = Math.floor((objIndex / 500) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const scale = 0.8 + audioValue * 0.7;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (objIndex / 500 + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
      }

      const theta = obj.userData.theta + scaledTime * 0.5;
      const r = obj.userData.r;
      obj.position.x = Math.cos(theta) * r;
      obj.position.z = Math.sin(theta) * r;
    }
  });
};
