import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCelestialOrbitVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const planets = Math.floor(8 * params.complexity);

  // Central star
  const starGeometry = new THREE.SphereGeometry(0.8, 32, 32);
  const starMaterial = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    emissive: 0xffaa00,
    emissiveIntensity: 2,
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.userData = { isStar: true };
  scene.add(star);
  objects.push(star);

  // Planets
  for (let i = 0; i < planets; i++) {
    const orbitRadius = 1.5 + i * 0.8;
    const planetSize = 0.1 + Math.random() * 0.3;
    
    const planetGeometry = new THREE.SphereGeometry(planetSize, 24, 24);
    const planetMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / planets, 0.8, 0.5),
      transparent: true,
      opacity: 0.9,
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.userData = {
      orbitRadius,
      orbitSpeed: 0.5 / (i + 1),
      angle: (i / planets) * Math.PI * 2,
      planetSize,
      index: i,
    };
    scene.add(planet);
    objects.push(planet);

    // Orbit path
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.02, orbitRadius + 0.02, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    orbit.userData = { isOrbit: true };
    scene.add(orbit);
    objects.push(orbit);
  }

  return objects;
};
