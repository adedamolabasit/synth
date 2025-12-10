import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animatecrys = (
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
    const cameraAngle = time * 0.12;
    const cameraRadius = 10 - bass * 2;
    const cameraHeight = 4 + Math.sin(time * 0.2) * 2 + mid * 2;
    camera.position.x = Math.sin(cameraAngle) * cameraRadius;
    camera.position.y = cameraHeight;
    camera.position.z = Math.cos(cameraAngle) * cameraRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (
      !(obj instanceof THREE.Group) ||
      obj.userData.type !== "crystalFormation"
    )
      return;

    const crystals = obj.userData.crystals as THREE.Mesh[];
    const baseHue = obj.userData.baseHue;
    const intensity = params.intensity ?? 1.5;

    if (beatInfo?.isBeat) {
      obj.userData.shatterPhase = 1;
    } else {
      obj.userData.shatterPhase *= 0.92;
    }

    const shatter = obj.userData.shatterPhase;

    crystals.forEach((crystal) => {
      const {
        crystalIndex,
        basePosition,
        baseRotation,
        crystalHue,
        phaseOffset,
        orbitRadius,
        orbitAngle,
        floatSpeed,
      } = crystal.userData;

      const freqIndex = Math.floor(
        (crystalIndex / crystals.length) * frequencyData.length * 0.6
      );
      const freqValue = frequencyData[freqIndex] / 255;

      const animatedAngle = orbitAngle + time * 0.3;
      const radiusExpansion = 1 + freqValue * intensity * 0.5 + shatter * 0.8;
      const currentRadius = orbitRadius * radiusExpansion;

      crystal.position.x = Math.cos(animatedAngle) * currentRadius;
      crystal.position.z = Math.sin(animatedAngle) * currentRadius;
      crystal.position.y =
        basePosition.y +
        Math.sin(time * floatSpeed + phaseOffset) * (0.5 + bass * 1.5) +
        shatter * (Math.random() - 0.5) * 2;

      const scaleBase = 0.8 + freqValue * intensity * 0.6;
      const scalePulse = 1 + shatter * 0.3;
      crystal.scale.setScalar(scaleBase * scalePulse);

      crystal.rotation.x =
        baseRotation.x + time * 0.5 + freqValue * Math.PI * 0.5;
      crystal.rotation.y = baseRotation.y + time * 0.3 + mid * Math.PI * 0.3;
      crystal.rotation.z = baseRotation.z + time * 0.2;

      if (shatter > 0.1) {
        crystal.rotation.x += shatter * (Math.random() - 0.5) * 0.5;
        crystal.rotation.y += shatter * (Math.random() - 0.5) * 0.5;
      }

      const material = crystal.material as THREE.MeshStandardMaterial;
      const hueShift = (crystalHue + time * 0.02 + freqValue * 0.15) % 1;
      const saturation = 0.6 + treble * 0.4;
      const lightness = 0.4 + bass * 0.3;
      material.color.setHSL(hueShift, saturation, lightness);
      material.emissive.setHSL(hueShift, 0.5, freqValue * 0.15 + shatter * 0.1);
      material.opacity = 0.75 + freqValue * 0.2 + shatter * 0.1;
    });

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.002;
  });
};