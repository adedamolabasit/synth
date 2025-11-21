import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createAuroraWavesVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const ribbons = Math.floor(3 + params.complexity * 5); // number of ribbons
  const pointsPerRibbon = 200;

  for (let r = 0; r < ribbons; r++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsPerRibbon * 3);
    const colors = new Float32Array(pointsPerRibbon * 3);

    for (let i = 0; i < pointsPerRibbon; i++) {
      const t = i / pointsPerRibbon;
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10; // x
      positions[i * 3 + 1] = t * 5;                        // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

      const hue = (r / ribbons + t) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = {
      ribbonIndex: r,
      pointsPerRibbon,
      speed: 0.5 + Math.random() * 0.5,
      offset: Math.random() * 100,
    };

    scene.add(line);
    objects.push(line);
  }

  return objects;
};
