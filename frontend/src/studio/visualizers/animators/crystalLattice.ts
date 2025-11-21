import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCrystalLattice = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj, index) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const { basePosition, angle, radius, layer, floatSpeed, rotationSpeed, phase } = obj.userData;
    const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
    const audioValue = frequencyData[dataIndex] / 255;

    // Twisting vortex effect
    const twist = scaledTime * 0.2 + layer * 0.1;
    obj.position.x = Math.cos(angle + twist) * radius;
    obj.position.z = Math.sin(angle + twist) * radius;

    // Floating effect
    obj.position.y = basePosition.y + Math.sin(scaledTime * floatSpeed + phase) * 0.5 * audioValue;

    // Rotate crystals
    obj.rotation.x += 0.01 * rotationSpeed + audioValue * 0.02;
    obj.rotation.y += 0.01 * rotationSpeed + audioValue * 0.02;

    // Pulsating scale
    const scale = 0.5 + audioValue * 1.2;
    obj.scale.set(scale, scale, scale);

    // Color shimmer
    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (layer / 8 + scaledTime * 0.05 + audioValue * 0.2) % 1;
      obj.material.color.setHSL(hue, 0.8, 0.5 + audioValue * 0.3);
      obj.material.emissive.setHSL(hue, 0.7, audioValue * 0.5);
      obj.material.opacity = 0.5 + audioValue * 0.5;
    }
  });
};
