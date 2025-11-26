import * as THREE from "three";

export const animateCelestialOrbit = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;
  const avgAudio =
    frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.userData.isStar) {
        const scale = 1 + avgAudio * 0.3;
        obj.scale.set(scale, scale, scale);

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.emissiveIntensity = 1.8 + avgAudio * 0.5;
        }

        obj.rotation.y += 0.01;
      } else if (!obj.userData.isOrbit) {
        const orbitRadius = obj.userData.orbitRadius || 2;
        const orbitSpeed = obj.userData.orbitSpeed || 0.5;
        const planetSize = obj.userData.planetSize || 0.2;
        const index = obj.userData.index || 0;
        const dataIndex = Math.floor((index / 8) * frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;

        obj.userData.angle += orbitSpeed * 0.01 * (1 + audioValue * 0.5);
        const angle = obj.userData.angle;

        obj.position.set(
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius
        );

        const scale = planetSize * (1 + audioValue * 0.5);
        obj.scale.set(scale, scale, scale);

        obj.rotation.y += 0.02;

        if (obj.material instanceof THREE.MeshPhongMaterial) {
          const hue = (index / 8 + scaledTime * 0.05) % 1;
          obj.material.color.setHSL(hue, 0.8, 0.5 + audioValue * 0.3);
        }
      }
    }
  });
};
