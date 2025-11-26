import * as THREE from "three";

export const animateGeometric = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const { index, baseAngle, radius, speed, yOffset } = obj.userData;

    const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
    const audioValue = frequencyData[dataIndex] / 255;

    const angle = baseAngle + scaledTime * speed;
    obj.position.x = Math.cos(angle) * radius;
    obj.position.z = Math.sin(angle) * radius;
    obj.position.y = Math.sin(scaledTime * speed * 2 + yOffset) * 1.5 * audioValue;

    const scale = 0.5 + audioValue * 1.5;
    obj.scale.set(scale, scale, scale);

    obj.rotation.x = scaledTime * speed + audioValue * 2;
    obj.rotation.y = scaledTime * speed * 0.5 + audioValue * 1.5;

    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (scaledTime * 0.1 + index / objects.length) % 1;
      obj.material.color.setHSL(hue, 0.9, 0.5 + audioValue * 0.2);
      obj.material.emissive.setHSL(hue, 0.9, audioValue * 0.5);
      obj.material.opacity = 0.7 + audioValue * 0.3;
    }
  });
};
