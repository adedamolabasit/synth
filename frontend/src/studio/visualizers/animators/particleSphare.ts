import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateParticleSphere = (
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
    const cameraRadius = 10 - bass * 2;
    camera.position.x = Math.sin(time * 0.2) * cameraRadius;
    camera.position.y = Math.cos(time * 0.15) * 3 + mid * 2;
    camera.position.z = Math.cos(time * 0.2) * cameraRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Points) || obj.userData.type !== "particleSphere")
      return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute("position");
    const colorAttr = geometry.getAttribute("color");

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;
    const phaseOffsets = obj.userData.phaseOffsets as Float32Array;
    const particleCount = obj.userData.particleCount;

    const intensity = params.intensity ?? 1.5;
    const baseHue = obj.userData.baseHue;

    const expansion = 1 + bass * intensity * 0.5;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const dataIndex = Math.floor((i / particleCount) * frequencyData.length);
      const freqValue = frequencyData[dataIndex] / 255;

      const noise =
        Math.sin(time * 2 + phaseOffsets[i]) * 0.3 +
        Math.cos(time * 1.5 + phaseOffsets[i] * 2) * 0.2;

      const particleExpansion = expansion + freqValue * intensity * 0.3 + noise * mid;

      positions[i3] = originalPositions[i3] * particleExpansion;
      positions[i3 + 1] = originalPositions[i3 + 1] * particleExpansion;
      positions[i3 + 2] = originalPositions[i3 + 2] * particleExpansion;

      const hueShift = (baseHue + time * 0.05 + freqValue * 0.3) % 1;
      const saturation = 0.7 + treble * 0.3;
      const lightness = 0.4 + bass * 0.3;
      const c = new THREE.Color().setHSL(hueShift, saturation, lightness);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.003;
    obj.rotation.x += mid * 0.001;

    if (beatInfo?.isBeat) {
      const material = obj.material as THREE.PointsMaterial;
      material.size = 0.12 + beatInfo.strength * 0.08;

      obj.rotation.z += 0.1 * (Math.random() > 0.5 ? 1 : -1);
    } else {
      const material = obj.material as THREE.PointsMaterial;
      material.size = THREE.MathUtils.lerp(material.size, 0.08, 0.1);
    }
  });
};