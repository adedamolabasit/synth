// animations/timeVortex.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateTimeVortex = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[5] / 255;
  const mid = frequencyData[70] / 255;
  const treble = frequencyData[135] / 255;

  // Time vortex camera - spiraling through dimensions
  if (camera) {
    const vortexRadius = 15 + Math.sin(time * 0.03) * 5;
    camera.position.x = Math.sin(time * 0.1) * vortexRadius;
    camera.position.y = Math.sin(time * 0.07) * 6;
    camera.position.z = Math.cos(time * 0.1) * vortexRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "timeVortex") return;

    const timeRings = obj.userData.timeRings as THREE.Mesh[];
    const temporalParticles = obj.userData.temporalParticles as THREE.Points[];
    const realityFragments = obj.userData.realityFragments as THREE.Mesh[];
    const ringSpeeds = obj.userData.ringSpeeds as number[];
    const timeFlows = obj.userData.timeFlows as number[];
    const fragmentDrifts = obj.userData.fragmentDrifts as THREE.Vector3[];

    const temporalIntensity = params.intensity * 0.03;
    const vortexSpeed = params.speed * 0.001;

    // Animate time rings
    timeRings.forEach((ring, index) => {
      const speed = ringSpeeds[index];
      const freqIndex = Math.floor((index / timeRings.length) * frequencyData.length);
      const temporalEnergy = frequencyData[freqIndex] / 255;

      // Ring rotation at different speeds
      ring.rotation.y += speed * (1 + bass * 2);
      
      // Ring scaling and deformation
      const scalePulse = Math.sin(time * 1.5 + index) * 0.2 + 1;
      ring.scale.set(scalePulse, scalePulse, scalePulse);

      // Material time effects
      const material = ring.material as THREE.MeshBasicMaterial;
      const timeHue = (index * 0.15 + time * 0.02) % 1;
      material.color.setHSL(timeHue, 0.9, 0.4 + temporalEnergy * 0.3);
      material.opacity = 0.4 + temporalEnergy * 0.4;

      // Ring elevation changes
      ring.position.y = Math.sin(time * 0.8 + index) * 2;
    });

    // Animate temporal particles
    temporalParticles.forEach((particles, index) => {
      const geometry = particles.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");
      const sizeAttr = geometry.getAttribute("size");
      
      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const sizes = sizeAttr.array as Float32Array;

      let timeFlow = timeFlows[index];
      const ring = timeRings[index];
      const ringRadius = ring.geometry.parameters.radius;

      timeFlow = (timeFlow + vortexSpeed) % 1;
      timeFlows[index] = timeFlow;

      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        
        // Time-based orbital motion
        const timeAngle = time * 2 + particleIndex * 0.1 + timeFlow * Math.PI * 2;
        const currentRadius = ringRadius + Math.sin(time * 1.2 + particleIndex) * 1.5;
        
        positions[i] = Math.cos(timeAngle) * currentRadius;
        positions[i + 2] = Math.sin(timeAngle) * currentRadius;

        // Time dilation height effects
        positions[i + 1] = Math.sin(time * 1.5 + particleIndex) * 4;

        // Temporal color shifts
        const temporalHue = (particleIndex / (positions.length / 3) + time * 0.05) % 1;
        const color = new THREE.Color().setHSL(temporalHue, 0.8, 0.5 + mid * 0.3);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;

        // Time-based size variation
        sizes[particleIndex] = (0.1 + Math.sin(time * 2 + particleIndex) * 0.15) * (1 + treble * 0.5);
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;

      // Particle system follows ring
      particles.position.copy(ring.position);
    });

    // Animate reality fragments
    realityFragments.forEach((fragment, index) => {
      const drift = fragmentDrifts[index];
      const freqIndex = Math.floor((index / realityFragments.length) * frequencyData.length);
      const realityEnergy = frequencyData[freqIndex] / 255;

      // Fragment drift through time
      fragment.position.add(drift.clone().multiplyScalar(1 + bass));

      // Time-based rotation
      fragment.rotation.x += vortexSpeed * (1 + mid);
      fragment.rotation.y += vortexSpeed * (1 + treble);
      fragment.rotation.z += vortexSpeed * (1 + bass) * 0.5;

      // Reality distortion scaling
      const realityPulse = Math.sin(time * 1.8 + index) * 0.3 + 1;
      fragment.scale.setScalar(realityPulse + realityEnergy * 0.4);

      // Temporal material effects
      const material = fragment.material as THREE.MeshBasicMaterial;
      const fragmentHue = (index * 0.03 + time * 0.01) % 1;
      material.color.setHSL(fragmentHue, 0.8, 0.5 + realityEnergy * 0.3);
      material.opacity = 0.5 + realityEnergy * 0.4;
    });

    // Global vortex rotation
    obj.rotation.y += vortexSpeed * bass * 2;
    obj.rotation.x += vortexSpeed * mid;

    // Time anomaly on beat
    if (beatInfo?.isBeat) {
      // Time dilation effect
      timeRings.forEach(ring => {
        ring.scale.set(1.5, 1.5, 1.5);
        setTimeout(() => {
          ring.scale.set(1, 1, 1);
        }, 200);
      });

      // Particle time burst
      temporalParticles.forEach(particles => {
        const material = particles.material as THREE.PointsMaterial;
        material.size = 0.4;
        material.opacity = 1;
        setTimeout(() => {
          material.size = 0.2;
          material.opacity = 0.8;
        }, 150);
      });

      // Reality fragment flash
      realityFragments.forEach(fragment => {
        const material = fragment.material as THREE.MeshBasicMaterial;
        material.color.set(1, 1, 1);
        fragment.scale.setScalar(2);
        
        setTimeout(() => {
          fragment.scale.setScalar(1);
        }, 100);
      });
    }
  });
};