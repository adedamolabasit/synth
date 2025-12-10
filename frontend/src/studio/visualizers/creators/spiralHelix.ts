import * as THREE from "three";

export const createSpiralHelixVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const helixCount = 3;
  const pointsPerHelix = 200;
  const baseHue = Math.random();

  const group = new THREE.Group();
  group.userData = {
    type: "spiralHelix",
    helices: [] as THREE.Line[],
    baseHue,
    twistDirection: 1,
  };

  for (let h = 0; h < helixCount; h++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsPerHelix * 3);
    const colors = new Float32Array(pointsPerHelix * 3);
    const originalPositions = new Float32Array(pointsPerHelix * 3);

    const helixOffset = (h / helixCount) * Math.PI * 2;
    const helixHue = (baseHue + h / helixCount) % 1;

    for (let i = 0; i < pointsPerHelix; i++) {
      const t = (i / pointsPerHelix) * Math.PI * 6;
      const radius = 2 + Math.sin(t * 0.5) * 0.5;
      const y = (i / pointsPerHelix - 0.5) * 8;

      const i3 = i * 3;
      positions[i3] = Math.cos(t + helixOffset) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(t + helixOffset) * radius;

      originalPositions[i3] = positions[i3];
      originalPositions[i3 + 1] = positions[i3 + 1];
      originalPositions[i3 + 2] = positions[i3 + 2];

      const c = new THREE.Color().setHSL(
        (helixHue + i / pointsPerHelix * 0.3) % 1,
        0.8,
        0.5
      );
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });

    const helix = new THREE.Line(geometry, material);
    helix.userData = {
      helixIndex: h,
      pointsPerHelix,
      originalPositions,
      helixOffset,
      helixHue,
      phaseOffsets: Array.from(
        { length: pointsPerHelix },
        () => Math.random() * Math.PI * 2
      ),
    };

    group.add(helix);
    group.userData.helices.push(helix);
  }

  scene.add(group);
  objects.push(group);
  return objects;
};
