import * as THREE from "three";

export const animatePlasmaField = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Points) {
      const positions = obj.geometry.attributes.position.array as Float32Array;
      const colors = obj.geometry.attributes.color.array as Float32Array;
      const particleCount = obj.userData.particleCount;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const dataIndex = Math.floor(
          (i / particleCount) * frequencyData.length
        );
        const audioValue = frequencyData[dataIndex] / 255;

        positions[i3] += Math.sin(scaledTime + i * 0.1) * 0.02 * audioValue;
        positions[i3 + 1] += Math.cos(scaledTime + i * 0.1) * 0.02 * audioValue;
        positions[i3 + 2] +=
          Math.sin(scaledTime * 0.5 + i * 0.05) * 0.02 * audioValue;

        const hue = (i / particleCount + scaledTime * 0.1) % 1;
        const color = new THREE.Color().setHSL(hue, 1, 0.5 + audioValue * 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }

      obj.geometry.attributes.position.needsUpdate = true;
      obj.geometry.attributes.color.needsUpdate = true;
      obj.rotation.y += 0.001;
    }
  });
};
