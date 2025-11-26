import * as THREE from "three";

export const animateCosmicWeb = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj) => {
    if (obj.userData.isNode && obj instanceof THREE.Mesh) {
      const nodeIndex = obj.userData.index || 0;
      const dataIndex = Math.floor((nodeIndex / 30) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const scale = 1 + audioValue * 1.2;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 0.5 + audioValue * 0.8;
      }

      obj.position.x += Math.sin(scaledTime + nodeIndex) * 0.01;
      obj.position.y += Math.cos(scaledTime + nodeIndex) * 0.01;
    } else if (obj.userData.isConnection && obj instanceof THREE.Line) {
      const distance = obj.userData.distance || 3;
      const dataIndex = Math.floor(((distance / 3) ** 2) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      if (obj.material instanceof THREE.LineBasicMaterial) {
        obj.material.opacity = 0.2 + audioValue * 0.5;
      }
    }
  });
};
