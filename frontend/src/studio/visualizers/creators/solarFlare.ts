import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSolarFlareVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const flareCount = Math.floor(12 + params.complexity * 20);

  const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sunMaterial = new THREE.MeshPhongMaterial({
    color: 0xffcc33,
    emissive: 0xff5500,
    emissiveIntensity: 1,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.userData = { isSun: true };
  scene.add(sun);
  objects.push(sun);

  for (let i = 0; i < flareCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const flareGeometry = new THREE.ConeGeometry(
      0.1 + Math.random() * 0.1,
      1 + Math.random() * 2,
      6
    );

    const flareMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 1, 0.5),
      transparent: true,
      opacity: 0.7,
      emissive: new THREE.Color(0xff5500),
      emissiveIntensity: 0.8,
      side: THREE.DoubleSide,
    });

    const flare = new THREE.Mesh(flareGeometry, flareMaterial);

    const radius = 1 + Math.random() * 0.5;
    flare.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (Math.random() - 0.5) * 0.5
    );

    flare.userData = {
      angle,
      radius,
      speed: 0.2 + Math.random() * 0.5,
      twist: Math.random() * 2 - 1,
      index: i,
    };

    scene.add(flare);
    objects.push(flare);
  }

  return objects;
};
