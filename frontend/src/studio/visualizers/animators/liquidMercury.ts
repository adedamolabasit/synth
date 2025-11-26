import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateLiquidMercury = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[0] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[100] / 255;

  if (camera) {
    camera.position.x = Math.sin(time * 0.08) * 12;
    camera.position.y = Math.sin(time * 0.05) * 3 + 2;
    camera.position.z = Math.cos(time * 0.08) * 12;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "liquidMercury") return;

    const droplets = obj.userData.droplets as THREE.Mesh[];
    const basePositions = obj.userData.basePositions as THREE.Vector3[];
    const surfaceTensions = obj.userData.surfaceTensions as number[];
    const flowDirections = obj.userData.flowDirections as THREE.Vector3[];

    const fluidity = params.fluidity * 0.02;

    droplets.forEach((droplet, index) => {
      const basePos = basePositions[index];
      const surfaceTension = surfaceTensions[index];
      const flowDir = flowDirections[index];
      const freqIndex = Math.floor(
        (index / droplets.length) * frequencyData.length
      );
      const energy = frequencyData[freqIndex] / 255;

      const flowX = Math.sin(time * 1.5 + index * 0.1) * fluidity;
      const flowY = Math.cos(time * 1.2 + index * 0.15) * fluidity * 0.5;
      const flowZ = Math.sin(time * 0.8 + index * 0.12) * fluidity;

      droplet.position.x = basePos.x + flowX * flowDir.x * (1 + bass);
      droplet.position.y = basePos.y + flowY * flowDir.y * (1 + mid);
      droplet.position.z = basePos.z + flowZ * flowDir.z * (1 + treble);

      const tensionOscillation =
        Math.sin(time * 2 + index) * surfaceTension * 0.1;
      droplet.scale.setScalar(1 + tensionOscillation + energy * 0.3);

      const material = droplet.material as THREE.MeshPhysicalMaterial;
      const metallicShift = 0.7 + treble * 0.2;
      material.metalness = metallicShift;
      material.roughness = Math.max(0.05, 0.2 - energy * 0.15);

      const hue = 0.55 + energy * 0.1;
      material.color.setHSL(hue, 0.3 + bass * 0.2, 0.6 + mid * 0.2);

      if (beatInfo?.isBeat && Math.random() < 0.1) {
        droplet.scale.setScalar(droplet.scale.x * 1.3);
        material.opacity = 1;
      }
    });

    obj.rotation.y += params.rotationSpeed * 0.0003;
    obj.rotation.x += Math.sin(time * 0.1) * 0.005;

    if (beatInfo?.isBeat) {
      droplets.forEach((droplet, index) => {
        const delay = (index % 5) * 50;
        setTimeout(() => {
          const material = droplet.material as THREE.MeshPhysicalMaterial;
          material.emissive = new THREE.Color(0.2, 0.3, 0.4);
          droplet.scale.setScalar(droplet.scale.x * 1.2);

          setTimeout(() => {
            material.emissive = new THREE.Color(0, 0, 0);
          }, 200);
        }, delay);
      });
    }
  });
};
