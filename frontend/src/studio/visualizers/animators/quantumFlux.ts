import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateQuantumFlux = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[10] / 255;
  const mid = frequencyData[75] / 255;

  if (camera) {
    camera.position.x = Math.sin(time * 0.07) * 20;
    camera.position.y = Math.sin(time * 0.05) * 10;
    camera.position.z = Math.cos(time * 0.07) * 20;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "quantumFlux") return;

    const fluxTubes = obj.userData.fluxTubes as THREE.Mesh[];
    const probabilityWaves = obj.userData.probabilityWaves as THREE.Points[];
    const tubeOscillations = obj.userData.tubeOscillations as number[];
    const wavePhases = obj.userData.wavePhases as number[];
    const quantumStates = obj.userData.quantumStates as number[];

    const fluxSpeed = params.speed * 0.001;

    fluxTubes.forEach((tube, index) => {
      const oscillation = tubeOscillations[index];
      let quantumState = quantumStates[index];
      const freqIndex = Math.floor(
        (index / fluxTubes.length) * frequencyData.length
      );
      const energy = frequencyData[freqIndex] / 255;

      const wave = Math.sin(time * 1.5 + oscillation) * 0.5;
      tube.scale.y = 1 + wave * 0.5 + energy * 0.3;

      tube.rotation.x += fluxSpeed * (1 + bass);
      tube.rotation.y += fluxSpeed * (1 + mid) * 0.7;
      tube.rotation.z += Math.sin(time + index) * 0.01;

      quantumState = (quantumState + fluxSpeed * energy) % 1;
      quantumStates[index] = quantumState;

      const material = tube.material as THREE.MeshBasicMaterial;
      const hue = (0.7 + quantumState * 0.3 + time * 0.01) % 1;
      material.color.setHSL(hue, 0.9, 0.4 + energy * 0.3);
      material.opacity = 0.4 + energy * 0.4;

      tube.position.y += Math.sin(time * 2 + index) * 0.02 * bass;
    });

    probabilityWaves.forEach((wave, index) => {
      const geometry = wave.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");
      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const phase = wavePhases[index];

      const tube = fluxTubes[index];
      const tubePos = tube.position;

      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        const angle = (particleIndex / (positions.length / 3)) * Math.PI * 2;

        const orbitRadius =
          2 + Math.sin(time * 2 + phase + particleIndex * 0.1) * 1;
        positions[i] = Math.cos(angle + time) * orbitRadius;
        positions[i + 2] = Math.sin(angle + time) * orbitRadius;

        positions[i + 1] = Math.sin(time * 3 + particleIndex) * 4;

        const probability = Math.sin(time + particleIndex * 0.1) * 0.5 + 0.5;
        const hue = (0.7 + probability * 0.2 + time * 0.005) % 1;
        const color = new THREE.Color().setHSL(
          hue,
          0.8,
          0.5 + probability * 0.3
        );
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      wave.position.copy(tubePos);

      const waveMaterial = wave.material as THREE.PointsMaterial;
      waveMaterial.size = 0.15 + bass * 0.1;
      waveMaterial.opacity = 0.5 + mid * 0.3;
    });

    obj.rotation.y += fluxSpeed * bass;
    obj.rotation.x += fluxSpeed * mid * 0.3;

    if (beatInfo?.isBeat) {
      fluxTubes.forEach((tube, index) => {
        quantumStates[index] = Math.random();

        const material = tube.material as THREE.MeshBasicMaterial;
        material.opacity = 1;
        tube.scale.setScalar(1.5);

        setTimeout(() => {
          material.opacity = 0.6;
          tube.scale.setScalar(1);
        }, 100);
      });

      probabilityWaves.forEach((wave) => {
        const material = wave.material as THREE.PointsMaterial;
        material.size = 0.3;
        material.opacity = 0.9;
        setTimeout(() => {
          material.size = 0.2;
          material.opacity = 0.7;
        }, 150);
      });
    }
  });
};
