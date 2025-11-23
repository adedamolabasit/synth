// animations/orbitalRings.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateOrbitalRings = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[12] / 255;
  const mid = frequencyData[72] / 255;
  const treble = frequencyData[132] / 255;

  // Orbital camera - dynamic orbiting
  if (camera) {
    camera.position.x = Math.sin(time * 0.08) * 25;
    camera.position.y = Math.sin(time * 0.12) * 8;
    camera.position.z = Math.cos(time * 0.08) * 25;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "orbitalRings") return;

    const rings = obj.userData.rings as THREE.Mesh[];
    const orbitingParticles = obj.userData.orbitingParticles as THREE.Points[];
    const ringSpeeds = obj.userData.ringSpeeds as number[];
    const particleOffsets = obj.userData.particleOffsets as number[];
    const energyLevels = obj.userData.energyLevels as number[];

    const orbitalSpeed = params.rotationSpeed * 0.001;
    const ringIntensity = params.intensity * 0.02;

    rings.forEach((ring, index) => {
      const speed = ringSpeeds[index];
      let energy = energyLevels[index];
      const freqIndex = Math.floor((index / rings.length) * frequencyData.length);
      const signal = frequencyData[freqIndex] / 255;

      // Ring rotation
      ring.rotation.z += speed * (1 + bass * 2);
      ring.rotation.x += Math.sin(time * 0.5 + index) * 0.01;

      // Energy dynamics
      energy = (energy + signal * 0.1) % 1;
      energyLevels[index] = energy;

      // Ring appearance
      const material = ring.material as THREE.MeshBasicMaterial;
      const hue = (0.6 + index * 0.05 + time * 0.02 + energy * 0.2) % 1;
      material.color.setHSL(hue, 0.8, 0.4 + signal * 0.3);
      material.opacity = 0.3 + signal * 0.3;

      // Ring scaling
      const scale = 1 + Math.sin(time * 1.5 + index) * 0.1 + bass * 0.2;
      ring.scale.set(scale, scale, scale);
    });

    // Animate orbiting particles
    orbitingParticles.forEach((particles, index) => {
      const geometry = particles.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");
      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const offset = particleOffsets[index];

      const ring = rings[index];
      const radius = ring.geometry.parameters.innerRadius + 0.1;

      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        const angle = (particleIndex / (positions.length / 3)) * Math.PI * 2 + time * 2 + offset;
        
        // Orbital motion
        positions[i] = Math.cos(angle) * radius;
        positions[i + 2] = Math.sin(angle) * radius;

        // Vertical oscillation
        positions[i + 1] = Math.sin(time * 3 + particleIndex) * 1.5;

        // Color based on position and audio
        const hue = (0.6 + index * 0.05 + angle * 0.1) % 1;
        const color = new THREE.Color().setHSL(hue, 0.9, 0.5 + mid * 0.3);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Particle system rotation
      particles.rotation.z += orbitalSpeed * (1 + treble);
    });

    // Global orbital system rotation
    obj.rotation.y += orbitalSpeed * bass;
    obj.rotation.x += orbitalSpeed * mid * 0.5;

    // Orbital resonance on beat
    if (beatInfo?.isBeat) {
      rings.forEach((ring, index) => {
        const material = ring.material as THREE.MeshBasicMaterial;
        material.opacity = 0.8;
        ring.scale.setScalar(1.3);
        
        setTimeout(() => {
          material.opacity = 0.4;
          ring.scale.setScalar(1);
        }, 150);
      });

      // Particle burst
      orbitingParticles.forEach(particles => {
        const material = particles.material as THREE.PointsMaterial;
        material.size = 0.5;
        setTimeout(() => {
          material.size = 0.3;
        }, 100);
      });
    }
  });
};