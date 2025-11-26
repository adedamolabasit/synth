import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createQuantumFieldVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const particleCount = Math.min(params.particleCount, 5000);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = Math.cbrt(Math.random()) * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const hue = (i / particleCount + Math.random() * 0.1) % 1;
    const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const quantumField = new THREE.Points(geometry, material);

  quantumField.userData = {
    type: "quantumField",
    particleCount,
    originalPositions: positions.slice(),
    quantumStates: Array.from(
      { length: particleCount },
      () => Math.random() * Math.PI * 2
    ),
    entanglementGroups: Array.from({ length: particleCount }, () =>
      Math.floor(Math.random() * 5)
    ),
    colorPhase: 0,
    isLyrics: false,
  };

  scene.add(quantumField);
  objects.push(quantumField);
  return objects;
};
