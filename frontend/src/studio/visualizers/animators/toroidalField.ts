import * as THREE from "three";

export const animateToroidalField = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh && !obj.userData.isParticles) {
      const index = obj.userData.index || 0;
      const dataIndex = Math.floor((index / 3) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      obj.rotation.y += 0.005 * (index + 1);
      obj.rotation.z += 0.003 * (index + 1);

      const scale = 1 + audioValue * 0.3;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.opacity = 0.6 + audioValue * 0.3;
      }
    } else if (obj instanceof THREE.Points && obj.userData.isParticles) {
      const positions = obj.geometry.attributes.position.array as Float32Array;
      const particleCount = obj.userData.particleCount;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = (i / particleCount) * Math.PI * 2 + scaledTime * 2;
        const radius = 2 - obj.userData.torusIndex * 0.5;
        
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = Math.sin(angle) * radius;
      }

      obj.geometry.attributes.position.needsUpdate = true;
    }
  });
};
