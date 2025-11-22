import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateWaveform3D = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
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

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Line) || obj.userData.type !== "waveform3D") return;
    if (obj.userData?.isLyrics) return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute("position");
    const colorAttr = geometry.getAttribute("color");

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;
    const phaseOffsets: number[] = obj.userData.phaseOffsets;

    const baseHue = obj.userData.baseHue;
    const colorShiftSpeed = obj.userData.colorShiftSpeed;
    const flow = obj.userData.flowDirection;

    // 🔄 Flip flow direction on beats
    if (beatInfo?.isBeat) obj.userData.flowDirection *= -1;

    const intensityBoost = 1 + params.intensity * 0.02;

    for (let i = 0; i < obj.userData.points; i++) {
      const i3 = i * 3;
      const dataIndex = Math.floor((i / obj.userData.points) * frequencyData.length);
      const freqValue = frequencyData[dataIndex] / 255;

      const waveHeight = freqValue * (params.intensity ?? 2);

      // 3D audio-reactive motion
      positions[i3 + 1] = Math.sin(time * 2 + i * 0.15 + phaseOffsets[i]) * waveHeight * flow;
      positions[i3 + 2] = Math.cos(time * 1.5 + i * 0.2 + phaseOffsets[i]) * waveHeight * 0.8 * flow;
      positions[i3] = originalPositions[i3] + Math.sin(time + i * 0.05) * 0.05;

      // 🎨 Color shifting
      const hueShift = (baseHue + time * colorShiftSpeed + treble * 0.2) % 1;
      const c = new THREE.Color().setHSL(hueShift, 0.8, 0.5 + bass * 0.2);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // 🔥 Continuous rotation
    obj.rotation.y += params.rotationSpeed * 0.002;
    obj.rotation.x += bass * 0.002;

    // 🌌 Orbit effect
    obj.position.x = Math.sin(time * 0.5) * 2;
    obj.position.z = Math.cos(time * 0.5) * 2;

    // 💥 Beat pulse effect
    if (beatInfo?.isBeat) {
      const material = obj.material as THREE.LineBasicMaterial;

      // Quick opacity flash
      material.opacity = 0.6 + Math.random() * 0.4;

      // Temporary height boost
      for (let i = 0; i < obj.userData.points; i++) {
        const i3 = i * 3;
        positions[i3 + 1] *= 1.2; // taller
        positions[i3 + 2] *= 1.2; // deeper
      }

      // Small rotation jitter
      obj.rotation.y += 0.05 * (Math.random() > 0.5 ? 1 : -1);
      obj.rotation.x += 0.03 * (Math.random() > 0.5 ? 1 : -1);

      posAttr.needsUpdate = true;
    }
  });
};
