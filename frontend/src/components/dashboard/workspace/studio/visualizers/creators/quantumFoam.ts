import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createQuantumFoamVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const bubbles = Math.floor(100 * params.patternDensity);

  for (let i = 0; i < bubbles; i++) {
    const size = 0.05 + Math.random() * 0.15;
    const geometry = new THREE.SphereGeometry(size, 12, 12);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      transparent: true,
      opacity: 0.4,
      emissive: new THREE.Color().setHSL(Math.random(), 0.8, 0.3),
    });

    const bubble = new THREE.Mesh(geometry, material);
    bubble.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    );

    bubble.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03
      ),
      lifetime: Math.random() * 200,
      age: 0,
      size,
    };

    scene.add(bubble);
    objects.push(bubble);
  }

  return objects;
};
