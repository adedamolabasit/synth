import * as THREE from "three";

export const animateCrystalCave = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
): void => {
  
  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh && !obj.userData.isTip) {
      const crystalIndex = obj.userData.index || 0;
      const dataIndex = Math.floor((crystalIndex / 25) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.scale.y = 1 + audioValue * 0.5;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (0.5 + audioValue * 0.2) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.6 + audioValue * 0.2);
      }

      obj.rotation.y += 0.005;
    } else if (obj.userData.isTip && obj instanceof THREE.Mesh && obj.parent instanceof THREE.Mesh) {
      const parentIndex = obj.parent.userData.index || 0;
      const dataIndex = Math.floor((parentIndex / 25) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 0.8 + audioValue * 0.7;
      }
    }
  });
};
