import * as THREE from "three";

export const animateFireRings = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
): void => {
  
  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh && !obj.userData.isFlame) {
      const index = obj.userData.index || 0;
      const dataIndex = Math.floor((index / 8) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.z += 0.01 * (index + 1);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 0.6 + audioValue * 0.6;
      }
    } else if (obj.userData.isFlame && obj instanceof THREE.Mesh && obj.parent) {
      const ringIndex = obj.userData.ringIndex || 0;
      const dataIndex = Math.floor((ringIndex / 8) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.scale.y = 1 + audioValue * 1.5;
      obj.position.y = audioValue * 0.3;

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 0.8 + audioValue * 0.5;
        obj.material.opacity = 0.5 + audioValue * 0.4;
      }
    }
  });
};
