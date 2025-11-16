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
    if (!(obj instanceof THREE.Line) || obj.userData.type !== "waveform3D")
      return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;
    const points = obj.userData.points;

    for (let i = 0; i < points; i++) {
      const i3 = i * 3;
      const dataIndex = Math.floor((i / points) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;

      // Create 3D waveform
      positions[i3 + 1] = Math.sin(time * 2 + i * 0.1) * frequencyValue * 3;
      positions[i3 + 2] = Math.cos(time * 2 + i * 0.1) * frequencyValue * 2;
    }

    geometry.attributes.position.needsUpdate = true;
  });
};