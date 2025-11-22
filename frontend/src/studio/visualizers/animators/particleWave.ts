// animateParticleWave.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";
import { beatPulse } from "../../effects/gsapAnimations";



export const animateParticleWave = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
) => {
  const bass = frequencyData[2] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;

  // 🎥 Camera reactive movement
  if (camera) {
    camera.position.x = Math.sin(time * 0.3) * (0.5 + bass);
    camera.position.y = Math.sin(time * 0.2) * (0.3 + mid * 0.3);
    camera.position.z = 8 - mid * 2;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach(obj => {
    if (!(obj instanceof THREE.Points)) return;
    if (obj.userData?.isLyrics) return;

    const geometry = obj.geometry;
    const posAttr = geometry.getAttribute("position");
    const colorAttr = geometry.getAttribute("color");

    const positions = posAttr.array;
    const colors = colorAttr.array;
    const original = obj.userData.originalPositions;
    const phases = obj.userData.phases;

    const baseHue = obj.userData.baseHue;
    const colorShiftSpeed = obj.userData.colorShiftSpeed;

    // 🔄 Flip flow direction on beats
    if (beatInfo?.isBeat) {
      obj.userData.flowDirection *= -1;
    }

    const flow = obj.userData.flowDirection;
    const fluid = params.fluidity * 0.02 * (1 + bass * 1.5);
    const intensityBoost = 1 + params.intensity * 0.02;

    // 🎨 Real-time color shifting
    const hueShift = (baseHue + time * colorShiftSpeed + treble * 0.2) % 1;

    for (let i = 0; i < original.length; i += 3) {
      const px = original[i];
      const py = original[i + 1];
      const pz = original[i + 2];
      const phase = phases[i / 3];

      const wave = Math.sin(time * 1.2 + phase) * fluid;

      positions[i] = px + wave * 2.5 * flow;
      positions[i + 1] = py + Math.sin(time * 0.4 + px * 0.1) * bass * 4 * intensityBoost;
      positions[i + 2] = pz + Math.cos(time * 0.7 + phase) * 1.5 * flow;

      // Color update
      const c = new THREE.Color().setHSL(hueShift, 0.9, 0.5 + bass * 0.2);
      const idx = i;
      colors[idx] = c.r;
      colors[idx + 1] = c.g;
      colors[idx + 2] = c.b;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // 🔥 Rotate ONLY the particle wave
    obj.rotation.y += params.rotationSpeed * 0.002;
    obj.rotation.x += bass * 0.003;

    // Beat pulse
    if (beatInfo?.isBeat) beatPulse(obj, 1 + params.intensity * 0.01);
  });
};
