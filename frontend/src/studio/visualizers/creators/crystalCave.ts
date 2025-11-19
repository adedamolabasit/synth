import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCrystalCaveVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const crystals = Math.floor(25 * params.patternDensity);

  for (let i = 0; i < crystals; i++) {
    const height = 0.5 + Math.random() * 2;
    const geometry = new THREE.ConeGeometry(0.2, height, 8);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.5 + Math.random() * 0.2, 0.8, 0.6),
      transparent: true,
      opacity: 0.8,
      flatShading: true,
    });

    const crystal = new THREE.Mesh(geometry, material);
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 4;
    
    crystal.position.set(
      Math.cos(angle) * radius,
      -2 + height / 2,
      Math.sin(angle) * radius
    );
    crystal.rotation.z = (Math.random() - 0.5) * 0.3;
    crystal.userData = { index: i, height };
    scene.add(crystal);
    objects.push(crystal);

    // Add glowing tip
    const tipGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const tipMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00aaff,
      emissiveIntensity: 1,
    });

    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.y = height / 2;
    tip.userData = { isTip: true };
    crystal.add(tip);
    objects.push(tip);
  }

  return objects;
};
