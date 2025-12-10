import * as THREE from "three";
import { BeatInfo } from "../../types/visualizer";
import { VisualizerParams } from "../../types/visualizer";

export const animateSpiralHelix = (
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
    const cameraAngle = time * 0.15;
    const cameraRadius = 10 - mid * 2;
    camera.position.x = Math.sin(cameraAngle) * cameraRadius;
    camera.position.y = Math.sin(time * 0.1) * 3 + bass * 2;
    camera.position.z = Math.cos(cameraAngle) * cameraRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Group) || obj.userData.type !== "spiralHelix")
      return;

    const helices = obj.userData.helices as THREE.Line[];
    const baseHue = obj.userData.baseHue;
    const intensity = params.intensity ?? 1.5;

    if (beatInfo?.isBeat) {
      obj.userData.twistDirection *= -1;
    }

    const twist = obj.userData.twistDirection;

    helices.forEach((helix) => {
      const geometry = helix.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");

      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const originalPositions = helix.userData.originalPositions as Float32Array;
      const phaseOffsets = helix.userData.phaseOffsets as number[];
      const pointsPerHelix = helix.userData.pointsPerHelix;
      const helixHue = helix.userData.helixHue;

      for (let i = 0; i < pointsPerHelix; i++) {
        const i3 = i * 3;
        const dataIndex = Math.floor(
          (i / pointsPerHelix) * frequencyData.length * 0.7
        );
        const freqValue = frequencyData[dataIndex] / 255;

        const t = (i / pointsPerHelix) * Math.PI * 6;
        const radiusExpansion = 1 + freqValue * intensity * 0.5;
        const yStretch = 1 + bass * 0.3;

        const animatedRadius =
          (2 + Math.sin(t * 0.5 + time * twist) * 0.5) * radiusExpansion;

        positions[i3] =
          Math.cos(t + helix.userData.helixOffset + time * 0.5 * twist) *
          animatedRadius;
        positions[i3 + 1] =
          originalPositions[i3 + 1] * yStretch +
          Math.sin(time * 2 + phaseOffsets[i]) * freqValue * 0.5;
        positions[i3 + 2] =
          Math.sin(t + helix.userData.helixOffset + time * 0.5 * twist) *
          animatedRadius;

        const hueShift = (helixHue + time * 0.03 + freqValue * 0.2) % 1;
        const saturation = 0.7 + mid * 0.3;
        const lightness = 0.4 + treble * 0.3;
        const c = new THREE.Color().setHSL(hueShift, saturation, lightness);
        colors[i3] = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      const material = helix.material as THREE.LineBasicMaterial;
      if (beatInfo?.isBeat) {
        material.opacity = 1;
      } else {
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0.9, 0.1);
      }
    });

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.003;
  });
};
