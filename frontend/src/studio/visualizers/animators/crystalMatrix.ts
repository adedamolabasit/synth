import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCrystalMatrix = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[10] / 255;
  const treble = frequencyData[130] / 255;

  if (camera) {
    camera.position.x = Math.sin(time * 0.15) * 20;
    camera.position.z = Math.cos(time * 0.15) * 20;
    camera.position.y = 5 + Math.sin(time * 0.1) * 2;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "crystalMatrix") return;

    const crystals = obj.userData.crystals as THREE.Mesh[];
    const basePositions = obj.userData.basePositions as THREE.Vector3[];
    const oscillationPhases = obj.userData.oscillationPhases as number[];

    crystals.forEach((crystal, index) => {
      const basePos = basePositions[index];
      const phase = oscillationPhases[index];
      const freqIndex = Math.floor((index / crystals.length) * frequencyData.length);
      const energy = frequencyData[freqIndex] / 255;

      const oscillation = Math.sin(time * 2 + phase) * energy * 0.5;
      crystal.position.y = basePos.y + oscillation;
      
      const scale = 1 + energy * 0.5 + bass * 0.3;
      crystal.scale.set(1, scale, 1);

      const material = crystal.material as THREE.MeshPhysicalMaterial;
      const hue = (0.6 + energy * 0.3 + time * 0.05) % 1;
      material.color.setHSL(hue, 0.8, 0.5 + treble * 0.2);

      material.transmission = 0.3 + energy * 0.4;
      material.roughness = Math.max(0.05, 0.2 - energy * 0.15);

      crystal.rotation.y += (params.rotationSpeed * 0.001) * (1 + energy);
      crystal.rotation.x += Math.sin(time + index) * 0.01;
    });

    obj.rotation.y += params.rotationSpeed * 0.0005;

    if (beatInfo?.isBeat) {
      crystals.forEach((crystal) => {
        const material = crystal.material as THREE.MeshPhysicalMaterial;
        material.emissive = new THREE.Color().setHSL(Math.random(), 0.8, 0.3);
        crystal.scale.set(1.2, 1.5, 1.2);
        
        setTimeout(() => {
          material.emissive = new THREE.Color(0, 0, 0);
        }, 100);
      });
    }
  });
};