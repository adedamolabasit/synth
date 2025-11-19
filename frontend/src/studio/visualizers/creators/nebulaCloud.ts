import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createNebulaCloudVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const clouds = Math.floor(8 * params.complexity);

  for (let i = 0; i < clouds; i++) {
    const particleCount = Math.floor(50 * params.patternDensity);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    const centerX = (Math.random() - 0.5) * 5;
    const centerY = (Math.random() - 0.5) * 5;
    const centerZ = (Math.random() - 0.5) * 5;

    for (let j = 0; j < particleCount; j++) {
      const j3 = j * 3;
      positions[j3] = centerX + (Math.random() - 0.5) * 2;
      positions[j3 + 1] = centerY + (Math.random() - 0.5) * 2;
      positions[j3 + 2] = centerZ + (Math.random() - 0.5) * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const cloud = new THREE.Points(geometry, material);
    cloud.userData = { cloudIndex: i, particleCount };
    scene.add(cloud);
    objects.push(cloud);
  }

  return objects;
};
