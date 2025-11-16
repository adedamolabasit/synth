import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createParticleWaveVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const particleCount = Math.min(params.particleCount, 5000);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;

    const hue = Math.random();
    const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
  });

  const particles = new THREE.Points(geometry, material);
  particles.userData = {
    type: "particleWave",
    originalPositions: positions.slice(),
  };
  scene.add(particles);
  objects.push(particles);

  return objects;
};