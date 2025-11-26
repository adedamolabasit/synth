import * as THREE from "three";

export const animateVoronoiCells = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const rotationSpeed = obj.userData.rotationSpeed || 0.01;
      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.x += rotationSpeed;
      obj.rotation.y += rotationSpeed * 0.7;
      
      const scale = 0.8 + audioValue * 0.6;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (index / objects.length + scaledTime * 0.05) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.5 + audioValue * 0.4);
      }
    }
  });
};
