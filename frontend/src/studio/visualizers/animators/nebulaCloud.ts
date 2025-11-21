import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateNebulaCloud = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;

  const bass = (beatInfo?.bandStrengths?.bass ?? 0) * 0.01;
  const mid = (beatInfo?.bandStrengths?.mid ?? 0) * 0.01;
  const treble = (beatInfo?.bandStrengths?.treble ?? 0) * 0.01;

  objects.forEach((obj, index) => {
    if (!(obj instanceof THREE.Points)) return;

    const positions = obj.geometry.attributes.position.array as Float32Array;
    const speeds = obj.geometry.attributes.speed.array as Float32Array;
    const angles = obj.geometry.attributes.angle.array as Float32Array;
    const particleCount = obj.userData.particleCount;
    const cx = obj.userData.centerX;
    const cy = obj.userData.centerY;
    const cz = obj.userData.centerZ;

    // Compute average audio value for material update
    let avgAudio = 0;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const freqIndex = Math.floor((i / particleCount) * frequencyData.length);
      const audioValue = frequencyData[freqIndex] / 255;

      avgAudio += audioValue / particleCount;

      const angle = angles[i] + scaledTime * 0.5 * speeds[i];
      const radius = 0.5 + bass * 2 * audioValue + Math.sin(scaledTime + i) * 0.3;

      positions[i3] = cx + Math.cos(angle) * radius;
      positions[i3 + 1] = cy + Math.sin(scaledTime * 2 + i * 0.1) * 0.5 + mid * audioValue;
      positions[i3 + 2] = cz + Math.sin(angle) * radius;
    }

    obj.geometry.attributes.position.needsUpdate = true;

    // Update material using average audio value
    if (obj.material instanceof THREE.PointsMaterial) {
      obj.material.size = 0.15 + avgAudio * 0.4;
      const hue = (index / objects.length + scaledTime * 0.05 + treble * 0.3) % 1;
      obj.material.color.setHSL(hue, 0.8, 0.5 + bass * 0.4);
      obj.material.opacity = 0.4 + avgAudio * 0.5;
    }

    obj.rotation.x += 0.001;
    obj.rotation.y += 0.0015;
  });
};
