import * as THREE from "three";

export const createCubeGridVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const gridSize = 8;
  const spacing = 1.2;
  const cubeSize = 0.4;

  const group = new THREE.Group();
  group.userData = {
    type: "cubeGrid",
    gridSize,
    cubes: [] as THREE.Mesh[],
    baseHue: Math.random(),
    beatPulse: 0,
  };

  const baseHue = group.userData.baseHue;

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const hue = (baseHue + (x + z) / (gridSize * 2)) % 1;
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.5),
        transparent: true,
        opacity: 0.9,
        metalness: 0.3,
        roughness: 0.4,
      });

      const cube = new THREE.Mesh(geometry, material);
      
      // Set base position - cubes will animate UP from here
      cube.position.set(
        (x - gridSize / 2) * spacing + spacing / 2,
        cubeSize / 2, // Start at half cube height so scaling goes upward
        (z - gridSize / 2) * spacing + spacing / 2
      );

      cube.userData = {
        gridX: x,
        gridZ: z,
        baseY: cubeSize / 2, // Store the base Y position
        phaseOffset: Math.random() * Math.PI * 2,
        originalScale: 1,
        originalHeight: cubeSize, // Store original cube height
      };

      group.add(cube);
      group.userData.cubes.push(cube);
    }
  }

  scene.add(group);
  objects.push(group);
  return objects;
};