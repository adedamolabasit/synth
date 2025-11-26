import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";
import {
  beatPulse,
  animateCamera,
  rotateScene,
} from "../../effects/gsapAnimations";
import { getAudioBand, colorShift } from "../../effects/audioEffects";

export const animateBiomorphic = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera,
  scene?: THREE.Scene
) => {
  const scaledTime = time * 0.001;

  const bass = getAudioBand(frequencyData, "bass");
  const mid = getAudioBand(frequencyData, "mid");
  const treble = getAudioBand(frequencyData, "treble");

  if (camera && animateCamera) {
    animateCamera(camera, params);
  }

  if (scene && params.rotationSpeed > 0) {
    rotateScene(scene, params);
  }

  objects.forEach((obj) => {
    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || child.userData.depth === undefined)
        return;

      const depth = child.userData.depth;
      const pulsePhase = child.userData.pulsePhase;

      const audioValue = getAudioBand(frequencyData, depth / 5);

      const waveX = Math.sin(scaledTime * 2 + depth) * 0.05 * (1 + mid);
      const waveY =
        Math.sin(scaledTime * 1.5 + depth * 1.2 + pulsePhase) *
        0.05 *
        (1 + bass);
      const waveZ =
        Math.cos(scaledTime * 1.7 + depth * 0.8) * 0.05 * (1 + treble);

      child.position.x += waveX;
      child.position.y += waveY;
      child.position.z += waveZ;

      if (beatInfo?.isBeat) {
        beatPulse(child, 1.4 + bass * 0.5);
      }

      child.rotation.x +=
        Math.sin(scaledTime * 1.5 + depth) * 0.02 * audioValue;
      child.rotation.y +=
        Math.cos(scaledTime * 1.3 + depth) * 0.02 * audioValue;
      child.rotation.z +=
        Math.sin(scaledTime * 1.7 + depth) * 0.01 * audioValue;

      if (child.material instanceof THREE.MeshPhongMaterial) {
        const { hue, lightness } = colorShift(
          scaledTime,
          depth,
          audioValue,
          beatInfo
        );
        child.material.color.setHSL(hue, 0.8, lightness);
        child.material.opacity = 0.5 + audioValue * 0.5;
      }
    });
  });

  objects.forEach((obj, index) => {
    obj.position.x = Math.sin(scaledTime * 0.3 + index) * 0.3;
    obj.position.z = Math.cos(scaledTime * 0.25 + index) * 0.3;
  });

  if (scene) {
    const hue = (scaledTime * 0.2 + bass * 0.3) % 1;
    const saturation = 0.5 + bass * 0.4;
    const lightness = 0.05 + treble * 0.15;
    scene.background = new THREE.Color().setHSL(hue, saturation, lightness);
  }
};
