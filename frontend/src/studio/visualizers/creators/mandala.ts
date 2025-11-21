import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createMandalaVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const particleCount = Math.floor(3000 * params.patternDensity);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const radiusArray = new Float32Array(particleCount);
  const angleArray = new Float32Array(particleCount);
  const heightArray = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1 + Math.random() * 4;
    const height = (Math.random() - 0.5) * 5;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    const color = new THREE.Color().setHSL(Math.random(), 0.9, 0.5);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    radiusArray[i] = radius;
    angleArray[i] = angle;
    heightArray[i] = height;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("radius", new THREE.BufferAttribute(radiusArray, 1));
  geometry.setAttribute("angle", new THREE.BufferAttribute(angleArray, 1));
  geometry.setAttribute("height", new THREE.BufferAttribute(heightArray, 1));

  const material = new THREE.PointsMaterial({
    size: 0.05 + params.intensity * 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.userData = { particleCount };
  scene.add(points);
  objects.push(points);

  return objects;
};
