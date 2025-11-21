import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateBiomorphic = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  const avgFreq =
    Array.from(frequencyData).reduce((a, b) => a + b, 0) / frequencyData.length;

  objects.forEach((obj) => {
    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || child.userData.depth === undefined)
        return;

      const depth = child.userData.depth;
      const pulsePhase = child.userData.pulsePhase;

      // Map branch depth to audio band
      const bandIndex = Math.floor(
        (depth / 5) * frequencyData.length
      );
      const audioValue = frequencyData[Math.min(bandIndex, frequencyData.length - 1)] / 255;

      // Scale pulsing by audio
      const pulse = 1 + audioValue * 0.6 * (params.intensity ?? 1) + Math.sin(scaledTime * 2 + pulsePhase) * 0.05;
      child.scale.y = pulse;

      // Rotate slightly on beat or audio energy
      child.rotation.x = Math.sin(scaledTime * 1.5 + depth) * 0.1 * audioValue;
      child.rotation.z = Math.cos(scaledTime * 1.2 + depth) * 0.08 * audioValue;

      // Color reacts to audio
      if (child.material instanceof THREE.MeshPhongMaterial) {
        const hue = (0.3 + depth * 0.1 + audioValue * 0.3) % 1;
        const lightness = 0.4 + audioValue * 0.3;
        child.material.color.setHSL(hue, 0.8, lightness);
        child.material.opacity = 0.6 + audioValue * 0.4;
      }
    });
  });

  // Optional: global sway of all branches synced to beat
  if (beatInfo?.isBeat) {
    objects.forEach((obj) => {
      obj.rotation.y += 0.01 + avgFreq * 0.03;
    });
  }
};
