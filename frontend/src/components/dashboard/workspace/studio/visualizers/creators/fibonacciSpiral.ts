import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createFibonacciSpiralVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const points = Math.floor(500 * params.patternDensity);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < points; i++) {
    const theta = i * goldenAngle;
    const r = Math.sqrt(i) * 0.2;
    const y = (i / points) * 6 - 3;

    const geometry = new THREE.SphereGeometry(0.08, 12, 12);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((i / points), 1, 0.5),
      transparent: true,
      opacity: 0.8,
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(
      Math.cos(theta) * r,
      y,
      Math.sin(theta) * r
    );
    sphere.userData = { index: i, theta, r };
    scene.add(sphere);
    objects.push(sphere);
  }

  return objects;
};
