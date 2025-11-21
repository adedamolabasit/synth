import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSolarFlare = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    if (obj.userData.isSun) {
      const avgAudio = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
      const scale = 1 + avgAudio * 0.5;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 0.8 + avgAudio * 0.7;
        obj.material.color.setHSL(0.08 + avgAudio * 0.05, 1, 0.5 + avgAudio * 0.2);
      }

      obj.rotation.y += 0.005 + avgAudio * 0.01;
    } else {
      const { angle, radius, speed, twist, index } = obj.userData;
      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      // Spiral / orbit motion
      const orbit = angle + scaledTime * speed + audioValue * 2;
      obj.position.set(
        Math.cos(orbit) * (radius + audioValue * 1.5),
        Math.sin(orbit) * (radius + audioValue * 1.5),
        twist * audioValue
      );

      // Flare scale / pulsation
      const scaleFactor = 0.5 + 0.5 * audioValue;
      obj.scale.set(scaleFactor, 1 + audioValue * 3, scaleFactor);

      // Color shift along flare
      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (0.05 + index / objects.length + scaledTime * 0.1 + audioValue * 0.2) % 1;
        obj.material.color.setHSL(hue, 1, 0.5 + audioValue * 0.3);
        obj.material.emissiveIntensity = 0.5 + audioValue;
        obj.material.opacity = 0.5 + audioValue * 0.5;
      }

      // Subtle rotation along axis
      obj.rotation.z += 0.01 * twist;
      obj.rotation.x += 0.005 * twist;
    }
  });
};
