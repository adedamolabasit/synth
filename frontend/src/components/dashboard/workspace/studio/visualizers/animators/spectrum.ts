import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSpectrum = (
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
    const scaleY = 1 + frequencyValue * params.intensity * 0.1;

    obj.scale.y = scaleY;
    obj.position.y = scaleY / 2;

    // Color animation
    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (time * 0.1 + index * 0.01) % 1;
      obj.material.color.setHSL(hue, 0.9, 0.6);
    }
  });
};