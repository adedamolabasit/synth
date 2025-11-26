import * as THREE from "three";
import { BeatInfo } from "../../types/visualizer";

export const animateMandala = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  const bass = (beatInfo?.bandStrengths?.bass ?? 0) * 0.01;
  const mid = (beatInfo?.bandStrengths?.mid ?? 0) * 0.01;
  const treble = (beatInfo?.bandStrengths?.treble ?? 0) * 0.01;

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Points)) return;

    const positions = obj.geometry.attributes.position.array as Float32Array;
    const colors = obj.geometry.attributes.color.array as Float32Array;
    const radiusArray = obj.geometry.attributes.radius.array as Float32Array;
    const angleArray = obj.geometry.attributes.angle.array as Float32Array;
    const heightArray = obj.geometry.attributes.height.array as Float32Array;
    const particleCount = obj.userData.particleCount;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const freq =
        frequencyData[Math.floor((i / particleCount) * frequencyData.length)] /
        255;

      const angle = angleArray[i] + scaledTime * (0.5 + mid * 2);
      const radius = radiusArray[i] * (1 + bass * freq * 0.8);
      const height =
        heightArray[i] + Math.sin(scaledTime * 2 + i) * 0.2 * treble;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      const hue = (i / particleCount + treble * 0.5 + scaledTime * 0.2) % 1;
      const color = new THREE.Color().setHSL(hue, 0.9, 0.5 + freq * 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    obj.geometry.attributes.position.needsUpdate = true;
    obj.geometry.attributes.color.needsUpdate = true;

    obj.rotation.y += 0.001 + mid * 0.01;
    obj.rotation.x += 0.0005 + treble * 0.005;
  });
};
