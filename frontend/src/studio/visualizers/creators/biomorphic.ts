import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createBiomorphicVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  
  // Limit complexity to prevent performance issues
  const branches = Math.min(Math.floor(params.complexity * 3), 8); // Max 8 branches
  const maxDepth = Math.min(3 + Math.floor(params.complexity / 2), 5); // Max depth 5

  // Reuse geometries and materials to improve performance
  const geometries: THREE.CylinderGeometry[] = [];
  const materials: THREE.MeshPhongMaterial[] = [];

  // Pre-create geometries for different depths
  for (let depth = 0; depth <= maxDepth; depth++) {
    const length = 1.5 / (depth + 1);
    geometries[depth] = new THREE.CylinderGeometry(0.02, 0.05, length, 6); // Reduced segments
    materials[depth] = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.3 + depth * 0.1, 0.8, 0.5),
      transparent: true,
      opacity: 0.8,
    });
  }

  const createBranch = (
    depth: number,
    maxDepth: number,
    position: THREE.Vector3,
    direction: THREE.Vector3
  ): THREE.Object3D => {
    if (depth > maxDepth) return new THREE.Object3D();

    const segment = new THREE.Mesh(geometries[depth], materials[depth]);
    segment.position.copy(position);
    segment.lookAt(position.clone().add(direction));
    segment.rotateX(Math.PI / 2);

    const endPosition = position
      .clone()
      .add(direction.clone().multiplyScalar(1.5 / (depth + 1)));

    // Add recursive branches with limits
    if (depth < maxDepth) {
      const childCount = Math.min(2 + Math.floor(params.patternDensity), 3); // Max 3 children
      for (let i = 0; i < childCount; i++) {
        const angle = (i / childCount) * Math.PI * 2;
        const childDirection = new THREE.Vector3(
          Math.cos(angle) * 0.5,
          Math.sin(angle) * 0.3,
          (Math.random() - 0.5) * 0.5
        ).normalize();

        const child = createBranch(
          depth + 1,
          maxDepth,
          endPosition,
          childDirection
        );
        segment.add(child);
      }
    }

    segment.userData = {
      depth,
      pulsePhase: Math.random() * Math.PI * 2,
    };

    return segment;
  };

  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * Math.PI * 2;
    const direction = new THREE.Vector3(
      Math.cos(angle) * 0.5,
      (Math.random() - 0.5) * 0.3, // Reduced vertical variation
      Math.sin(angle) * 0.5
    ).normalize();

    const branch = createBranch(0, maxDepth, new THREE.Vector3(), direction);
    branch.position.set(
      Math.cos(angle) * 1.5, // Reduced spread
      Math.sin(i) * 0.5,     // Reduced vertical spread
      Math.sin(angle) * 1.5  // Reduced spread
    );

    scene.add(branch);
    objects.push(branch);
  }

  return objects;
};