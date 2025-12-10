import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animatePulsingRings = (
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

  if (camera) {
    const cameraHeight = 8 + Math.sin(time * 0.2) * 2;
    const cameraRadius = 10 - bass * 2;
    camera.position.x = Math.sin(time * 0.15) * cameraRadius * 0.5;
    camera.position.y = cameraHeight;
    camera.position.z = Math.cos(time * 0.15) * cameraRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Group) || obj.userData.type !== "pulsingRings")
      return;

    const rings = obj.userData.rings as THREE.Line[];
    const baseHue = obj.userData.baseHue;
    const intensity = params.intensity ?? 2;

    if (beatInfo?.isBeat) {
      obj.userData.pulsePhase += 0.5;
    }

    rings.forEach((ring) => {
      const geometry = ring.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");

      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const { ringIndex, baseRadius, segmentsPerRing, ringHue, pulseOffset } =
        ring.userData;

      const freqBand = Math.floor(
        (ringIndex / rings.length) * frequencyData.length * 0.5
      );
      const freqValue = frequencyData[freqBand] / 255;

      const pulse = Math.sin(time * 3 + pulseOffset + obj.userData.pulsePhase);
      const radiusScale = 1 + freqValue * intensity * 0.3 + pulse * 0.1 * mid;

      const verticalWave =
        Math.sin(time * 2 + ringIndex * 0.5) * (0.5 + bass * 1.5);
      ring.position.y = verticalWave;

      for (let i = 0; i <= segmentsPerRing; i++) {
        const angle = (i / segmentsPerRing) * Math.PI * 2;
        const i3 = i * 3;

        const segmentFreqIndex = Math.floor(
          (i / segmentsPerRing) * frequencyData.length * 0.3
        );
        const segmentFreq = frequencyData[segmentFreqIndex] / 255;

        const wobble =
          Math.sin(angle * 4 + time * 3) * segmentFreq * 0.2 * intensity;
        const currentRadius = baseRadius * radiusScale + wobble;

        positions[i3] = Math.cos(angle) * currentRadius;
        positions[i3 + 2] = Math.sin(angle) * currentRadius;

        const hueShift = (ringHue + time * 0.02 + segmentFreq * 0.1) % 1;
        const saturation = 0.7 + treble * 0.3;
        const lightness = 0.4 + freqValue * 0.3;
        const c = new THREE.Color().setHSL(hueShift, saturation, lightness);
        colors[i3] = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      ring.rotation.x = Math.sin(time * 0.5 + ringIndex * 0.2) * 0.3;
      ring.rotation.z = Math.cos(time * 0.3 + ringIndex * 0.3) * 0.2;

      const material = ring.material as THREE.LineBasicMaterial;
      if (beatInfo?.isBeat) {
        material.opacity = 1;
      } else {
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0.85, 0.1);
      }
    });

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.002;
  });
};
