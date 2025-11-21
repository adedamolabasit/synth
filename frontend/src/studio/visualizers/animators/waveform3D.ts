import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateWaveform3D = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Line) || obj.userData.type !== "waveform3D") return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;
    const points: number = obj.userData.points;
    const phaseOffsets: number[] = obj.userData.phaseOffsets;

    for (let i = 0; i < points; i++) {
      const i3 = i * 3;
      const dataIndex = Math.floor((i / points) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;

      // Audio-reactive 3D waveform
      const waveHeight = frequencyValue * (params.intensity ?? 2);
      positions[i3 + 1] = Math.sin(time * 3 + i * 0.15 + phaseOffsets[i]) * waveHeight;
      positions[i3 + 2] = Math.cos(time * 2 + i * 0.2 + phaseOffsets[i]) * waveHeight * 0.8;

      // Optional: subtle x displacement for fluidity
      positions[i3] = originalPositions[i3] + Math.sin(time + i * 0.05) * 0.05;
    }

    geometry.attributes.position.needsUpdate = true;

    // Optional: pulse opacity on beat
    if (beatInfo?.isBeat) {
      const material = obj.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + Math.random() * 0.5;
    }
  });
};
