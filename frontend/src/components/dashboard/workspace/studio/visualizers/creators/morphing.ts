import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createMorphingVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const count = Math.floor(params.complexity * 2);

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((i / count) * 0.8, 0.9, 0.6),
      wireframe: params.wireframe,
      transparent: true,
      opacity: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);

    const angle = (i / count) * Math.PI * 2;
    const radius = 3 + Math.sin(i) * 2;
    mesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * 0.5,
      Math.sin(angle) * radius
    );

    mesh.userData = {
      index: i,
      baseScale: 0.5 + Math.random() * 0.5,
      morphSpeed: 0.5 + Math.random() * params.morphSpeed,
      originalVertices: geometry.attributes.position.array.slice(),
    };

    scene.add(mesh);
    objects.push(mesh);
  }

  return objects;
};