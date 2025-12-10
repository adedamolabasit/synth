import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateKaleidoscope2 = (
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
    const cameraHeight = 8 + Math.sin(time * 0.15) * 3 + bass * 2;
    const cameraRadius = 2 + mid * 2;
    camera.position.x = Math.sin(time * 0.1) * cameraRadius;
    camera.position.y = cameraHeight;
    camera.position.z = Math.cos(time * 0.1) * cameraRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Group) || obj.userData.type !== "kaleidoscope")
      return;

    const baseHue = obj.userData.baseHue;
    const intensity = params.intensity ?? 1.5;
    const segments = obj.userData.segments;

    if (beatInfo?.isBeat) {
      obj.userData.morphPhase += 0.5;
    }

    obj.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.layer !== undefined) {
        const { layer, shapeIndex, baseAngle, baseRadius, shapeHue, phaseOffset, rotationSpeed } = child.userData;

        const freqIndex = Math.min(Math.floor(((layer * 8 + shapeIndex) / 40) * frequencyData.length * 0.6), frequencyData.length - 1);
        const freqValue = frequencyData[freqIndex] / 255;

        const radiusExpansion = 1 + freqValue * intensity * 0.4;
        const angleOffset = Math.sin(time * 0.5 + phaseOffset) * 0.1 * mid;
        const currentAngle = baseAngle + time * 0.2 * (layer % 2 === 0 ? 1 : -1) + angleOffset;
        const currentRadius = baseRadius * radiusExpansion;

        child.position.x = Math.cos(currentAngle) * currentRadius;
        child.position.z = Math.sin(currentAngle) * currentRadius;
        child.position.y = Math.sin(time * 2 + phaseOffset) * (0.3 + bass * 1);

        const scale = 0.8 + freqValue * intensity * 0.5;
        child.scale.setScalar(scale);

        child.rotation.x += rotationSpeed * 0.02 * (1 + freqValue);
        child.rotation.y += rotationSpeed * 0.015;
        child.rotation.z += rotationSpeed * 0.01 * mid;

        const material = child.material as THREE.MeshStandardMaterial;
        const hueShift = (shapeHue + time * 0.02 + freqValue * 0.2) % 1;
        const saturation = 0.7 + treble * 0.3;
        const lightness = 0.35 + freqValue * 0.35;
        material.color.setHSL(hueShift, saturation, lightness);
        material.emissive.setHSL(hueShift, 0.5, freqValue * 0.15);

        if (beatInfo?.isBeat) {
          material.opacity = 1;
        } else {
          material.opacity = THREE.MathUtils.lerp(material.opacity, 0.85, 0.1);
        }
      }

      if (child instanceof THREE.Line && child.userData.isConnector) {
        const material = child.material as THREE.LineBasicMaterial;
        const hue = (baseHue + child.userData.segmentIndex / segments + time * 0.01) % 1;
        material.color.setHSL(hue, 0.6 + mid * 0.4, 0.4 + bass * 0.2);
        material.opacity = 0.2 + mid * 0.3;
      }
    });

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.002;
  });
};
