import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createGeometricVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const shapes = ["box", "sphere", "cone", "torus"];
  const count = Math.floor(params.complexity);

  for (let i = 0; i < count; i++) {
    let geometry: THREE.BufferGeometry;
    const shapeType = shapes[i % shapes.length];

    switch (shapeType) {
      case "box":
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(0.7, 16, 16);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(0.5, 1.5, 16);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / count, 0.8, 0.6),
      wireframe: params.wireframe,
      transparent: true,
      opacity: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);

    const angle = (i / count) * Math.PI * 2;
    const radius = 3 + Math.sin(i) * 2;
    mesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * 0.5,
      Math.sin(angle) * radius
    );

    mesh.userData = {
      index: i,
      basePosition: mesh.position.clone(),
      shapeType: shapeType,
    };

    scene.add(mesh);
    objects.push(mesh);
  }

  return objects;
};