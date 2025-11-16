import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCyberGridVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const areaSize = 15;
  const nodeCount = Math.min(params.particleCount, 300);

  // === Floating glowing spheres ===
  const sphereGeometry = new THREE.SphereGeometry(0.12, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00ffff),
    transparent: true,
    opacity: 0.8,
  });

  for (let i = 0; i < nodeCount; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
    sphere.material.color.setHSL(Math.random() * 0.3 + 0.5, 1.0, 0.6);

    // Randomize initial position
    sphere.position.set(
      Math.random() * areaSize - areaSize / 2,
      Math.random() * 3 - 1.5,
      Math.random() * areaSize - areaSize / 2
    );

    // Store motion properties
    sphere.userData = {
      basePosition: sphere.position.clone(),
      floatSpeed: 0.5 + Math.random() * 1.0,
      floatAmplitude: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      colorShift: Math.random() * 0.02,
    };

    scene.add(sphere);
    objects.push(sphere);
  }

  // === Ambient glow field (optional) ===
  const glowGeometry = new THREE.SphereGeometry(areaSize * 0.6, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00ffff),
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
  });
  const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glowSphere);
  objects.push(glowSphere);

  return objects;
};
