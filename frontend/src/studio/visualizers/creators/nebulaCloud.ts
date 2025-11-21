import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createNebulaCloudVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const clouds = Math.floor(6 * params.complexity);

  for (let i = 0; i < clouds; i++) {
    const particleCount = Math.floor(100 * params.patternDensity);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);

    const centerX = (Math.random() - 0.5) * 5;
    const centerY = (Math.random() - 0.5) * 5;
    const centerZ = (Math.random() - 0.5) * 5;

    for (let j = 0; j < particleCount; j++) {
      const j3 = j * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.5;

      positions[j3] = centerX + Math.cos(angle) * radius;
      positions[j3 + 1] = centerY + (Math.random() - 0.5) * 2;
      positions[j3 + 2] = centerZ + Math.sin(angle) * radius;

      speeds[j] = 0.5 + Math.random();
      angles[j] = angle;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute("angle", new THREE.BufferAttribute(angles, 1));

    const material = new THREE.PointsMaterial({
      size: 0.15 + params.intensity * 0.1,
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const cloud = new THREE.Points(geometry, material);
    cloud.userData = { particleCount, centerX, centerY, centerZ };
    scene.add(cloud);
    objects.push(cloud);
  }

  return objects;
};
