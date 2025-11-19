import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateAudioReactive = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const mesh = objects[0] as THREE.Mesh;

  const bass = (beatInfo?.bandStrengths?.bass || 0) * 0.01;
  const mid = (beatInfo?.bandStrengths?.mid || 0) * 0.01;
  const treble = (beatInfo?.bandStrengths?.treble || 0) * 0.01;

  const mat = mesh.material as THREE.ShaderMaterial;

  mat.uniforms.uTime.value = time;
  mat.uniforms.uBass.value = bass * params.intensity;
  mat.uniforms.uMid.value = mid * params.intensity;
  mat.uniforms.uTreble.value = treble * params.intensity;
};
