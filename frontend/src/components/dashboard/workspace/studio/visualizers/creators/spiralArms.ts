import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSpiralArmsVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const arms = Math.floor(4 * params.complexity);
  const pointsPerArm = Math.floor(50 * params.patternDensity);

  for (let arm = 0; arm < arms; arm++) {
    const armAngleOffset = (arm / arms) * Math.PI * 2;

    for (let i = 0; i < pointsPerArm; i++) {
      const t = i / pointsPerArm;
      const angle = t * Math.PI * 4 + armAngleOffset;
      const radius = t * 5;

      const geometry = new THREE.SphereGeometry(0.1, 12, 12);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((arm / arms), 1, 0.5),
        transparent: true,
        opacity: 0.8,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      sphere.userData = { arm, index: i, t };
      scene.add(sphere);
      objects.push(sphere);
    }
  }

  return objects;
};
