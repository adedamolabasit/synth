import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSpectrumVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const bars = 64;
  const radius = 6;
  const height = 1.5;

  const group = new THREE.Group();

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, height, 8, 1, true);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(i / bars, 1, 0.5),
      emissive: new THREE.Color().setHSL(i / bars, 1, 0.4),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85,
      metalness: 0.3,
      roughness: 0.4,
    });

    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(
      Math.cos(angle) * radius,
      height / 2,
      Math.sin(angle) * radius
    );

    bar.rotation.y = -angle;
    bar.userData = { index: i, baseScale: 1 };
    group.add(bar);
    objects.push(bar);
  }

  // Optional central glow sphere
  const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00ffff),
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);
  objects.push(glow);

  // Add subtle rotation
  group.userData = { rotationSpeed: 0.002 };
  scene.add(group);
  objects.push(group);

  return objects;
};
