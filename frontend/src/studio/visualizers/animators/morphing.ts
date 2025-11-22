import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateMorphing = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const scaledTime = time * 0.001;

  const bass = frequencyData[2] / 255;
  const mid = frequencyData[50] / 255;

  // Optional camera motion
  if (camera) {
    camera.position.x = Math.sin(time * 0.2) * (5 + bass * 2);
    camera.position.y = Math.sin(time * 0.15) * (2 + mid * 1.5);
    camera.position.z = 8;
    camera.lookAt(0, 0, 0);
  }

objects.forEach((obj, index) => {
  if (!(obj instanceof THREE.Mesh)) return;

  const geometry = obj.geometry as THREE.BufferGeometry;
  if (!geometry?.attributes?.position || !obj.userData?.originalVertices) return;

  const positions = geometry.attributes.position.array as Float32Array;
  const originalVertices = obj.userData.originalVertices as Float32Array;
  const len = Math.min(positions.length, originalVertices.length);

  const bassLevel = beatInfo?.bandStrengths?.bass || 0;
  const midLevel = beatInfo?.bandStrengths?.mid || 0;
  const trebleLevel = beatInfo?.bandStrengths?.treble || 0;
  const pulse = beatInfo?.isBeat ? 1.3 : 1 + bassLevel * 0.5;

  // Morph vertices
  for (let i = 0; i < len; i += 3) {
    const phase = obj.userData.phase ?? 0;

    const waveX =
      Math.sin(scaledTime * obj.userData.morphSpeed * 0.01 + i * 0.1 + phase) *
      (frequencyData[Math.floor((index / objects.length) * frequencyData.length)] / 255) *
      0.5 *
      pulse;

    const waveY =
      Math.cos(scaledTime * obj.userData.morphSpeed * 0.008 + i * 0.05 + phase) *
      bassLevel *
      0.3 *
      pulse;

    const waveZ =
      Math.sin(scaledTime * obj.userData.morphSpeed * 0.012 + i * 0.08 + phase) *
        midLevel *
        0.2 *
        pulse +
      trebleLevel * 0.1;

    positions[i] = originalVertices[i] + waveX;
    positions[i + 1] = originalVertices[i + 1] + waveY;
    positions[i + 2] = originalVertices[i + 2] + waveZ;
  }

  geometry.attributes.position.needsUpdate = true;

  // Scale bounce on beat
  const baseScale = obj.userData.baseScale || 1;
  const beatScale = beatInfo?.isBeat ? 1.5 : 1 + bassLevel * 0.3;
  obj.scale.setScalar(baseScale * beatScale);

  // 🎨 Color update (once per mesh)
  if (obj.material instanceof THREE.MeshPhongMaterial) {
    const hue = (scaledTime * 0.3 + index * 0.05 + (beatInfo?.isBeat ? 0.2 : 0)) % 1;
    obj.material.color.setHSL(hue, 0.9, 0.5 + bassLevel * 0.3);
    obj.material.needsUpdate = true;
  }

  // Rotation
  obj.rotation.x += 0.001 + bassLevel * 0.01;
  obj.rotation.y += 0.002 + midLevel * 0.01;

  // Orbit
  const radius = 3 + Math.sin(index + time * 0.001) * 2;
  const angle = (index / objects.length) * Math.PI * 2 + time * 0.001;
  obj.position.x = Math.cos(angle) * radius;
  obj.position.z = Math.sin(angle) * radius;

  // Beat jitter
  if (beatInfo?.isBeat) {
    obj.rotation.y += (Math.random() - 0.5) * 0.1;
    obj.rotation.x += (Math.random() - 0.5) * 0.05;
  }
});

};
