import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createFireRingsVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const rings = Math.floor(8 * params.complexity);

  for (let i = 0; i < rings; i++) {
    const radius = 0.5 + i * 0.4;
    const geometry = new THREE.TorusGeometry(radius, 0.1, 16, 64);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.1 - i * 0.01, 1, 0.5),
      emissive: new THREE.Color().setHSL(0.1 - i * 0.01, 1, 0.4),
      transparent: true,
      opacity: 0.8,
    });

    const ring = new THREE.Mesh(geometry, material);
    ring.position.y = i * 0.3 - rings * 0.15;
    ring.userData = { index: i };
    scene.add(ring);
    objects.push(ring);

    const flameCount = Math.floor(20 * params.patternDensity);
    for (let j = 0; j < flameCount; j++) {
      const angle = (j / flameCount) * Math.PI * 2;
      const flameGeometry = new THREE.ConeGeometry(0.05, 0.3, 8);
      const flameMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6600,
        emissive: 0xff4400,
        transparent: true,
        opacity: 0.7,
      });

      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      flame.userData = { isFlame: true, angle, ringIndex: i };
      ring.add(flame);
      objects.push(flame);
    }
  }

  return objects;
};
