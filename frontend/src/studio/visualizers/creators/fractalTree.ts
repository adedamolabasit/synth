import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createFractalTreeVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const maxDepth = Math.min(4 + Math.floor(params.complexity), 7);

  const createBranch = (
    depth: number,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    length: number
  ): void => {
    if (depth > maxDepth) return;

    const geometry = new THREE.CylinderGeometry(
      0.05 * (1 - depth / maxDepth),
      0.1 * (1 - depth / maxDepth),
      length,
      8
    );
    
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.3 - depth * 0.05, 0.8, 0.5),
      transparent: true,
      opacity: 0.9,
    });

    const branch = new THREE.Mesh(geometry, material);
    branch.position.copy(position);
    branch.lookAt(position.clone().add(direction));
    branch.rotateX(Math.PI / 2);
    branch.userData = { depth, pulsePhase: Math.random() * Math.PI * 2 };

    scene.add(branch);
    objects.push(branch);

    const endPosition = position.clone().add(direction.clone().multiplyScalar(length));

    if (depth < maxDepth) {
      const branches = 3;
      for (let i = 0; i < branches; i++) {
        const angle = (i / branches) * Math.PI * 2;
        const spread = 0.6;
        const newDirection = new THREE.Vector3(
          direction.x + Math.cos(angle) * spread,
          direction.y + 0.7,
          direction.z + Math.sin(angle) * spread
        ).normalize();

        createBranch(depth + 1, endPosition, newDirection, length * 0.7);
      }
    }
  };

  createBranch(0, new THREE.Vector3(0, -4, 0), new THREE.Vector3(0, 1, 0), 2);

  return objects;
};
