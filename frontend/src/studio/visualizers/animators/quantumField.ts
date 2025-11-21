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

      const { velocity, orbitRadius, orbitAngle, orbitPhi, phase } = obj.userData;

      // Orbital motion
      const angleSpeed = 0.5 + audioValue;
      const phiSpeed = 0.2 + audioValue * 0.5;

      const newTheta = orbitAngle + scaledTime * angleSpeed;
      const newPhi = orbitPhi + Math.sin(scaledTime + phase) * phiSpeed * 0.01;

      obj.position.x = orbitRadius * Math.sin(newPhi) * Math.cos(newTheta);
      obj.position.y = orbitRadius * Math.sin(newPhi) * Math.sin(newTheta);
      obj.position.z = orbitRadius * Math.cos(newPhi);

      // Pulsing scale for audio reaction
      const scale = 0.3 + audioValue * 1.5 + Math.sin(scaledTime * 3 + index) * 0.2;
      obj.scale.set(scale, scale, scale);

      // Color and emissive dynamic
      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (index / objects.length + scaledTime * 0.1 + audioValue * 0.3) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.emissive.setHSL(hue, 1, audioValue * 0.5 + 0.2);
        obj.material.opacity = 0.5 + audioValue * 0.4;
      }

      // Random quantum jumps for extra sparkle
      if (Math.random() < 0.005 * audioValue) {
        obj.position.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ));
      }
    }
  });
};
