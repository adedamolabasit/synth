import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createElectromagneticFieldVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const fieldLines = Math.floor(12 * params.complexity);

  const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const coreMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x00aaff,
    emissiveIntensity: 1.5,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.userData = { isCore: true };
  scene.add(core);
  objects.push(core);

  for (let i = 0; i < fieldLines; i++) {
    const points: THREE.Vector3[] = [];
    const segments = Math.floor(50 * params.patternDensity);
    const phi = (i / fieldLines) * Math.PI;

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const theta = t * Math.PI * 4;
      const radius = t * 5;

      points.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius,
        Math.sin(phi) * Math.sin(theta) * radius
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(0.6, 1, 0.5),
      transparent: true,
      opacity: 0.6,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { index: i, isFieldLine: true };
    scene.add(line);
    objects.push(line);
  }

  return objects;
};
