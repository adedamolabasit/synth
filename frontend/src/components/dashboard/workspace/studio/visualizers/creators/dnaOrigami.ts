import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createDNAOrigamiVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const segments = Math.floor(40 * params.patternDensity);

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 6;
    const radius = 2 + Math.sin(t * 2) * 0.5;

    // Create folded structure
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.3);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((i / segments), 0.8, 0.5),
      transparent: true,
      opacity: 0.8,
    });

    const box = new THREE.Mesh(geometry, material);
    box.position.set(
      Math.cos(t) * radius,
      (i / segments) * 8 - 4,
      Math.sin(t) * radius
    );
    box.lookAt(
      Math.cos(t + 0.1) * radius,
      (i / segments) * 8 - 4 + 0.1,
      Math.sin(t + 0.1) * radius
    );
    box.userData = { index: i };
    scene.add(box);
    objects.push(box);

    // Connector
    if (i > 0) {
      const prevBox = objects[objects.length - 2] as THREE.Mesh;
      const points = [prevBox.position.clone(), box.position.clone()];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x8888ff,
        transparent: true,
        opacity: 0.6,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.userData = { isConnector: true };
      scene.add(line);
      objects.push(line);
    }
  }

  return objects;
};
