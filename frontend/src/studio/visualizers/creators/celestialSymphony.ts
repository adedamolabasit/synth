// creators/celestialSymphony.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCelestialSymphonyVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const celestialGroup = new THREE.Group();
  
  const planetCount = 8;
  const planets: THREE.Mesh[] = [];
  const orbitalPaths: THREE.Line[] = [];
  const starField: THREE.Points[] = [];

  // Create star field background
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    // Spherical distribution for immersive star field
    const radius = 50 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i3 + 2] = radius * Math.cos(phi);
    
    starSizes[i] = Math.random() * 2 + 0.5;
  }
  
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
  
  const starMaterial = new THREE.PointsMaterial({
    size: 0.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  
  const stars = new THREE.Points(starGeometry, starMaterial);
  celestialGroup.add(stars);
  starField.push(stars);

  // Create planets with unique characteristics
  const planetTypes = [
    { size: 1.2, color: 0xff6b6b, rings: true },    // Gas giant
    { size: 0.8, color: 0x4ecdc4, rings: false },   // Ocean world
    { size: 1.0, color: 0x45b7d1, rings: true },    // Ice giant
    { size: 0.6, color: 0xffa500, rings: false },   // Desert world
    { size: 0.9, color: 0x96ceb4, rings: true },    // Earth-like
    { size: 1.1, color: 0xfeca57, rings: false },   // Volcanic
    { size: 0.7, color: 0xff9ff3, rings: true },    // Crystal
    { size: 1.3, color: 0x54a0ff, rings: false }    // Storm giant
  ];

  planetTypes.forEach((planetType, index) => {
    const geometry = new THREE.SphereGeometry(planetType.size, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: planetType.color,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9
    });

    const planet = new THREE.Mesh(geometry, material);
    
    // Orbital positioning
    const orbitRadius = 8 + index * 3;
    const angle = (index / planetCount) * Math.PI * 2;
    
    planet.position.set(
      Math.cos(angle) * orbitRadius,
      (Math.random() - 0.5) * 4,
      Math.sin(angle) * orbitRadius
    );

    celestialGroup.add(planet);
    planets.push(planet);

    // Create orbital path
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.1, orbitRadius + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    celestialGroup.add(orbit);
    orbitalPaths.push(orbit);

    // Add planetary rings for some planets
    if (planetType.rings) {
      const ringGeometry = new THREE.RingGeometry(planetType.size * 1.5, planetType.size * 2, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: planetType.color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      planet.add(ring);
    }
  });

  // Add central sun
  const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    emissive: 0xff4500,
    emissiveIntensity: 0.5
  });
  
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  celestialGroup.add(sun);

  celestialGroup.userData = {
    type: "celestialSymphony",
    planets,
    orbitalPaths,
    starField,
    sun,
    orbitalSpeeds: planets.map(() => (Math.random() * 0.01 + 0.005)),
    planetaryPhases: planets.map(() => Math.random() * Math.PI * 2),
    solarFlare: 0,
    isLyrics: false,
  };

  scene.add(celestialGroup);
  objects.push(celestialGroup);
  return objects;
};