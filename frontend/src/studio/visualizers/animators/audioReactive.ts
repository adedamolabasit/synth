import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateAudioReactive = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh) || obj.userData.ring === undefined) return;

    const ring = obj.userData.ring;
    const segments = obj.userData.segments;
    const bassLevel = beatInfo?.bandStrengths?.bass || 0;

    // React to different frequency bands
    const scale = 1 + (beatInfo?.bandStrengths?.mid || 0) * params.intensity * 0.01;
    obj.scale.set(scale, scale, scale);

    // Pulsate with bass
    const pulse = 1 + Math.sin(time * 4 + ring) * bassLevel * 0.2;
    obj.scale.multiplyScalar(pulse);

    // Color shift with treble
    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue =
        (time * 0.1 + ring * 0.1 + (beatInfo?.bandStrengths?.treble || 0) * 0.5) % 1;
      obj.material.color.setHSL(hue, 0.8, 0.6);
    }

    // Deform geometry with audio
    const geometry = obj.geometry as THREE.TorusGeometry;
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < segments; i++) {
      const dataIndex = Math.floor((i / segments) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;

      // Modify vertex positions based on audio
      const vertexIndex = i * 3;
      if (positions[vertexIndex + 1] !== undefined) {
        const wave = Math.sin(time * 2 + i * 0.5) * frequencyValue * 0.1;
        positions[vertexIndex + 1] += wave;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });
};