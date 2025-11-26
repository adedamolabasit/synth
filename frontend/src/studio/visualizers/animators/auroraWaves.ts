import * as THREE from "three";

export const animateAuroraWaves = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Line)) return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const pointsPerRibbon = obj.userData.pointsPerRibbon;
    const speed = obj.userData.speed;
    const offset = obj.userData.offset;
    const ribbonIndex = obj.userData.ribbonIndex;

    for (let i = 0; i < pointsPerRibbon; i++) {
      const i3 = i * 3;
      const t = i / pointsPerRibbon;

      const dataIndex = Math.floor(
        (i / pointsPerRibbon) * frequencyData.length
      );
      const audioValue = frequencyData[dataIndex] / 255;

      positions[i3 + 0] =
        Math.sin(scaledTime * speed + i * 0.1 + offset) *
        5 *
        (0.3 + audioValue);
      positions[i3 + 1] = t * 5 + audioValue * 2;
      positions[i3 + 2] =
        Math.cos(scaledTime * speed + i * 0.1 + offset) *
        5 *
        (0.3 + audioValue);

      const hue =
        (ribbonIndex / objects.length +
          t +
          scaledTime * 0.05 +
          audioValue * 0.1) %
        1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5 + audioValue * 0.3);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });
};
