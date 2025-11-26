import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCrystalResonance = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[8] / 255;
  const mid = frequencyData[72] / 255;
  const treble = frequencyData[136] / 255;

  if (camera) {
    camera.position.x = Math.sin(time * 0.06) * 18;
    camera.position.y = Math.sin(time * 0.04) * 6;
    camera.position.z = Math.cos(time * 0.06) * 18;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "crystalResonance") return;

    const resonanceCrystals = obj.userData.resonanceCrystals as THREE.Mesh[];
    const harmonicFields = obj.userData.harmonicFields as THREE.Points[];
    const resonanceFrequencies = obj.userData.resonanceFrequencies as number[];
    const phaseOffsets = obj.userData.phaseOffsets as number[];
    const energyLevels = obj.userData.energyLevels as number[];

    const harmonicSpeed = params.speed * 0.001;

    resonanceCrystals.forEach((crystal, index) => {
      const frequency = resonanceFrequencies[index];
      const phase = phaseOffsets[index];
      let energy = energyLevels[index];
      const freqIndex = Math.floor(
        (index / resonanceCrystals.length) * frequencyData.length
      );
      const signal = frequencyData[freqIndex] / 255;

      const resonance = Math.sin(time * frequency + phase) * signal;
      crystal.scale.setScalar(1 + resonance * 0.3 + bass * 0.2);

      energy = (energy + signal * 0.1) % 1;
      energyLevels[index] = energy;

      crystal.rotation.y += harmonicSpeed * (1 + mid);
      crystal.rotation.x += Math.sin(time * 0.5 + index) * 0.01;

      const material = crystal.material as THREE.MeshPhysicalMaterial;
      const hue = (index * 0.08 + energy * 0.2 + time * 0.005) % 1;
      material.color.setHSL(hue, 0.8, 0.4 + signal * 0.3);
      material.transmission = 0.3 + signal * 0.3;
      material.roughness = Math.max(0.05, 0.2 - signal * 0.15);

      crystal.position.y += Math.sin(time * 1.2 + index) * 0.02 * treble;
    });

    harmonicFields.forEach((field, index) => {
      const geometry = field.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");
      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const phase = phaseOffsets[index];

      const crystal = resonanceCrystals[index];
      const crystalPos = crystal.position;

      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;

        const orbitSpeed = 1 + Math.sin(time + particleIndex) * 0.5;
        const angle = time * orbitSpeed + particleIndex * 0.1 + phase;

        positions[i] = Math.cos(angle) * (2 + Math.sin(time * 2) * 1);
        positions[i + 1] =
          Math.sin(angle * 1.3) * (2 + Math.cos(time * 1.7) * 1);
        positions[i + 2] = Math.sin(angle) * (2 + Math.cos(time * 1.5) * 1);

        const colorPhase =
          (particleIndex / (positions.length / 3) + time * 0.1) % 1;
        const hue = (index * 0.08 + colorPhase * 0.3) % 1;
        const saturation = 0.8 + mid * 0.2;
        const brightness = 0.5 + Math.sin(time * 2 + particleIndex) * 0.2;

        const color = new THREE.Color().setHSL(hue, saturation, brightness);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      field.position.copy(crystalPos);

      const fieldMaterial = field.material as THREE.PointsMaterial;
      fieldMaterial.size = 0.1 + bass * 0.08;
      fieldMaterial.opacity = 0.4 + treble * 0.3;
    });

    obj.rotation.y += harmonicSpeed * bass;
    obj.rotation.x += harmonicSpeed * mid * 0.4;

    if (beatInfo?.isBeat) {
      resonanceCrystals.forEach((crystal, index) => {
        const material = crystal.material as THREE.MeshPhysicalMaterial;
        material.emissive = new THREE.Color().setHSL(index * 0.08, 0.8, 0.3);
        crystal.scale.setScalar(1.8);

        setTimeout(() => {
          material.emissive = new THREE.Color(0, 0, 0);
          crystal.scale.setScalar(1);
        }, index * 30 + 100);
      });

      harmonicFields.forEach((field) => {
        const material = field.material as THREE.PointsMaterial;
        material.size = 0.25;
        material.opacity = 0.8;
        setTimeout(() => {
          material.size = 0.15;
          material.opacity = 0.6;
        }, 200);
      });
    }
  });
};
