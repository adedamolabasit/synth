import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateGalaxyNebula = (
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
    const cameraAngle = time * 0.08;
    const cameraRadius = 12 - bass * 3;
    const cameraHeight = 6 + Math.sin(time * 0.15) * 3 + mid * 2;
    camera.position.x = Math.sin(cameraAngle) * cameraRadius;
    camera.position.y = cameraHeight;
    camera.position.z = Math.cos(cameraAngle) * cameraRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Group) || obj.userData.type !== "galaxyNebula")
      return;

    const baseHue = obj.userData.baseHue;
    const intensity = params.intensity ?? 1.5;

    obj.children.forEach((child) => {
      if (child instanceof THREE.Points) {
        const geometry = child.geometry as THREE.BufferGeometry;
        const posAttr = geometry.getAttribute("position");
        const colorAttr = geometry.getAttribute("color");

        const positions = posAttr.array as Float32Array;
        const colors = colorAttr.array as Float32Array;
        const originalPositions = child.userData.originalPositions as Float32Array;
        const armIndices = child.userData.armIndices as Float32Array;
        const radiusData = child.userData.radiusData as Float32Array;
        const phaseOffsets = child.userData.phaseOffsets as number[];
        const particleCount = child.userData.particleCount;
        const arms = child.userData.arms;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const freqIndex = Math.min(Math.floor((i / particleCount) * frequencyData.length * 0.7), frequencyData.length - 1);
          const freqValue = frequencyData[freqIndex] / 255;
          const radius = radiusData[i];
          const armIndex = armIndices[i];

          const rotationSpeed = (0.1 + freqValue * 0.2) / (radius + 0.5);
          const currentAngle = Math.atan2(originalPositions[i3 + 2], originalPositions[i3]) + time * rotationSpeed;

          const expansion = 1 + bass * intensity * 0.3 + freqValue * 0.2;
          const currentRadius = radius * expansion;

          positions[i3] = Math.cos(currentAngle) * currentRadius;
          positions[i3 + 2] = Math.sin(currentAngle) * currentRadius;
          positions[i3 + 1] =
            originalPositions[i3 + 1] +
            Math.sin(time * 2 + phaseOffsets[i]) * (0.2 + mid * 0.5) * freqValue;

          const hueShift = (baseHue + armIndex / arms * 0.3 + time * 0.02 + freqValue * 0.15) % 1;
          const saturation = 0.6 + treble * 0.4;
          const lightness = 0.4 + freqValue * 0.4;
          const c = new THREE.Color().setHSL(hueShift, saturation, lightness);
          colors[i3] = c.r;
          colors[i3 + 1] = c.g;
          colors[i3 + 2] = c.b;
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;

        const material = child.material as THREE.PointsMaterial;
        if (beatInfo?.isBeat) {
          material.size = 0.12 + beatInfo.strength * 0.06;
        } else {
          material.size = THREE.MathUtils.lerp(material.size, 0.08, 0.1);
        }
      }

      if (child instanceof THREE.Mesh && child.userData.isCore) {
        const scale = 1 + bass * 0.5;
        child.scale.setScalar(scale);
        const material = child.material as THREE.MeshBasicMaterial;
        const hue = (baseHue + time * 0.05) % 1;
        material.color.setHSL(hue, 0.8, 0.5 + bass * 0.3);
      }

      if (child instanceof THREE.Mesh && child.userData.isGlow) {
        const scale = 1.5 + mid * 1.5 + (beatInfo?.isBeat ? 0.5 : 0);
        child.scale.setScalar(scale);
        const material = child.material as THREE.MeshBasicMaterial;
        material.opacity = 0.2 + bass * 0.3;
      }
    });

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.001;
  });
};
