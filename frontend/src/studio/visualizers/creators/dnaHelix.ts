import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createDNAHelixVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const segments = Math.floor(40 * params.patternDensity);
  const radius = 2;

  const material1 = new THREE.MeshPhongMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.8,
  });

  const material2 = new THREE.MeshPhongMaterial({
    color: 0xff0088,
    transparent: true,
    opacity: 0.8,
  });

  const connectorMaterial = new THREE.MeshPhongMaterial({
    color: 0x8888ff,
    transparent: true,
    opacity: 0.6,
  });

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 4 * params.complexity;
    const y = (i / segments) * 8 - 4;

    // First strand
    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      material1
    );
    sphere1.position.set(Math.cos(t) * radius, y, Math.sin(t) * radius);
    sphere1.userData = { index: i, strand: 1 };
    scene.add(sphere1);
    objects.push(sphere1);

    // Second strand
    const sphere2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      material2
    );
    sphere2.position.set(
      Math.cos(t + Math.PI) * radius,
      y,
      Math.sin(t + Math.PI) * radius
    );
    sphere2.userData = { index: i, strand: 2 };
    scene.add(sphere2);
    objects.push(sphere2);

    // Connector
    if (i % 3 === 0) {
      const connector = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, radius * 2, 8),
        connectorMaterial
      );
      connector.position.copy(sphere1.position);
      connector.lookAt(sphere2.position);
      connector.rotateX(Math.PI / 2);
      connector.userData = { index: i, isConnector: true };
      scene.add(connector);
      objects.push(connector);
    }
  }

  return objects;
};
