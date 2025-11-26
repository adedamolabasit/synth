import * as THREE from "three";

export const createTesseractVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];

  const vertices4D = [
    [-1, -1, -1, -1],
    [1, -1, -1, -1],
    [-1, 1, -1, -1],
    [1, 1, -1, -1],
    [-1, -1, 1, -1],
    [1, -1, 1, -1],
    [-1, 1, 1, -1],
    [1, 1, 1, -1],
    [-1, -1, -1, 1],
    [1, -1, -1, 1],
    [-1, 1, -1, 1],
    [1, 1, -1, 1],
    [-1, -1, 1, 1],
    [1, -1, 1, 1],
    [-1, 1, 1, 1],
    [1, 1, 1, 1],
  ];

  const project4Dto3D = (v4: number[], w: number): THREE.Vector3 => {
    const distance = 3;
    const scale = distance / (distance - v4[3] + w);
    return new THREE.Vector3(v4[0] * scale, v4[1] * scale, v4[2] * scale);
  };

  const vertices3D = vertices4D.map((v) => project4Dto3D(v, 0));

  vertices3D.forEach((vertex, i) => {
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(vertex);
    sphere.userData = { index: i, isVertex: true };
    scene.add(sphere);
    objects.push(sphere);
  });

  const edges = [
    [0, 1],
    [0, 2],
    [0, 4],
    [0, 8],
    [1, 3],
    [1, 5],
    [1, 9],
    [2, 3],
    [2, 6],
    [2, 10],
    [3, 7],
    [3, 11],
    [4, 5],
    [4, 6],
    [4, 12],
    [5, 7],
    [5, 13],
    [6, 7],
    [6, 14],
    [7, 15],
    [8, 9],
    [8, 10],
    [8, 12],
    [9, 11],
    [9, 13],
    [10, 11],
    [10, 14],
    [11, 15],
    [12, 13],
    [12, 14],
    [13, 15],
    [14, 15],
  ];

  const material = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.6,
  });

  edges.forEach(([a, b]) => {
    const points = [vertices3D[a], vertices3D[b]];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material.clone());
    line.userData = { isEdge: true };
    scene.add(line);
    objects.push(line);
  });

  return objects;
};
