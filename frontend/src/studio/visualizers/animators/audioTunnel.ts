import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateAudioTunnel = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[Math.min(2, frequencyData.length - 1)] / 255;
  const mid = frequencyData[Math.min(50, frequencyData.length - 1)] / 255;
  const treble = frequencyData[Math.min(120, frequencyData.length - 1)] / 255;

  if (camera) {
    const wobbleX = Math.sin(time * 0.5) * 0.3 * mid;
    const wobbleY = Math.cos(time * 0.4) * 0.3 * mid;
    camera.position.x = wobbleX;
    camera.position.y = wobbleY;
    camera.position.z = 5 - bass * 2;
    camera.lookAt(0, 0, -20);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Group) || obj.userData.type !== "audioTunnel")
      return;

    const rings = obj.userData.rings as THREE.Line[];
    const baseHue = obj.userData.baseHue;
    const intensity = params.intensity ?? 2;

    obj.userData.travelOffset += 0.02 + bass * 0.05;
    const travelOffset = obj.userData.travelOffset;

    rings.forEach((ring) => {
      const geometry = ring.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");

      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const { ringIndex, baseRadius, segmentsPerRing, ringHue, originalZ } = ring.userData;

      const zOffset = ((originalZ + travelOffset) % 32) - 2;
      const distanceFactor = Math.max(0, 1 - Math.abs(zOffset) / 32);

      const freqIndex = Math.min(Math.floor((ringIndex / rings.length) * frequencyData.length * 0.6), frequencyData.length - 1);
      const freqValue = frequencyData[freqIndex] / 255;

      for (let i = 0; i <= segmentsPerRing; i++) {
        const angle = (i / segmentsPerRing) * Math.PI * 2;
        const i3 = i * 3;

        const segmentFreqIndex = Math.min(Math.floor((i / segmentsPerRing) * frequencyData.length * 0.4), frequencyData.length - 1);
        const segmentFreq = frequencyData[segmentFreqIndex] / 255;

        const radiusMod = 1 + segmentFreq * intensity * 0.4 + Math.sin(angle * 4 + time * 3) * 0.1 * mid;
        const currentRadius = baseRadius * radiusMod;

        positions[i3] = Math.cos(angle) * currentRadius;
        positions[i3 + 1] = Math.sin(angle) * currentRadius;
        positions[i3 + 2] = zOffset;

        const hueShift = (ringHue + time * 0.03 + segmentFreq * 0.2) % 1;
        const saturation = 0.7 + treble * 0.3;
        const lightness = 0.3 + freqValue * 0.4 + distanceFactor * 0.2;
        const c = new THREE.Color().setHSL(hueShift, saturation, lightness);
        colors[i3] = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      const material = ring.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + distanceFactor * 0.4;

      if (beatInfo?.isBeat) {
        material.opacity = Math.min(1, material.opacity + 0.3);
      }
    });

    obj.children.forEach((child) => {
      if (child instanceof THREE.Line && child.userData.isSpine) {
        const geometry = child.geometry as THREE.BufferGeometry;
        const posAttr = geometry.getAttribute("position");
        const positions = posAttr.array as Float32Array;
        const spineAngle = child.userData.spineAngle;

        for (let r = 0; r < rings.length; r++) {
          const zOffset = ((-(r * 0.8) + travelOffset) % 32) - 2;
          const freqValue = frequencyData[Math.min(Math.floor((r / rings.length) * frequencyData.length * 0.5), frequencyData.length - 1)] / 255;
          const radius = (2 + Math.sin(r * 0.2) * 0.5) * (1 + freqValue * intensity * 0.3);

          const r3 = r * 3;
          positions[r3] = Math.cos(spineAngle + time * 0.2) * radius;
          positions[r3 + 1] = Math.sin(spineAngle + time * 0.2) * radius;
          positions[r3 + 2] = zOffset;
        }

        posAttr.needsUpdate = true;
      }
    });

    obj.rotation.z += (params.rotationSpeed ?? 1) * 0.003 + bass * 0.002;
  });
};