import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";
import {
  beatPulse,
  animateCamera,
  rotateScene,
} from "../../effects/gsapAnimations";
import { getAudioBand, colorShift } from "../../effects/audioEffects";

export const animateBiomorphic = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera,
  scene?: THREE.Scene
) => {
  const scaledTime = time * 0.001;

  const bass = getAudioBand(frequencyData, "bass");
  const mid = getAudioBand(frequencyData, "mid");
  const treble = getAudioBand(frequencyData, "treble");

  objects.forEach((obj) => {
    if (obj.userData.isGround) {
      const groundMaterial = (obj as THREE.Mesh).material as THREE.MeshPhongMaterial;
      
      // Dynamic ground color shifting
      const hueShift = (scaledTime * 0.1 + bass * 0.3) % 1;
      groundMaterial.color.setHSL(
        hueShift,
        0.8 + mid * 0.2,
        0.3 + treble * 0.2
      );
      groundMaterial.opacity = 0.7 + bass * 0.3;
      
      // Wave the ground geometry vertices based on audio
      const positions = (obj as THREE.Mesh).geometry.attributes.position.array as Float32Array;
      const originalPositions = obj.userData.originalVertices;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const z = originalPositions[i + 2];
        
        const wave1 = Math.sin(x * 2 + scaledTime * 2) * 0.3 * bass;
        const wave2 = Math.sin(z * 2 + scaledTime * 1.5) * 0.2 * mid;
        const wave3 = Math.sin((x + z) * 3 + scaledTime * 3) * 0.2 * treble;
        
        positions[i + 1] = wave1 + wave2 + wave3;
      }
      
      (obj as THREE.Mesh).geometry.attributes.position.needsUpdate = true;
      
      // Animate floating shapes
      if (obj.userData.floatingShapes) {
        obj.userData.floatingShapes.forEach((shape: THREE.Mesh, index: number) => {
          const userData = shape.userData;
          const floatOffset = Math.sin(scaledTime * userData.floatSpeed + userData.phaseOffset) * userData.floatAmplitude;
          
          shape.position.y = userData.basePosition.y + floatOffset * (1 + bass);
          
          shape.rotation.x += 0.01 * userData.rotationSpeed * (1 + mid);
          shape.rotation.y += 0.015 * userData.rotationSpeed * (1 + bass);
          shape.rotation.z += 0.008 * userData.rotationSpeed * (1 + treble);
          
          // Scale shapes with beat
          if (beatInfo?.isBeat) {
            shape.scale.setScalar(1.5 + bass);
          } else {
            const pulse = 1 + Math.sin(scaledTime * 3 + index) * 0.2 * treble;
            shape.scale.setScalar(pulse);
          }
          
          // Color shift
          const shapeMaterial = shape.material as THREE.MeshPhongMaterial;
          const shapeHue = (scaledTime * 0.05 + index * 0.1 + bass * 0.2) % 1;
          shapeMaterial.color.setHSL(shapeHue, 0.8, 0.6 + treble * 0.2);
        });
      }
      
      // Animate energy orbs
      if (obj.userData.orbs) {
        obj.userData.orbs.forEach((orb: THREE.Mesh) => {
          const userData = orb.userData;
          
          // Pulsing motion
          const pulse = Math.sin(scaledTime * userData.pulseSpeed + userData.phaseOffset) * 0.5 * bass;
          orb.position.y = userData.basePosition.y + pulse;
          
          // Orb color cycling
          const orbMaterial = orb.material as THREE.MeshBasicMaterial;
          const colorHue = (scaledTime * 0.3 + userData.colorPhase) % 1;
          orbMaterial.color.setHSL(colorHue, 0.9, 0.7);
          orbMaterial.opacity = 0.4 + bass * 0.4;
          
          // Scale with audio
          const scale = 1 + bass * 0.8;
          orb.scale.set(scale, scale, scale);
          
          // Rotation
          orb.rotation.x += 0.02 * (1 + mid);
          orb.rotation.y += 0.03 * (1 + bass);
        });
      }
      
      // Animate grid lines
      if (obj.userData.gridLines) {
        obj.userData.gridLines.forEach((line: THREE.Line, index: number) => {
          const lineMaterial = line.material as THREE.LineBasicMaterial;
          
          // Grid lines pulse with different frequencies
          const frequencyIndex = index % 5;
          const freqValue = getAudioBand(frequencyData, frequencyIndex / 5);
          
          lineMaterial.opacity = 0.2 + freqValue * 0.5;
          
          // Color shift
          const lineHue = (scaledTime * 0.2 + index * 0.01) % 1;
          lineMaterial.color.setHSL(lineHue, 0.8, 0.5 + freqValue * 0.3);
          
          // Subtle movement
          const wave = Math.sin(scaledTime * 2 + index * 0.1) * 0.05 * freqValue;
          line.position.y = 0.02 + wave;
        });
      }
      
      return;
    }

    // Original branch animations
    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || child.userData.depth === undefined)
        return;

      const depth = child.userData.depth;
      const pulsePhase = child.userData.pulsePhase;

      const audioValue = getAudioBand(frequencyData, depth / 5);

      const waveX = Math.sin(scaledTime * 2 + depth) * 0.05 * (1 + mid);
      const waveY =
        Math.sin(scaledTime * 1.5 + depth * 1.2 + pulsePhase) *
        0.05 *
        (1 + bass);
      const waveZ =
        Math.cos(scaledTime * 1.7 + depth * 0.8) * 0.05 * (1 + treble);

      child.position.x += waveX;
      child.position.y += waveY;
      child.position.z += waveZ;

      if (beatInfo?.isBeat) {
        beatPulse(child, 1.4 + bass * 0.5);
      }

      child.rotation.x +=
        Math.sin(scaledTime * 1.5 + depth) * 0.02 * audioValue;
      child.rotation.y +=
        Math.cos(scaledTime * 1.3 + depth) * 0.02 * audioValue;
      child.rotation.z +=
        Math.sin(scaledTime * 1.7 + depth) * 0.01 * audioValue;

      if (child.material instanceof THREE.MeshPhongMaterial) {
        const { hue, lightness } = colorShift(
          scaledTime,
          depth,
          audioValue,
          beatInfo
        );
        child.material.color.setHSL(hue, 0.8, lightness);
        child.material.opacity = 0.5 + audioValue * 0.5;
      }
    });
  });

  // Move branches in circular pattern
  objects.forEach((obj, index) => {
    if (obj.userData.isGround) return;
    
    obj.position.x = Math.sin(scaledTime * 0.3 + index) * 0.3;
    obj.position.z = Math.cos(scaledTime * 0.25 + index) * 0.3;
  });

  // Scene lighting and effects
  if (scene) {
    // Dynamic background color
    const hue = (scaledTime * 0.2 + bass * 0.3) % 1;
    const saturation = 0.5 + bass * 0.4;
    const lightness = 0.05 + treble * 0.15;
    scene.background = new THREE.Color().setHSL(hue, saturation, lightness);
    
    // Add floating particles in the scene
    let particles = scene.getObjectByName("sceneParticles") as THREE.Points;
    if (!particles) {
      const particleCount = 100;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        sizes[i] = 0.05 + Math.random() * 0.1;
      }
      
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      });
      
      particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.name = "sceneParticles";
      scene.add(particles);
    }
    
    // Animate particles with audio
    const particlePositions = particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particlePositions.length; i += 3) {
      const wave = Math.sin(scaledTime * 2 + i * 0.01) * 0.2 * bass;
      particlePositions[i + 1] += wave * 0.1;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    const particleMaterial = particles.material as THREE.PointsMaterial;
    particleMaterial.size = 0.05 + treble * 0.1;
    particleMaterial.opacity = 0.3 + bass * 0.4;
    particleMaterial.color.setHSL((scaledTime * 0.1) % 1, 0.7, 0.8);
  }

  if (camera && animateCamera) {
    animateCamera(camera, params);
  }

  if (scene && params.rotationSpeed > 0) {
    rotateScene(scene, params);
  }
};