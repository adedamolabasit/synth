import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateKaleidoscope = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      const { segment, layer, radius, rotationOffset } = obj.userData;

      const dataIndex = Math.floor((segment / 8) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      // Spiral rotation
      const spinSpeed = 0.5 + layer * 0.1 + audioValue * 0.5;
      const angle = (segment / 8) * Math.PI * 2 + scaledTime * spinSpeed + rotationOffset;
      const layerRadius = radius + Math.sin(scaledTime * 2 + layer) * 0.3 * audioValue;

      obj.position.x = Math.cos(angle) * layerRadius;
      obj.position.y = Math.sin(angle) * layerRadius;

      // Add 3D wobble
      obj.position.z = (layer - 2) * 0.3 + Math.sin(scaledTime * 3 + segment) * 0.15 * audioValue;

      // Pulsing scale
      const scale = 0.8 + audioValue * 0.8 + Math.sin(scaledTime * 4 + segment) * 0.2;
      obj.scale.set(scale, scale, scale);

      // Dynamic color shift
      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (segment / 8 + layer * 0.1 + scaledTime * 0.05 + audioValue * 0.3) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.emissive.setHSL(hue, 0.5, 0.2 + audioValue * 0.3);
        obj.material.opacity = 0.6 + audioValue * 0.4;
      }

      // Rotate shapes on their own axes for extra psychedelic effect
      obj.rotation.x += 0.01 + audioValue * 0.05;
      obj.rotation.y += 0.01 + audioValue * 0.05;
      obj.rotation.z += 0.01 + audioValue * 0.05;
    }
  });
};
