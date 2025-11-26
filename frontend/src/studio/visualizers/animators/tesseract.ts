import * as THREE from "three";

export const animateTesseract = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;
  const avgAudio = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh && obj.userData.isVertex) {
      const scale = 1 + avgAudio * 0.5;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 0.5 + avgAudio * 0.8;
      }
    }

    obj.rotation.x = scaledTime * 0.3;
    obj.rotation.y = scaledTime * 0.5;
    obj.rotation.z = scaledTime * 0.2;
  });
};
