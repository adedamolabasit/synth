import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCyberGrid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  if (!frequencyData || frequencyData.length === 0) return;

  const clampSlice = (from: number, to: number) => {
    const start = Math.max(0, Math.min(frequencyData.length, from));
    const end = Math.max(start, Math.min(frequencyData.length, to));
    const slice = frequencyData.slice(start, end);
    return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : 0;
  };

  const bass = clampSlice(0, Math.floor(frequencyData.length * 0.125)); 
  
  const highs = clampSlice(Math.floor(frequencyData.length * 0.5), frequencyData.length);

  const speed = params.speed * 0.2;
  const rotationSpeed = params.rotationSpeed * 0.002;
  const morphSpeed = params.morphSpeed * 0.5;
  const intensity = params.intensity * 0.6;
  const fluidity = params.fluidity * 0.4;
  const reactionSpeed = params.reactionSpeed * 0.8;

  objects.forEach((obj, i) => {
    if (obj.userData && obj.userData.type === "cyberGrid") {
      if (obj instanceof THREE.LineSegments && obj.geometry instanceof THREE.BufferGeometry) {
        const posAttr = obj.geometry.getAttribute("position");
        const positions = posAttr.array as Float32Array;
        const baseY = typeof obj.userData.baseY === "number" ? obj.userData.baseY : 0;

        for (let p = 0; p < positions.length; p += 3) {
          const x = positions[p];
          const z = positions[p + 2];

          let pulseY = 0;
          if (intensity < 0.3) {
            pulseY = Math.sin(time * speed + x * 0.1 + z * 0.1) * 0.05;
          } else if (intensity < 0.7) {
            pulseY = Math.sin(time * speed + x * 0.2 + z * 0.15) * 0.15;
          } else {
            pulseY =
              Math.sin(time * (speed + morphSpeed) + x * 0.25 + z * 0.25) *
              0.25 *
              (1 + bass / 255);
          }

          positions[p + 1] = baseY + pulseY;
        }

        posAttr.needsUpdate = true;

        if (params.rotationSpeed > 0) {
          obj.rotation.x += rotationSpeed * 0.5 * fluidity;
          obj.rotation.y += rotationSpeed * 0.7;
          obj.rotation.z += rotationSpeed * 0.3 * fluidity;
        }

        if (obj.material instanceof THREE.LineBasicMaterial) {
          const normHighs = Math.min(1, highs / 255);
          obj.material.opacity = 0.5 + normHighs * 0.5 * reactionSpeed;
          obj.material.needsUpdate = true;
        }
      }
    }

    if (obj instanceof THREE.Mesh && obj.userData && obj.userData.basePosition) {
      const base = obj.userData.basePosition as THREE.Vector3;
      const nodeSpeed = typeof obj.userData.floatSpeed === "number" ? obj.userData.floatSpeed : 0.1;
      const idx = typeof obj.userData.index === "number" ? obj.userData.index : i;

      const mode = intensity < 0.3 ? "float" : intensity < 0.7 ? "wave" : "pulse";

      if (mode === "float") {
        obj.position.y = base.y + Math.sin(time * nodeSpeed * 0.8 + (obj.userData.phase || 0)) * 0.3;
      } else if (mode === "wave") {
        obj.position.y = base.y + Math.sin(time * nodeSpeed * 1.2 + idx * 0.2) * 0.6;
        obj.position.x = base.x + Math.cos(time * nodeSpeed * 0.6 + idx * 0.3) * 0.3;
      } else {
        const beat = beatInfo?.isBeat ? 1.2 + (beatInfo.strength ?? 0) * 0.5 : 1.0;
        obj.position.y = base.y + Math.sin(time * nodeSpeed * 2.0 + idx * 0.3) * 0.8 * beat;
      }

      const dataIndex = Math.floor((i / Math.max(1, objects.length)) * frequencyData.length);
      const freq = Math.min(1, (frequencyData[dataIndex] ?? 0) / 255);

      const scale = 1 + freq * 0.6 * (1 + reactionSpeed * 0.5);
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshBasicMaterial || obj.material instanceof THREE.MeshStandardMaterial || obj.material instanceof THREE.MeshPhongMaterial) {
        const mat = obj.material as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | THREE.MeshPhongMaterial;

        if (typeof mat.opacity === "number") {
          mat.transparent = true;
          mat.opacity = 0.5 + freq * 0.4;
        }

        if (mat.color) {
          const hue = 0.55 + freq * 0.25;
          mat.color.setHSL(hue, 1.0, 0.6);
        }

        if ("needsUpdate" in mat) mat.needsUpdate = true;
      }
    }
  });
};
