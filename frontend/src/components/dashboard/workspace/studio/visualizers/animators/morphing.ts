import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateMorphing = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj, index) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const dataIndex = Math.floor(
      (index / objects.length) * frequencyData.length
    );
    const frequencyValue = frequencyData[dataIndex] / 255;
    const bassLevel = beatInfo?.bandStrengths?.bass || 0;

    const geometry = obj.geometry as THREE.BufferGeometry;

    // 🧱 Safety check
    if (
      !geometry?.attributes?.position ||
      !obj.userData?.originalVertices
    ) {
      return;
    }

    const positions = geometry.attributes.position.array as Float32Array;
    const originalVertices = obj.userData.originalVertices as Float32Array;

    // 🧠 Protect against length mismatch
    const len = Math.min(positions.length, originalVertices.length);

    for (let i = 0; i < len; i += 3) {
      const wave1 =
        Math.sin(time * obj.userData.morphSpeed * 0.01 + i * 0.1) *
        frequencyValue *
        0.5;
      const wave2 =
        Math.cos(time * obj.userData.morphSpeed * 0.008 + i * 0.05) *
        bassLevel *
        0.3;

      positions[i] = originalVertices[i] + wave1;
      positions[i + 1] = originalVertices[i + 1] + wave2;
      positions[i + 2] = originalVertices[i + 2] + (wave1 + wave2) * 0.5;
    }

    geometry.attributes.position.needsUpdate = true;

    // Beat scale
    const beatScale = 1 + (beatInfo?.isBeat ? 0.3 : 0);
    obj.scale.setScalar(obj.userData.baseScale * beatScale);

    // Color animation
    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (time * 0.05 + index * 0.02) % 1;
      obj.material.color.setHSL(hue, 0.9, 0.6);
    }
  });
};
