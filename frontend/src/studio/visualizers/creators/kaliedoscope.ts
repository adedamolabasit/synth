import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createKaleidoscopeVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const segments = Math.floor(8 + params.complexity * 12);
  const layers = Math.floor(4 + params.patternDensity * 6);

  for (let layer = 0; layer < layers; layer++) {
    const radius = 1.5 + layer * 0.9;

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const geometry =
        Math.random() > 0.5
          ? new THREE.ConeGeometry(0.1 + Math.random() * 0.15, 0.4 + Math.random() * 0.3, 6)
          : new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 8, 8);

      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / segments, 1, 0.5),
        transparent: true,
        opacity: 0.8,
        shininess: 50,
        emissive: new THREE.Color().setHSL(i / segments, 0.5, 0.2),
      });

      const mesh = new THREE.Mesh(geometry, material);

      const r = radius + (Math.random() - 0.5) * 0.2;
      mesh.position.set(
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        (layer - layers / 2) * 0.3 + (Math.random() - 0.5) * 0.1
      );

      mesh.userData = { angle, layer, segment: i, radius: r, rotationOffset: Math.random() * Math.PI * 2 };

      scene.add(mesh);
      objects.push(mesh);
    }
  }

  return objects;
};
