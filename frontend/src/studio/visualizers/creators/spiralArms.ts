import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSpiralArmsVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const arms = Math.floor(4 * params.complexity);
  const pointsPerArm = Math.floor(100 * params.patternDensity);

  for (let arm = 0; arm < arms; arm++) {
    const armAngleOffset = (arm / arms) * Math.PI * 2;

    for (let i = 0; i < pointsPerArm; i++) {
      const t = i / pointsPerArm;
      const angle = t * Math.PI * 6 + armAngleOffset;
      const radius = 1 + t * 5;

      const geometry = new THREE.SphereGeometry(0.08 + Math.random() * 0.05, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((arm / arms), 0.9, 0.5),
        transparent: true,
        opacity: 0.8,
        emissive: 0x111111,
        shininess: 50,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1,
        Math.sin(angle) * radius
      );
      sphere.userData = { arm, index: i, t, baseRadius: radius, baseY: sphere.position.y };
      scene.add(sphere);
      objects.push(sphere);
    }
  }

  return objects;
};
