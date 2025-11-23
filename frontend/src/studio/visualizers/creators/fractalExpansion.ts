// creators/fractalExpansion.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createFractalExpansionVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const fractalGroup = new THREE.Group();
  
  const fractalDepth = 4;
  const fractalNodes: THREE.Mesh[] = [];

  // Recursive function to create fractal structure
  const createFractalBranch = (
    parent: THREE.Group,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    size: number,
    depth: number,
    branchIndex: number
  ) => {
    if (depth <= 0) return;

    const geometry = new THREE.SphereGeometry(size, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.3 + depth * 0.1, 0.8, 0.5),
      transparent: true,
      opacity: 0.7
    });

    const node = new THREE.Mesh(geometry, material);
    node.position.copy(position);
    parent.add(node);
    fractalNodes.push(node);

    // Create branches
    const branchCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < branchCount; i++) {
      const angle = (i / branchCount) * Math.PI * 2;
      const branchDirection = new THREE.Vector3(
        Math.cos(angle) * 0.7 + direction.x * 0.3,
        Math.sin(angle) * 0.7 + direction.y * 0.3,
        direction.z * 0.7
      ).normalize();

      const branchSize = size * 0.6;
      const branchPosition = position.clone().add(
        branchDirection.clone().multiplyScalar(size * 2)
      );

      createFractalBranch(
        parent,
        branchPosition,
        branchDirection,
        branchSize,
        depth - 1,
        i
      );
    }
  };

  // Create main fractal structure
  createFractalBranch(
    fractalGroup,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
    1.5,
    fractalDepth,
    0
  );

  fractalGroup.userData = {
    type: "fractalExpansion",
    fractalNodes,
    basePositions: fractalNodes.map(n => n.position.clone()),
    baseScales: fractalNodes.map(n => n.scale.clone()),
    vibrationPhases: fractalNodes.map(() => Math.random() * Math.PI * 2),
    expansionLevel: 0,
    isLyrics: false,
  };

  scene.add(fractalGroup);
  objects.push(fractalGroup);
  return objects;
};