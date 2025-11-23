// creators/morphingCrystals.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createMorphingCrystalsVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const crystalGroup = new THREE.Group();
  
  const crystalCount = 50;
  const crystals: THREE.Mesh[] = [];
  const crystalTypes = [
    () => new THREE.OctahedronGeometry(0.5),
    () => new THREE.DodecahedronGeometry(0.4),
    () => new THREE.IcosahedronGeometry(0.6),
    () => new THREE.TetrahedronGeometry(0.7),
    () => new THREE.ConeGeometry(0.3, 1.2, 6)
  ];

  for (let i = 0; i < crystalCount; i++) {
    const typeIndex = Math.floor(Math.random() * crystalTypes.length);
    const geometry = crystalTypes[typeIndex]();
    
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.4, 0.8, 0.5),
      transparent: true,
      opacity: 0.8,
      transmission: 0.3,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    const crystal = new THREE.Mesh(geometry, material);
    
    // Distribute in clustered formation
    const cluster = Math.floor(i / 10);
    const angle = (i % 10) * (Math.PI * 2 / 10);
    const radius = 2 + cluster * 3;
    
    crystal.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 8,
      Math.sin(angle) * radius
    );

    crystal.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    crystalGroup.add(crystal);
    crystals.push(crystal);
  }

  crystalGroup.userData = {
    type: "morphingCrystals",
    crystals,
    baseGeometries: crystals.map(c => c.geometry.clone()),
    targetGeometries: crystals.map(() => crystalTypes[Math.floor(Math.random() * crystalTypes.length)]()),
    morphProgress: crystals.map(() => Math.random()),
    rotationSpeeds: crystals.map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    )),
    isLyrics: false,
  };

  scene.add(crystalGroup);
  objects.push(crystalGroup);
  return objects;
};