import * as THREE from "three";

export const animateHexagonalGrid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.scale.y = 1 + audioValue * 3;
      obj.position.y = audioValue * 2;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (index / objects.length + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.5 + audioValue * 0.3);
      }

      obj.rotation.y = scaledTime * 0.5;
    }
  });
};
