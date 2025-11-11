import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateGeometric = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj, index) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const dataIndex = Math.floor(
      (index / objects.length) * frequencyData.length
    );
    const frequencyValue = frequencyData[dataIndex] / 255;

    // Scale animation
    const scale = 1 + frequencyValue * params.intensity * 0.1;
    obj.scale.set(scale, scale, scale);

    // Rotation animation
    obj.rotation.x = time * params.speed * 0.01;
    obj.rotation.y = time * params.speed * 0.008;
    obj.rotation.z = time * params.speed * 0.006;

    // Position animation
    if (obj.userData.basePosition) {
      const basePos = obj.userData.basePosition as THREE.Vector3;
      obj.position.x = basePos.x + Math.sin(time * 0.5 + index) * 0.5;
      obj.position.y = basePos.y + Math.cos(time * 0.3 + index) * 0.5;
    }

    // Color animation
    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (time * 0.05 + index * 0.1) % 1;
      obj.material.color.setHSL(hue, 0.8, 0.6);
    }
  });
};