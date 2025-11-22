import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSpectrum = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams
) => {
  if (!objects || objects.length === 0) return;

  const group = objects.find(o => o.userData?.isGroup) as THREE.Group | undefined;
  if (!group) return;

  const { ribbons, particles, core, backgroundSphere } = group.userData;
  const now = time;

  // --- Animate ribbons ---
  ribbons.forEach((ribbon: THREE.Line) => {
    const freqIndex = ribbon.userData.index % frequencyData.length;
    const freq = frequencyData[freqIndex] / 255;

    const scale = 1 + freq * 3;
    const geometry = ribbon.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const angle = (i / 3 / 32) * Math.PI * 2 + now * ribbon.userData.speed;
      positions[i] = Math.cos(angle) * (ribbon.userData.baseRadius * scale);
      positions[i + 2] = Math.sin(angle) * (ribbon.userData.baseRadius * scale);
      positions[i + 1] = Math.sin(angle * 2 + now) * 0.5;
    }
    geometry.attributes.position.needsUpdate = true;

    (ribbon.material as THREE.LineBasicMaterial).color.setHSL(
      (now * 0.05 + ribbon.userData.index / ribbons.length) % 1,
      0.8,
      0.5 + freq * 0.3
    );
  });

  // --- Animate particles ---
  const pos = particles.geometry.attributes.position.array as Float32Array;
  const vel = particles.geometry.attributes.velocity.array as Float32Array;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] += vel[i];
    pos[i + 1] += vel[i + 1];
    pos[i + 2] += vel[i + 2];

    if (pos[i + 1] > 8) pos[i + 1] = 0;
  }
  particles.geometry.attributes.position.needsUpdate = true;

  // --- Animate core ---
  if (core) {
    const avgFreq = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
    const scale = 1 + avgFreq * 2;
    core.scale.setScalar(scale);
    core.material.opacity = 0.25 + avgFreq * 0.5;
  }

  // --- Animate dynamic background ---
  if (backgroundSphere) {
    const avgFreq = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
    (backgroundSphere.material as THREE.MeshBasicMaterial).color.setHSL(
      (now * 0.02 + avgFreq * 0.3) % 1,
      0.5,
      0.05 + avgFreq * 0.2
    );
  }

  // --- Rotate group slowly ---
  group.rotation.y += (params.rotationSpeed ?? 0.0015);
};
