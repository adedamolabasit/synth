import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCyberGridVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const areaSize = 15;
  const nodeCount = Math.min(params.particleCount, 300);

  const sphereGeometry = new THREE.SphereGeometry(0.12, 16, 16);

  for (let i = 0; i < nodeCount; i++) {
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 1.0, 0.6),
      transparent: true,
      opacity: 0.8,
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.position.set(
      Math.random() * areaSize - areaSize / 2,
      Math.random() * 3 - 1.5,
      Math.random() * areaSize - areaSize / 2
    );

    sphere.userData = {
      type: "node",
      index: i,
      basePosition: sphere.position.clone(),
      speed: 0.8 + Math.random() * 1.5,
      floatAmplitude: 0.4 + Math.random() * 0.8,
      floatOffset: Math.random() * Math.PI * 2,
    };

    scene.add(sphere);
    objects.push(sphere);
  }

  const glowGeometry = new THREE.SphereGeometry(areaSize * 0.6, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00ffff),
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
  });

  const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
  glowSphere.userData = { type: "glow" };

  scene.add(glowSphere);
  objects.push(glowSphere);

  return objects;
};
