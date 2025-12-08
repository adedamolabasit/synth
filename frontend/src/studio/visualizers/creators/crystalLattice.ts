import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCrystalLatticeVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  
  const centerOrbGeometry = new THREE.SphereGeometry(2, 32, 32);
  const centerOrbMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
  });
  
  const centerOrb = new THREE.Mesh(centerOrbGeometry, centerOrbMaterial);
  centerOrb.userData = {
    isCenterOrb: true,
    baseRadius: 2,
  };
  
  scene.add(centerOrb);
  objects.push(centerOrb);

  const rings: THREE.Line[] = [];
  for (let i = 1; i <= 3; i++) {
    const ringGeometry = new THREE.RingGeometry(i * 1.5, i * 1.5 + 0.1, 32);
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.2,
    });
    
    const ring = new THREE.LineLoop(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.userData = {
      isRing: true,
      ringIndex: i,
    };
    
    scene.add(ring);
    rings.push(ring);
    objects.push(ring);
  }

  const layers = Math.floor(3 + params.patternDensity * 2);
  const crystalsPerLayer = Math.floor(12 + params.complexity * 8);

  for (let layer = 0; layer < layers; layer++) {
    const radius = 3 + layer * 1.2;
    const height = layer * 1.5;
    
    for (let i = 0; i < crystalsPerLayer; i++) {
      const angle = (i / crystalsPerLayer) * Math.PI * 2;
      const geometry = new THREE.OctahedronGeometry(0.2, 0);
      
      const hue = (layer / layers + i / crystalsPerLayer) % 1;
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(hue, 0.6, 0.1),
        transparent: true,
        opacity: 0.9,
        shininess: 100,
      });

      const crystal = new THREE.Mesh(geometry, material);
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      crystal.position.set(x, height - 3, z);
      crystal.lookAt(0, height - 3, 0);

      crystal.userData = {
        basePosition: crystal.position.clone(),
        angle,
        radius,
        layer,
        crystalIndex: i,
        floatSpeed: 0.5 + Math.random() * 0.3,
        rotationSpeed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        baseHue: hue,
      };

      scene.add(crystal);
      objects.push(crystal);
    }
  }

  centerOrb.userData.rings = rings;

  return objects;
};