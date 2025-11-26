import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateHolographicGrid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[15] / 255;
  const mid = frequencyData[75] / 255;
  const treble = frequencyData[135] / 255;

  if (camera) {
    camera.position.x = Math.sin(time * 0.1) * 25;
    camera.position.y = Math.sin(time * 0.05) * 8;
    camera.position.z = Math.cos(time * 0.1) * 25;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "holographicGrid") return;

    const gridPoints = obj.userData.gridPoints as THREE.Mesh[];
    const gridLines = obj.userData.gridLines as THREE.Line[];
    const baseHeights = obj.userData.baseHeights as number[];
    const dataFlows = obj.userData.dataFlows as number[];

    const dataSpeed = params.speed * 0.001;

    obj.userData.scanPosition = (obj.userData.scanPosition + dataSpeed) % 1;

    gridPoints.forEach((point, index) => {
      const baseHeight = baseHeights[index];
      let dataFlow = dataFlows[index];
      const freqIndex = Math.floor(
        (index / gridPoints.length) * frequencyData.length
      );
      const signal = frequencyData[freqIndex] / 255;

      dataFlow = (dataFlow + dataSpeed * signal) % 1;
      dataFlows[index] = dataFlow;

      const heightWave = Math.sin(time * 2 + index * 0.1) * signal * 3;
      const scanWave =
        Math.sin(
          (point.position.x / 30 + obj.userData.scanPosition) * Math.PI * 2
        ) * 2;

      point.position.y = baseHeight + heightWave + scanWave * bass;

      const material = point.material as THREE.MeshBasicMaterial;
      const hue = (0.7 + dataFlow * 0.3 + time * 0.02) % 1;
      material.color.setHSL(hue, 0.9, 0.5 + signal * 0.3);
      material.opacity = 0.5 + signal * 0.5;

      const scale = 0.8 + signal * 0.4 + bass * 0.3;
      point.scale.set(scale, scale, scale);

      if (dataFlow < 0.1) {
        point.scale.setScalar(1.5);
        material.opacity = 1;
      }
    });

    gridLines.forEach((line, index) => {
      const material = line.material as THREE.LineBasicMaterial;
      const lineEnergy = Math.sin(time * 1.5 + index * 0.05) * 0.3 + 0.7;
      material.opacity = 0.1 + mid * 0.3 * lineEnergy;

      const hue = (0.6 + time * 0.01 + index * 0.002) % 1;
      material.color.setHSL(hue, 0.8, 0.5 + treble * 0.2);
    });

    obj.rotation.y += dataSpeed * bass;
    obj.position.y = Math.sin(time * 0.2) * 1;

    if (beatInfo?.isBeat) {
      gridPoints.forEach((point, index) => {
        setTimeout(() => {
          const material = point.material as THREE.MeshBasicMaterial;
          material.color.set(1, 1, 1);
          point.scale.setScalar(2);

          setTimeout(() => {
            point.scale.setScalar(1);
          }, 100);
        }, (index % 10) * 20);
      });

      gridLines.forEach((line) => {
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.8;
        setTimeout(() => {
          material.opacity = 0.2;
        }, 200);
      });
    }
  });
};
