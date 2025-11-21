import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateMorphing = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001; // smooth animation

  objects.forEach((obj, index) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
    const frequencyValue = frequencyData[dataIndex] / 255;
    const bassLevel = beatInfo?.bandStrengths?.bass || 0;
    const midLevel = beatInfo?.bandStrengths?.mid || 0;
    const trebleLevel = beatInfo?.bandStrengths?.treble || 0;

    const geometry = obj.geometry as THREE.BufferGeometry;

    if (!geometry?.attributes?.position || !obj.userData?.originalVertices) return;

    const positions = geometry.attributes.position.array as Float32Array;
    const originalVertices = obj.userData.originalVertices as Float32Array;
    const len = Math.min(positions.length, originalVertices.length);

    for (let i = 0; i < len; i += 3) {
      const phase = obj.userData.phase ?? 0;

      // Morph X/Y/Z with audio data and phase
      const waveX = Math.sin(scaledTime * obj.userData.morphSpeed * 0.01 + i * 0.1 + phase) * frequencyValue * 0.5;
      const waveY = Math.cos(scaledTime * obj.userData.morphSpeed * 0.008 + i * 0.05 + phase) * bassLevel * 0.3;
      const waveZ = Math.sin(scaledTime * obj.userData.morphSpeed * 0.012 + i * 0.08 + phase) * midLevel * 0.2 + trebleLevel * 0.1;

      positions[i] = originalVertices[i] + waveX;
      positions[i + 1] = originalVertices[i + 1] + waveY;
      positions[i + 2] = originalVertices[i + 2] + waveZ;
    }

    geometry.attributes.position.needsUpdate = true;

    // Beat scaling
    const beatScale = 1 + (beatInfo?.isBeat ? 0.25 : 0);
    obj.scale.setScalar(obj.userData.baseScale * beatScale);

    // Color cycling
    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (scaledTime * 0.05 + index * 0.02) % 1;
      obj.material.color.setHSL(hue, 0.9, 0.6);
    }
  });
};
