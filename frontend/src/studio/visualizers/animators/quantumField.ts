// animations/quantumField.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateQuantumField = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[0] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;

  // Quantum camera movement
  if (camera) {
    camera.position.x = Math.sin(time * 0.2) * 12;
    camera.position.y = Math.cos(time * 0.15) * 8;
    camera.position.z = 15 + Math.sin(time * 0.1) * 3;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Points) || obj.userData.type !== "quantumField") return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute("position");
    const colorAttr = geometry.getAttribute("color");
    const sizeAttr = geometry.getAttribute("size");

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;
    const quantumStates = obj.userData.quantumStates as number[];
    const entanglementGroups = obj.userData.entanglementGroups as number[];

    const intensity = params.intensity * 0.03;
    const quantumSpeed = params.speed * 0.0005;

    for (let i = 0; i < obj.userData.particleCount; i++) {
      const i3 = i * 3;
      const freqIndex = Math.floor((i / obj.userData.particleCount) * frequencyData.length);
      const energy = frequencyData[freqIndex] / 255;
      
      // Quantum wave function
      const waveFunction = Math.sin(time * 2 + quantumStates[i]) * energy * intensity;
      const probabilityDensity = Math.sin(time * 3 + quantumStates[i] * 2) * 0.5 + 0.5;

      // Position based on quantum probability
      positions[i3] = originalPositions[i3] + Math.sin(time + quantumStates[i]) * waveFunction;
      positions[i3 + 1] = originalPositions[i3 + 1] + Math.cos(time * 1.3 + quantumStates[i]) * waveFunction;
      positions[i3 + 2] = originalPositions[i3 + 2] + Math.sin(time * 0.7 + quantumStates[i]) * waveFunction;

      // Entanglement effects
      const group = entanglementGroups[i];
      const groupPhase = Math.sin(time + group) * 0.5;
      positions[i3] += groupPhase * bass;
      positions[i3 + 1] += groupPhase * mid;
      positions[i3 + 2] += groupPhase * treble;

      // Quantum color superposition
      const hue = ((i / obj.userData.particleCount) + time * 0.1 + energy * 0.2) % 1;
      const saturation = 0.7 + energy * 0.3;
      const lightness = 0.5 + probabilityDensity * 0.3;
      
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Particle size based on energy
      sizes[i] = (0.1 + energy * 0.2) * (1 + bass * 0.5);
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    // Quantum field rotation
    obj.rotation.x += quantumSpeed * mid;
    obj.rotation.y += quantumSpeed * bass;
    obj.rotation.z += quantumSpeed * treble;

    // Beat-induced quantum collapse
    if (beatInfo?.isBeat) {
      for (let i = 0; i < obj.userData.particleCount; i += 10) {
        const i3 = i * 3;
        // Quantum jump
        positions[i3] += (Math.random() - 0.5) * bass * 2;
        positions[i3 + 1] += (Math.random() - 0.5) * mid * 2;
        positions[i3 + 2] += (Math.random() - 0.5) * treble * 2;
      }
      posAttr.needsUpdate = true;
    }
  });
};