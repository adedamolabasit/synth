import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateQuantumFoam = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;
      const velocity = obj.userData.velocity;
      const lifetime = obj.userData.lifetime;
      const size = obj.userData.size;

      obj.userData.age++;

      // Move bubbles
      obj.position.add(velocity);

      // Quantum fluctuations
      if (Math.random() < 0.05 * audioValue) {
        obj.position.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ));
      }

      // Respawn bubbles
      if (obj.userData.age > lifetime) {
        obj.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        );
        obj.userData.age = 0;
      }

      // Boundary wrapping
      ['x', 'y', 'z'].forEach((axis) => {
        if (Math.abs(obj.position[axis as 'x' | 'y' | 'z']) > 4) {
          obj.position[axis as 'x' | 'y' | 'z'] *= -1;
        }
      });

      const scale = size * (1 + audioValue * 0.5);
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (index / objects.length + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.6);
        obj.material.emissive.setHSL(hue, 0.8, 0.3 + audioValue * 0.3);
        obj.material.opacity = 0.3 + audioValue * 0.4;
      }
    }
  });
};
