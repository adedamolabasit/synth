import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCubeGrid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[2] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;

  if (camera) {
    const angle = time * 0.1;
    const radius = 12 + bass * 2;
    camera.position.x = Math.sin(angle) * radius;
    camera.position.y = 8 + mid * 4;
    camera.position.z = Math.cos(angle) * radius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Group) || obj.userData.type !== "cubeGrid")
      return;

    const cubes = obj.userData.cubes as THREE.Mesh[];
    const gridSize = obj.userData.gridSize;
    const baseHue = obj.userData.baseHue;
    const intensity = params.intensity ?? 2;

    if (beatInfo?.isBeat) {
      obj.userData.beatPulse = 1;
    } else {
      obj.userData.beatPulse *= 0.9;
    }

    cubes.forEach((cube) => {
      const { gridX, gridZ, phaseOffset, baseY, originalHeight } = cube.userData;

      const freqIndex = Math.floor(
        ((gridX + gridZ * gridSize) / (gridSize * gridSize)) *
          (frequencyData.length * 0.5)
      );
      const freqValue = frequencyData[freqIndex] / 255;

      const waveHeight =
        Math.sin(time * 2 + gridX * 0.5 + phaseOffset) *
        Math.cos(time * 1.5 + gridZ * 0.5 + phaseOffset);

      // Calculate height multiplier (how tall the cube should be)
      const heightMultiplier = freqValue * intensity * 3 + waveHeight * 0.5 + 0.5;
      
      // Apply vertical scaling
      cube.scale.y = Math.max(0.1, heightMultiplier);
      
      // Position the cube so it sits on the "ground" and grows upward
      cube.position.y = baseY * heightMultiplier;

      const beatScale = 1 + obj.userData.beatPulse * 0.3;
      cube.scale.x = beatScale;
      cube.scale.z = beatScale;

      const material = cube.material as THREE.MeshStandardMaterial;
      const hueShift = (baseHue + time * 0.02 + freqValue * 0.2) % 1;
      const saturation = 0.7 + treble * 0.3;
      const lightness = 0.3 + bass * 0.4;
      material.color.setHSL(hueShift, saturation, lightness);
      material.emissive.setHSL(hueShift, 0.5, freqValue * 0.2);
    });

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.002;
  });
};