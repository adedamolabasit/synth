// animations/morphingCrystals.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateMorphingCrystals = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[8] / 255;
  const mid = frequencyData[68] / 255;
  const treble = frequencyData[128] / 255;

  // Crystal chamber camera
  if (camera) {
    camera.position.x = Math.sin(time * 0.12) * 18;
    camera.position.y = Math.sin(time * 0.08) * 6;
    camera.position.z = Math.cos(time * 0.12) * 18;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "morphingCrystals") return;

    const crystals = obj.userData.crystals as THREE.Mesh[];
    const morphProgress = obj.userData.morphProgress as number[];
    const rotationSpeeds = obj.userData.rotationSpeeds as THREE.Vector3[];
    const targetGeometries = obj.userData.targetGeometries as (() => THREE.BufferGeometry)[];

    const morphSpeed = params.morphSpeed * 0.002;
    const crystalIntensity = params.intensity * 0.025;

    crystals.forEach((crystal, index) => {
      let progress = morphProgress[index];
      const rotationSpeed = rotationSpeeds[index];
      const freqIndex = Math.floor((index / crystals.length) * frequencyData.length);
      const energy = frequencyData[freqIndex] / 255;

      // Morph progression
      progress = (progress + morphSpeed * (1 + energy)) % 1;
      morphProgress[index] = progress;

      // Trigger morph when progress completes
      if (progress < 0.01) {
        obj.userData.targetGeometries[index] = obj.userData.baseGeometries[
          Math.floor(Math.random() * obj.userData.baseGeometries.length)
        ];
      }

      // Crystal rotation
      crystal.rotation.x += rotationSpeed.x * (1 + bass);
      crystal.rotation.y += rotationSpeed.y * (1 + mid);
      crystal.rotation.z += rotationSpeed.z * (1 + treble);

      // Pulsing scale based on audio
      const pulse = Math.sin(time * 2 + index * 0.2) * 0.2 + 0.8;
      const scale = pulse * (1 + energy * 0.5);
      crystal.scale.set(scale, scale, scale);

      // Dynamic material properties
      const material = crystal.material as THREE.MeshPhysicalMaterial;
      const hue = (0.4 + progress * 0.3 + time * 0.01) % 1;
      material.color.setHSL(hue, 0.7 + treble * 0.3, 0.4 + energy * 0.3);
      material.transmission = 0.2 + energy * 0.3;
      material.roughness = Math.max(0.05, 0.2 - energy * 0.15);

      // Position oscillation
      crystal.position.y += Math.sin(time * 1.5 + index) * 0.02 * bass;
    });

    // Global crystal field rotation
    obj.rotation.y += morphSpeed * bass * 0.5;
    obj.rotation.x += Math.sin(time * 0.1) * 0.005;

    // Crystal transformation burst on beat
    if (beatInfo?.isBeat) {
      crystals.forEach((crystal, index) => {
        if (Math.random() < 0.4) {
          // Instant morph
          morphProgress[index] = 0;
          
          // Flash effect
          const material = crystal.material as THREE.MeshPhysicalMaterial;
          material.emissive = new THREE.Color().setHSL(Math.random(), 0.8, 0.3);
          crystal.scale.setScalar(1.5);
          
          setTimeout(() => {
            material.emissive = new THREE.Color(0, 0, 0);
          }, 200);
        }
      });
    }
  });
};