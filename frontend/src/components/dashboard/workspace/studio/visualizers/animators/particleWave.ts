import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateParticleWave = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Points) || obj.userData.type !== "particleWave")
      return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      const dataIndex = Math.floor(
        (i / (positions.length / 3)) * frequencyData.length
      );
      const frequencyValue = frequencyData[dataIndex] / 255;

      // Wave motion based on audio
      const wave =
        Math.sin(time * 2 + originalPositions[i3] * 0.5) * frequencyValue * 2;
      positions[i3 + 1] = originalPositions[i3 + 1] + wave;

      // Color animation
      if (geometry.attributes.color) {
        const colors = geometry.attributes.color.array as Float32Array;
        const hue = (time * 0.1 + i * 0.001) % 1;
        const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    if (geometry.attributes.color) {
      geometry.attributes.color.needsUpdate = true;
    }
  });
};