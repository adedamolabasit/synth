import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSolarFlareVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const flareCount = Math.floor(12 * params.complexity);

  // Central sun
  const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sunMaterial = new THREE.MeshPhongMaterial({
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 1,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.userData = { isSun: true };
  scene.add(sun);
  objects.push(sun);

  // Flares
  for (let i = 0; i < flareCount; i++) {
    const angle = (i / flareCount) * Math.PI * 2;
    const flareGeometry = new THREE.ConeGeometry(0.2, 3, 8);
    const flareMaterial = new THREE.MeshPhongMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.8,
      emissive: 0xff4400,
    });

    const flare = new THREE.Mesh(flareGeometry, flareMaterial);
    flare.position.set(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0);
    flare.lookAt(
      Math.cos(angle) * 4,
      Math.sin(angle) * 4,
      0
    );
    flare.userData = { angle, index: i };
    scene.add(flare);
    objects.push(flare);
  }

  return objects;
};
