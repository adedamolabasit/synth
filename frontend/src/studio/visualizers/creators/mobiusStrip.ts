import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createMobiusStripVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const segments = Math.floor(100 * params.patternDensity);
  const strips = Math.floor(3 * params.complexity);

  for (let strip = 0; strip < strips; strip++) {
    const radius = 2 + strip * 0.5;
    const vertices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = (radius + 0.5 * Math.cos(t / 2)) * Math.cos(t);
      const y = (radius + 0.5 * Math.cos(t / 2)) * Math.sin(t);
      const z = 0.5 * Math.sin(t / 2);

      vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(strip / strips, 1, 0.5),
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
    });

    const mobiusStrip = new THREE.Line(geometry, material);
    mobiusStrip.userData = { stripIndex: strip };
    scene.add(mobiusStrip);
    objects.push(mobiusStrip);
    
    const particleCount = Math.floor(30 * params.patternDensity);
    for (let j = 0; j < particleCount; j++) {
      const t = (j / particleCount) * Math.PI * 2;
      const x = (radius + 0.5 * Math.cos(t / 2)) * Math.cos(t);
      const y = (radius + 0.5 * Math.cos(t / 2)) * Math.sin(t);
      const z = 0.5 * Math.sin(t / 2);

      const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      const particleMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(strip / strips, 1, 0.6),
        transparent: true,
        opacity: 0.9,
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(x, y, z);
      particle.userData = { isParticle: true, t, stripIndex: strip, index: j };
      scene.add(particle);
      objects.push(particle);
    }
  }

  return objects;
};
