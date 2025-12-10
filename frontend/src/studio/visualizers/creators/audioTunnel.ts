import * as THREE from "three";

export const createAudioTunnelVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const ringCount = 40;
  const segmentsPerRing = 48;
  const baseHue = Math.random();

  const group = new THREE.Group();
  group.userData = {
    type: "audioTunnel",
    rings: [] as THREE.Line[],
    baseHue,
    travelOffset: 0,
  };

  for (let r = 0; r < ringCount; r++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segmentsPerRing + 1) * 3);
    const colors = new Float32Array((segmentsPerRing + 1) * 3);

    const zPos = r * 0.8;
    const baseRadius = 2 + Math.sin(r * 0.2) * 0.5;
    const ringHue = (baseHue + r / ringCount * 0.5) % 1;

    for (let i = 0; i <= segmentsPerRing; i++) {
      const angle = (i / segmentsPerRing) * Math.PI * 2;
      const i3 = i * 3;

      positions[i3] = Math.cos(angle) * baseRadius;
      positions[i3 + 1] = Math.sin(angle) * baseRadius;
      positions[i3 + 2] = -zPos;

      const c = new THREE.Color().setHSL(ringHue, 0.8, 0.5);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const ring = new THREE.Line(geometry, material);
    ring.userData = {
      ringIndex: r,
      baseRadius,
      segmentsPerRing,
      ringHue,
      originalZ: -zPos,
    };

    group.add(ring);
    group.userData.rings.push(ring);
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ringCount * 3);
    const colors = new Float32Array(ringCount * 3);

    for (let r = 0; r < ringCount; r++) {
      const zPos = r * 0.8;
      const radius = 2 + Math.sin(r * 0.2) * 0.5;
      const r3 = r * 3;

      positions[r3] = Math.cos(angle) * radius;
      positions[r3 + 1] = Math.sin(angle) * radius;
      positions[r3 + 2] = -zPos;

      const hue = (baseHue + r / ringCount) % 1;
      const c = new THREE.Color().setHSL(hue, 0.7, 0.4);
      colors[r3] = c.r;
      colors[r3 + 1] = c.g;
      colors[r3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { isSpine: true, spineAngle: angle };
    group.add(line);
  }

  scene.add(group);
  objects.push(group);
  return objects;
};