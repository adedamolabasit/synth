import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSacredGeometryVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const layers = Math.floor(5 * params.complexity);

  // --- Flower of Life rings ---
  for (let layer = 0; layer < layers; layer++) {
    const radius = 1 + layer * 0.8;
    const circles = 6;

    for (let i = 0; i < circles; i++) {
      const angle = (i / circles) * Math.PI * 2;
      const geometry = new THREE.TorusGeometry(radius, 0.05, 16, 64);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(layer / layers, 1, 0.5),
        transparent: true,
        opacity: 0.7,
        shininess: 50,
      });

      const torus = new THREE.Mesh(geometry, material);
      torus.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        layer * 0.3 - layers * 0.15
      );
      torus.userData = {
        type: "ring",
        layer,
        angle,
        baseRadius: radius,
        index: i,
      };
      scene.add(torus);
      objects.push(torus);
    }
  }

  // --- Metatron's Cube vertices ---
  const vertices = [
    [0, 0, 0],
    [1, 1, 1], [-1, 1, 1], [1, -1, 1], [1, 1, -1],
    [-1, -1, 1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1]
  ];

  vertices.forEach((vertex, i) => {
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0xff8800,
      shininess: 80,
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(vertex[0] * 2, vertex[1] * 2, vertex[2] * 2);
    sphere.userData = { type: "vertex", index: i, baseY: sphere.position.y };
    scene.add(sphere);
    objects.push(sphere);
  });

  return objects;
};
