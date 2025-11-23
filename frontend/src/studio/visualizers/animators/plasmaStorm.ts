// animations/plasmaStorm.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animatePlasmaStorm = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[5] / 255;
  const mid = frequencyData[65] / 255;
  const treble = frequencyData[125] / 255;

  // Storm camera - dynamic orbiting
  if (camera) {
    camera.position.x = Math.sin(time * 0.15) * 20;
    camera.position.y = Math.sin(time * 0.1) * 5;
    camera.position.z = Math.cos(time * 0.15) * 20;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "plasmaStorm") return;

    const plasmaOrbs = obj.userData.plasmaOrbs as THREE.Mesh[];
    const energyArcs = obj.userData.energyArcs as THREE.Line[];
    const orbitalSpeeds = obj.userData.orbitalSpeeds as THREE.Vector3[];
    const chargeLevels = obj.userData.chargeLevels as number[];

    const stormPower = params.intensity * 0.03;
    const turbulence = params.speed * 0.002;

    plasmaOrbs.forEach((orb, index) => {
      const speed = orbitalSpeeds[index];
      let charge = chargeLevels[index];
      const freqIndex = Math.floor((index / plasmaOrbs.length) * frequencyData.length);
      const energy = frequencyData[freqIndex] / 255;

      // Orbital movement with turbulence
      orb.position.x += speed.x * (1 + bass * 2) * turbulence;
      orb.position.y += speed.y * (1 + mid) * turbulence;
      orb.position.z += speed.z * (1 + treble) * turbulence;

      // Gravitational pull toward center
      const distance = orb.position.length();
      if (distance > 0.5) {
        const pullForce = 0.001 * (1 + energy);
        orb.position.multiplyScalar(1 - pullForce / distance);
      }

      // Charge dynamics
      charge = (charge + energy * 0.1) % 1;
      chargeLevels[index] = charge;

      // Plasma color and intensity
      const material = orb.material as THREE.MeshBasicMaterial;
      const hue = (0.5 + charge * 0.3 + time * 0.05) % 1;
      const saturation = 0.8 + treble * 0.2;
      const brightness = 0.5 + energy * 0.3;
      
      material.color.setHSL(hue, saturation, brightness);
      material.opacity = 0.6 + energy * 0.4;

      // Plasma pulsing
      const pulse = Math.sin(time * 3 + index * 0.1) * 0.3 + 0.7;
      orb.scale.setScalar(0.8 + pulse * 0.4 + energy * 0.3);

      // Orbital speed changes based on audio
      speed.multiplyScalar(1 + (energy - 0.5) * 0.1);
    });

    // Animate energy arcs
    energyArcs.forEach((arc, index) => {
      const material = arc.material as THREE.LineBasicMaterial;
      const arcEnergy = Math.sin(time * 2 + index * 0.1) * 0.4 + 0.6;
      material.opacity = 0.2 + bass * 0.3 * arcEnergy;
      
      // Color shifting
      const hue = (0.6 + time * 0.02 + index * 0.01) % 1;
      material.color.setHSL(hue, 0.8, 0.6 + mid * 0.3);
    });

    // Global storm rotation
    obj.rotation.y += turbulence * bass;
    obj.rotation.x += turbulence * mid * 0.5;

    // Lightning strike on beat
    if (beatInfo?.isBeat) {
      // Intensify random orbs
      plasmaOrbs.forEach((orb, index) => {
        if (Math.random() < 0.3) {
          const material = orb.material as THREE.MeshBasicMaterial;
          material.opacity = 1;
          material.color.set(1, 1, 1);
          orb.scale.setScalar(2);
          
          setTimeout(() => {
            material.opacity = 0.7;
          }, 100);
        }
      });

      // Flash energy arcs
      energyArcs.forEach(arc => {
        const material = arc.material as THREE.LineBasicMaterial;
        material.opacity = 0.8;
        setTimeout(() => {
          material.opacity = 0.3;
        }, 150);
      });
    }
  });
};