import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateQuantumField = (
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
      const phase = obj.userData.phase;

      obj.position.add(velocity);

      // Quantum tunneling effect
      if (Math.random() < 0.01 * audioValue) {
        obj.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        );
      }

      // Boundary wrapping
      ['x', 'y', 'z'].forEach((axis) => {
        if (Math.abs(obj.position[axis as 'x' | 'y' | 'z']) > 5) {
          obj.position[axis as 'x' | 'y' | 'z'] *= -1;
        }
      });

      const scale = 0.5 + audioValue * 1.5;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (index / objects.length + scaledTime * 0.1) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.emissive.setHSL(hue, 1, audioValue * 0.5);
        obj.material.opacity = 0.5 + audioValue * 0.4;
      }
    }
  });
};
