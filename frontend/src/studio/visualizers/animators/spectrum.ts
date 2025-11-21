import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateSpectrum = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  if (!objects || objects.length === 0) return;

  const group = objects.find(o => o.userData?.isGroup) as THREE.Group | undefined;
  if (!group) return;

  const { barMeshes, projectileContainer, bars, radius } = group.userData;

  const now = time;
  const audioLen = frequencyData.length;

  // Update bars
  for (let i = 0; i < barMeshes.length; i++) {
    const bar = barMeshes[i];
    if (!(bar instanceof THREE.Mesh)) continue;

    const dataIndex = Math.floor((i / bars) * audioLen);
    const freq = (frequencyData[Math.min(audioLen - 1, dataIndex)] ?? 0) / 255;

    // Dynamic radial offset for breathing effect
    const angle = bar.userData.angle;
    const radialOffset = Math.sin(now * 2 + i) * 0.15 * (freq + 0.2);
    bar.position.x = Math.cos(angle) * (radius + radialOffset);
    bar.position.z = Math.sin(angle) * (radius + radialOffset);

    // Bar height scaling with smooth lerp
    const targetY = 1 + freq * 2.5;
    bar.scale.y = THREE.MathUtils.lerp(bar.scale.y ?? 1, targetY, 0.1);
    bar.position.y = (bar.scale.y * bar.userData.baseHeight) / 2;

    // subtle twist / wobble
    const seed = bar.userData.seed ?? 0;
    bar.rotation.x = Math.sin(now * 0.5 + seed) * 0.08;
    bar.rotation.z = Math.cos(now * 0.3 + seed) * 0.05;

    // Color gradient
    if (bar.material instanceof THREE.MeshStandardMaterial) {
      const hue = (now * 0.05 + i / bars + seed % 1) % 1;
      const lightness = 0.4 + Math.min(0.35, (bar.scale.y - 1) * 0.18);
      bar.material.color.setHSL(hue, 0.85, lightness);
      bar.material.emissive.setHSL(hue, 0.9, Math.min(0.5, (bar.scale.y - 1) * 0.8 + 0.2));
    }

    // Tiny sparkle particles on bar tops
    if (freq > 0.7 && Math.random() < 0.05) {
      const sparkle = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, transparent: true, opacity: 0.8 })
      );
      sparkle.position.set(bar.position.x, bar.position.y + bar.scale.y * 0.5, bar.position.z);
      projectileContainer.add(sparkle);
      sparkle.userData = { life: 0, maxLife: 0.5 + Math.random() * 0.5 };
    }
  }

  // Animate projectiles / sparkles
  const projectiles = projectileContainer.children.slice() as THREE.Object3D[];
  for (const p of projectiles) {
    const ud = p.userData;
    if (!ud) continue;

    p.position.y += 0.03;
    ud.life += 0.016;
    p.scale.multiplyScalar(0.96);

    if (ud.life >= (ud.maxLife ?? 1)) {
      projectileContainer.remove(p);
      if (p.geometry) p.geometry.dispose();
      if ((p.material as THREE.Material)?.dispose) (p.material as THREE.Material).dispose();
    }
  }

  // Central glow pulse
  const glow = group.children.find(c => c.name === "centralGlow") as THREE.Mesh;
  if (glow) {
    const pulse = 1 + Math.sin(now * 2) * 0.05 + (beatInfo?.isBeat ? Math.min(0.6, beatInfo.strength) : 0);
    glow.scale.setScalar(pulse * (params.scale ?? 1));
    (glow.material as THREE.MeshBasicMaterial).opacity = 0.08 * (params.glowIntensity ?? 1) * pulse;
  }

  // Rotate group slowly
  group.rotation.y += (params.rotationSpeed ?? 0.002) * (params.speed ?? 1);

  // Optional mirrored effect
  if (params.mirrorEffect) group.scale.y = Math.sin(now * 0.3) * 0.05 + 0.98;
};




// animators/spectrumAdvanced.ts
// import * as THREE from "three";
// import { VisualizerParams, BeatInfo} from "../../types/visualizer";

// export interface AudioFeatures {
//   energy: number;
//   spectralCentroid: number;
//   spectralSpread: number;
//   spectralSlope: number;
//   rms: number;
//   zeroCrossingRate: number;
// }
// export const animateSpectrum = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams,
//   beatInfo?: BeatInfo,
//   audioFeatures?: AudioFeatures
// ): void => {
//   const group = objects[objects.length - 3]; // Main group
//   const energyCore = objects[objects.length - 2] as THREE.Mesh;
//   const particleField = objects[objects.length - 1] as THREE.Points;

//   // Extract frequency ranges
//   const bassRange = frequencyData.slice(0, 10);
//   const midRange = frequencyData.slice(10, 50);
//   const highRange = frequencyData.slice(50, 100);
  
//   const bassAvg = bassRange.reduce((a, b) => a + b, 0) / bassRange.length / 255;
//   const midAvg = midRange.reduce((a, b) => a + b, 0) / midRange.length / 255;
//   const highAvg = highRange.reduce((a, b) => a + b, 0) / highRange.length / 255;

//   // Calculate audio features if not provided
//   const energy = audioFeatures?.energy || bassAvg;
//   const spectralCentroid = audioFeatures?.spectralCentroid || midAvg;

//   // Group rotation with audio reactivity
//   if (group) {
//     const rotationIntensity = params.rotationSpeed * (0.5 + energy * 0.5);
//     group.rotation.y += rotationIntensity * 0.01;
//     group.rotation.x = Math.sin(time * 0.3) * 0.1 * energy;
//   }

//   // Animate bars
//   objects.forEach((obj, index) => {
//     if (!(obj instanceof THREE.Mesh) || !obj.userData.baseHeight) return;

//     const userData = obj.userData;
//     const { baseHeight, phase, speed, audioReactivity } = userData;

//     // Get frequency data based on position and pattern
//     const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
//     const frequencyValue = frequencyData[dataIndex] / 255;
    
//     // Multi-band reactivity
//     const bassInfluence = bassAvg * (1 - index / objects.length);
//     const highInfluence = highAvg * (index / objects.length);
//     const combinedValue = (frequencyValue + bassInfluence + highInfluence) / 3;

//     // Dynamic scaling with multiple influences
//     const scaleIntensity = params.intensity * audioReactivity * params.audioReactivity;
//     const beatBoost = beatInfo?.isBeat ? 1 + beatInfo.beatStrength * 2 : 1;
    
//     const scaleY = 1 + combinedValue * scaleIntensity * beatBoost;
//     const waveMotion = Math.sin(time * speed + phase) * 0.2 * params.fluidity;
    
//     obj.scale.y = scaleY;
//     obj.position.y = (baseHeight * scaleY) / 2 + waveMotion;

//     // Color animation based on multiple factors
//     if (obj.material instanceof THREE.MeshStandardMaterial) {
//       const timeHue = (time * 0.05) % 1;
//       const frequencyHue = (spectralCentroid * 0.5) % 1;
//       const positionHue = (index / objects.length + Math.sin(time * 0.2) * 0.1) % 1;
      
//       // Blend hues based on audio energy
//       const baseHue = (timeHue * 0.3 + frequencyHue * 0.4 + positionHue * 0.3) % 1;
//       const saturation = 0.7 + energy * 0.3;
//       const lightness = 0.5 + combinedValue * 0.3;

//       obj.material.color.setHSL(baseHue, saturation, lightness);
//       obj.material.emissive.setHSL(baseHue, saturation, lightness * 0.3);
      
//       // Dynamic opacity based on motion
//       obj.material.opacity = 0.8 + waveMotion * 0.4;
//     }

//     // Subtle rotation and position drift
//     obj.rotation.x = Math.sin(time * 0.5 + phase) * 0.1 * params.fluidity;
//     obj.rotation.z = Math.cos(time * 0.3 + phase) * 0.05 * params.fluidity;

//     // Morph between patterns occasionally
//     if (Math.random() < params.morphSpeed * 0.01) {
//       userData.phase += (Math.random() - 0.5) * 0.5;
//     }
//   });

//   // Animate energy core
//   if (energyCore) {
//     const coreScale = 1 + energy * params.intensity * 0.5;
//     energyCore.scale.setScalar(coreScale);
//     energyCore.rotation.y = time * 0.5;
//     energyCore.rotation.x = time * 0.3;

//     // Pulsate with beats
//     if (beatInfo?.isBeat) {
//       (energyCore.material as THREE.Material).opacity = 0.4 + beatInfo.beatStrength * 0.3;
//     } else {
//       (energyCore.material as THREE.Material).opacity = 0.2 + energy * 0.1;
//     }
//   }

//   // Animate particle field
//   if (particleField && particleField.userData.particles) {
//     const positions = particleField.geometry.attributes.position.array as Float32Array;
//     const originalPositions = particleField.userData.originalPositions as Float32Array;

//     for (let i = 0; i < positions.length; i += 3) {
//       const particleIndex = i / 3;
//       const phase = (particleIndex / (positions.length / 3)) * Math.PI * 2;
      
//       // Audio-reactive particle motion
//       const bassMotion = bassAvg * Math.sin(time * 2 + phase) * 0.5;
//       const highMotion = highAvg * Math.cos(time * 3 + phase) * 0.3;
      
//       positions[i] = originalPositions[i] + bassMotion + Math.sin(time + phase) * 0.2;
//       positions[i + 1] = originalPositions[i + 1] + (bassMotion + highMotion) * 0.7;
//       positions[i + 2] = originalPositions[i + 2] + highMotion + Math.cos(time + phase) * 0.2;
//     }

//     particleField.geometry.attributes.position.needsUpdate = true;
//   }
// };

// // Audio feature extractor
// export const extractAudioFeatures = (
//   frequencyData: Uint8Array,
//   timeDomainData?: Uint8Array
// ): AudioFeatures => {
//   const data = Array.from(frequencyData).map(v => v / 255);
  
//   // Energy (RMS)
//   const energy = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
  
//   // Spectral Centroid (brightness)
//   const spectralCentroid = data.reduce((sum, val, i) => sum + val * i, 0) / 
//                           data.reduce((sum, val) => sum + val, 0) / data.length;
  
//   // Spectral Spread
//   const spectralSpread = Math.sqrt(
//     data.reduce((sum, val, i) => {
//       const diff = i - spectralCentroid * data.length;
//       return sum + val * diff * diff;
//     }, 0) / data.reduce((sum, val) => sum + val, 0)
//   ) / data.length;

//   return {
//     energy,
//     spectralCentroid,
//     spectralSpread,
//     spectralSlope: 0, // Would require more complex calculation
//     rms: energy,
//     zeroCrossingRate: 0
//   };
// };