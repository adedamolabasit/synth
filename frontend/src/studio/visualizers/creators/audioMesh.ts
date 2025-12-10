import * as THREE from "three";

export const createAudioMeshVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const gridSize = 64;
  const baseHue = Math.random();

  const geometry = new THREE.PlaneGeometry(12, 12, gridSize - 1, gridSize - 1);
  geometry.rotateX(-Math.PI / 2);

  const positionAttr = geometry.getAttribute("position");
  const originalPositions = new Float32Array(positionAttr.array.length);
  originalPositions.set(positionAttr.array as Float32Array);

  const colors = new Float32Array(positionAttr.count * 3);
  for (let i = 0; i < positionAttr.count; i++) {
    const c = new THREE.Color().setHSL(baseHue, 0.7, 0.5);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = {
    type: "audioMesh",
    gridSize,
    originalPositions,
    baseHue,
    wavePhase: 0,
  };

  scene.add(mesh);
  objects.push(mesh);

  const solidGeometry = geometry.clone();
  const solidMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    metalness: 0.5,
    roughness: 0.5,
  });
  const solidMesh = new THREE.Mesh(solidGeometry, solidMaterial);
  solidMesh.position.y = -0.01;
  solidMesh.userData = { isSolid: true, gridSize, originalPositions: originalPositions.slice() };
  scene.add(solidMesh);
  objects.push(solidMesh);

  return objects;
};
