import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateAuroraWaves = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const scaledTime = time * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.PlaneGeometry) {
      const waveIndex = obj.userData.waveIndex || 0;
      const positions = obj.geometry.attributes.position.array as Float32Array;
      const resolution = obj.userData.resolution || 50;

      for (let i = 0; i < positions.length / 3; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        
        const dataIndex = Math.floor((i / (positions.length / 3)) * frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;

        positions[i3 + 2] = 
          Math.sin(x * 0.5 + scaledTime * 2 + waveIndex) * audioValue * 2 +
          Math.cos(y * 0.5 + scaledTime * 1.5 + waveIndex) * audioValue * 1.5;
      }

      obj.geometry.attributes.position.needsUpdate = true;
      obj.geometry.computeVertexNormals();

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hue = (0.5 + waveIndex * 0.1 + scaledTime * 0.05) % 1;
        obj.material.color.setHSL(hue, 1, 0.5);
      }
    }
  });
};
