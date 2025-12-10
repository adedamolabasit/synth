import * as THREE from "three";

export const createWaveform3DVisualizermini = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const points = 128;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points * 3);
  const colors = new Float32Array(points * 3);

  const baseHue = Math.random();

  for (let i = 0; i < points; i++) {
    const i3 = i * 3;
    positions[i3] = (i - points / 2) * 0.1;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;

    const c = new THREE.Color().setHSL(
      baseHue + Math.random() * 0.05,
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
  });

  const waveform = new THREE.Line(geometry, material);

  waveform.userData = {
    type: "waveform3D",
    points,
    originalPositions: positions.slice(),
    phaseOffsets: Array.from(
      { length: points },
      () => Math.random() * Math.PI * 2
    ),
    baseHue,
    colorShiftSpeed: 0.002 + Math.random() * 0.004,
    flowDirection: 1,
    isLyrics: false,
  };

  scene.add(waveform);
  objects.push(waveform);
  return objects;
};
