import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createQuantumFieldVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const particleCount = Math.floor(500 * params.patternDensity);

  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
      transparent: true,
      opacity: 0.7,
      emissive: new THREE.Color().setHSL(Math.random(), 1, 0.3),
    });

    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );

    particle.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      phase: Math.random() * Math.PI * 2,
    };

    scene.add(particle);
    objects.push(particle);
  }

  return objects;
};
