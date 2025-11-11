import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createWaveform3DVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const points = 128;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points * 3);

  for (let i = 0; i < points; i++) {
    const i3 = i * 3;
    positions[i3] = (i - points / 2) * 0.1;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8,
  });

  const waveform = new THREE.Line(geometry, material);
  waveform.userData = {
    type: "waveform3D",
    points: points,
    originalPositions: positions.slice(),
  };
  scene.add(waveform);
  objects.push(waveform);

  return objects;
};