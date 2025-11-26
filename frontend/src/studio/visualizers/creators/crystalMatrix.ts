import * as THREE from "three";

export const createCrystalMatrixVisualizer = (
  scene: THREE.Scene,
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const crystalGroup = new THREE.Group();
  const gridSize = 8;
  const crystals: THREE.Mesh[] = [];

  for (let x = -gridSize; x <= gridSize; x += 2) {
    for (let z = -gridSize; z <= gridSize; z += 2) {
      const height = Math.random() * 3 + 1;
      const geometry = new THREE.CylinderGeometry(0.1, 0.3, height, 6);
      
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.6, 0.8, 0.5),
        transparent: true,
        opacity: 0.9,
        transmission: 0.5,
        roughness: 0.1,
        metalness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1
      });

      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.set(x, height / 2, z);
      crystal.rotation.x = Math.random() * 0.1;
      crystal.rotation.z = Math.random() * 0.1;
      
      crystalGroup.add(crystal);
      crystals.push(crystal);
    }
  }

  crystalGroup.userData = {
    type: "crystalMatrix",
    crystals,
    basePositions: crystals.map(c => c.position.clone()),
    oscillationPhases: crystals.map(() => Math.random() * Math.PI * 2),
    refractionIndices: crystals.map(() => 1 + Math.random() * 0.5),
    isLyrics: false,
  };

  scene.add(crystalGroup);
  objects.push(crystalGroup);
  return objects;
};