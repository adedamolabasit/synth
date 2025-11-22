// createParticleWaveVisualizer.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createParticleWaveVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
) => {
  // Dynamically adjust particle count based on base intensity
  const baseCount = params.particleCount || 3000;
  const particleCount = Math.min(baseCount + Math.floor(Math.random() * 2000), 15000);

  const positions = new Float32Array(particleCount * 3);
  const originalPositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const phases = new Float32Array(particleCount);

  let baseHue = Math.random();

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    const x = (Math.random() - 0.5) * 25;
    const y = (Math.random() - 0.5) * 12;
    const z = (Math.random() - 0.5) * 25;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    originalPositions[i3] = x;
    originalPositions[i3 + 1] = y;
    originalPositions[i3 + 2] = z;

    const color = new THREE.Color().setHSL(baseHue, 0.8, 0.5);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: params.objectSize * 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  points.userData = {
    type: "particleWave",
    originalPositions,
    phases,
    baseHue,
    colorShiftSpeed: 0.002 + Math.random() * 0.004,
    flowDirection: 1,
    isLyrics: false,
  };

  scene.add(points);
  return [points];
};
