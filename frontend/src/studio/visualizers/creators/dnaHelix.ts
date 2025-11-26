import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createDNAHelixVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const segments = Math.floor(40 * params.patternDensity);
  const radius = 1.8;

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 4 * params.complexity;
    const y = (i / segments) * 8 - 4;

    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.4, 0.8, 0.5),
        emissive: 0x00ff88,
        transparent: true,
        opacity: 0.8,
      })
    );
    sphere1.position.set(Math.cos(t) * radius, y, Math.sin(t) * radius);
    sphere1.userData = { index: i, strand: 1, baseY: y, t };
    scene.add(sphere1);
    objects.push(sphere1);

    const sphere2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.9, 0.8, 0.5),
        emissive: 0xff0088,
        transparent: true,
        opacity: 0.8,
      })
    );
    sphere2.position.set(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius);
    sphere2.userData = { index: i, strand: 2, baseY: y, t };
    scene.add(sphere2);
    objects.push(sphere2);
  }

  return objects;
};
