import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSupernovaVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  
  // Central core
  const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const coreMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xffaa00,
    emissiveIntensity: 2,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.userData = { isCore: true };
  scene.add(core);
  objects.push(core);

  // Explosion particles
  const particleCount = Math.floor(200 * params.patternDensity);
  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.1 - i / particleCount * 0.1, 1, 0.6),
      transparent: true,
      opacity: 0.8,
      emissive: new THREE.Color().setHSL(0.1 - i / particleCount * 0.1, 1, 0.4),
    });

    const particle = new THREE.Mesh(geometry, material);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    particle.userData = {
      direction: new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ),
      speed: 0.5 + Math.random() * 1.5,
      index: i,
    };

    scene.add(particle);
    objects.push(particle);
  }

  return objects;
};
