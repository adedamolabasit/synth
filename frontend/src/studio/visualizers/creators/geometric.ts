import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createGeometricVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const shapes = ["box", "sphere", "cone", "torus"];
  const count = Math.floor(12 + params.complexity * 8);

  for (let i = 0; i < count; i++) {
    let geometry: THREE.BufferGeometry;
    const shapeType = shapes[i % shapes.length];

    switch (shapeType) {
      case "box":
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(0.4, 16, 16);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(0.3, 0.8, 16);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(0.4, 0.1, 16, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / count, 0.9, 0.5),
      transparent: true,
      opacity: 0.9,
      shininess: 50,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Orbit parameters
    const angle = (i / count) * Math.PI * 2;
    const radius = 2 + Math.random() * 2;

    mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    mesh.userData = {
      index: i,
      baseAngle: angle,
      radius,
      speed: 0.5 + Math.random(),
      shapeType,
      yOffset: Math.random() * 2 - 1,
    };

    scene.add(mesh);
    objects.push(mesh);
  }

  return objects;
};
