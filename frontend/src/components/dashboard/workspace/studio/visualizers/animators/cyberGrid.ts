import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCyberGrid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  // Extract frequency bands
  const bass =
    frequencyData.slice(0, 32).reduce((a, b) => a + b, 0) / 32 || 0;
  const mids =
    frequencyData.slice(32, 128).reduce((a, b) => a + b, 0) / 96 || 0;
  const highs =
    frequencyData.slice(128).reduce((a, b) => a + b, 0) /
      (frequencyData.length - 128) || 0;

  // Define behavior sensitivity
  const speed = params.speed * 0.2; // 👈 slows down excessive motion
  const rotationSpeed = params.rotationSpeed * 0.002; // controlled spin
  const morphSpeed = params.morphSpeed * 0.5;
  const intensity = params.intensity * 0.6;
  const fluidity = params.fluidity * 0.4;
  const reactionSpeed = params.reactionSpeed * 0.8;

  // Animate every object
  objects.forEach((obj) => {
    // === GRID BEHAVIOR ===
    if (obj.userData.type === "cyberGrid") {
      if (obj instanceof THREE.LineSegments && obj.geometry instanceof THREE.BufferGeometry) {
        const positions = obj.geometry.attributes.position.array as Float32Array;
        const baseY = obj.userData.baseY ?? 0;

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const z = positions[i + 2];

          // 🌊 Choose animation mode based on intensity
          let pulseY = 0;
          if (intensity < 0.3) {
            // subtle floating
            pulseY = Math.sin(time * speed + x * 0.1 + z * 0.1) * 0.05;
          } else if (intensity < 0.7) {
            // moderate wave
            pulseY = Math.sin(time * speed + x * 0.2 + z * 0.15) * 0.15;
          } else {
            // strong pulsing + morph
            pulseY =
              Math.sin(time * (speed + morphSpeed) + x * 0.25 + z * 0.25) *
              0.25 *
              (1 + bass / 255);
          }

          positions[i + 1] = baseY + pulseY;
        }

        obj.geometry.attributes.position.needsUpdate = true;

        // 🎛️ Rotation — only if rotationSpeed > 0
        if (params.rotationSpeed > 0) {
          obj.rotation.x += rotationSpeed * 0.5 * fluidity;
          obj.rotation.y += rotationSpeed * 0.7;
          obj.rotation.z += rotationSpeed * 0.3 * fluidity;
        }

        // 🔆 Opacity and energy response
        const mat = obj.material as THREE.LineBasicMaterial;
        if (mat) {
          mat.opacity = 0.5 + (highs / 255) * 0.5 * reactionSpeed;
        }
      }
    }

    // === NODES BEHAVIOR ===
    if (obj instanceof THREE.Mesh && obj.userData.basePosition) {
      const base = obj.userData.basePosition as THREE.Vector3;
      const nodeSpeed = obj.userData.speed ?? 0.1;
      const idx = obj.userData.index ?? 0;

      // Node position pop/wave logic
      const mode =
        intensity < 0.3
          ? "float"
          : intensity < 0.7
          ? "wave"
          : "pulse";

      if (mode === "float") {
        obj.position.y = base.y + Math.sin(time * nodeSpeed * 0.8) * 0.3;
      } else if (mode === "wave") {
        obj.position.y =
          base.y + Math.sin(time * nodeSpeed * 1.2 + idx * 0.2) * 0.6;
        obj.position.x =
          base.x + Math.cos(time * nodeSpeed * 0.6 + idx * 0.3) * 0.3;
      } else if (mode === "pulse") {
        const beat = beatInfo?.isBeat ? 1.2 : 1.0;
        obj.position.y =
          base.y + Math.sin(time * nodeSpeed * 2.0 + idx * 0.3) * 0.8 * beat;
      }

      // Node scale & color reaction
      const dataIndex = Math.floor((idx / objects.length) * frequencyData.length);
      const scale =
        1 +
        (frequencyData[dataIndex] / 255) *
          0.6 *
          (1 + reactionSpeed * 0.5);
      obj.scale.set(scale, scale, scale);

      const mat = obj.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.6 + (frequencyData[dataIndex] / 255) * 0.4;
        mat.color.setHSL(
          0.6 + (frequencyData[dataIndex] / 255) * 0.2,
          1.0,
          0.6
        );
      }
    }
  });
};
