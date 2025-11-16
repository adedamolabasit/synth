import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createAuroraWavesVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const waves = Math.floor(5 * params.complexity);
  const resolution = Math.floor(50 * params.patternDensity);

  for (let w = 0; w < waves; w++) {
    const geometry = new THREE.PlaneGeometry(10, 10, resolution, resolution);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.5 + w * 0.1, 1, 0.5),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      wireframe: false,
    });

    const wave = new THREE.Mesh(geometry, material);
    wave.rotation.x = -Math.PI / 2;
    wave.position.y = w * 0.5 - waves * 0.25;
    wave.userData = { waveIndex: w, resolution };
    scene.add(wave);
    objects.push(wave);
  }

  return objects;
};
