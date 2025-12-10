import * as THREE from "three";

export const createPulsingRingsVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const ringCount = 8;
  const segmentsPerRing = 64;
  const baseHue = Math.random();

  const group = new THREE.Group();
  group.userData = {
    type: "pulsingRings",
    rings: [] as THREE.Line[],
    baseHue,
    pulsePhase: 0,
  };

  for (let r = 0; r < ringCount; r++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segmentsPerRing + 1) * 3);
    const colors = new Float32Array((segmentsPerRing + 1) * 3);

    const baseRadius = 1 + r * 0.6;
    const ringHue = (baseHue + r / ringCount) % 1;

    for (let i = 0; i <= segmentsPerRing; i++) {
      const angle = (i / segmentsPerRing) * Math.PI * 2;
      const i3 = i * 3;

      positions[i3] = Math.cos(angle) * baseRadius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(angle) * baseRadius;

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
      opacity: 0.9,
    });

    const ring = new THREE.Line(geometry, material);
    ring.userData = {
      ringIndex: r,
      baseRadius,
      segmentsPerRing,
      ringHue,
      verticalOffset: 0,
      pulseOffset: r * 0.3,
    };

    group.add(ring);
    group.userData.rings.push(ring);
  }

  scene.add(group);
  objects.push(group);
  return objects;
};
