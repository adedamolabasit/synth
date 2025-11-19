import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../../shared/types/visualizer.types";


export const animateLiquid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj) => {
    if (obj.userData.type === "liquid") {
      if (
        obj instanceof THREE.Mesh &&
        obj.geometry instanceof THREE.PlaneGeometry
      ) {
        const geometry = obj.geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const originalVertices = obj.userData.originalVertices as Float32Array;
        const resolution = obj.userData.resolution;

        for (let i = 0; i < positions.length; i += 3) {
          const vertexIndex = i / 3;
          const x = originalVertices[i];
          const z = originalVertices[i + 2];

          let waveHeight = 0;

          // Multiple harmonic wave sources
          obj.userData.waveCenters.forEach((center: any) => {
            const distance = Math.sqrt(
              (x - center.x) ** 2 + (z - center.y) ** 2
            );
            waveHeight +=
              Math.sin(distance * 2 - (time + center.time) * center.frequency) *
              center.amplitude *
              (1 + Math.sin(time * 0.5) * 0.3);
          });

          const dataIndex = Math.floor(
            (vertexIndex / positions.length) * frequencyData.length
          );
          const audioInfluence =
            (frequencyData[dataIndex] / 255) * params.fluidity * 0.015;

          const dampening = 0.95;
          positions[i + 1] =
            originalVertices[i + 1] +
            waveHeight * 0.6 +
            audioInfluence * 2.5 +
            Math.sin(time * 0.3 + vertexIndex * 0.01) * 0.1;
        }

        geometry.attributes.position.needsUpdate = true;
      }
    } else if (obj.userData.type === "liquidParticles") {
      if (
        obj instanceof THREE.Points &&
        obj.geometry instanceof THREE.BufferGeometry
      ) {
        const geometry = obj.geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const velocities = geometry.userData.velocities as Float32Array;
        const colors = geometry.attributes.color.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
          const i3 = i;

          // Apply velocity
          positions[i3] += velocities[i3];
          positions[i3 + 1] += velocities[i3 + 1];
          positions[i3 + 2] += velocities[i3 + 2];

          const dataIndex = Math.floor(
            (i / positions.length) * frequencyData.length
          );
          const audioForce = (frequencyData[dataIndex] / 255) * 0.02;

          positions[i3] += Math.sin(time + i * 0.01) * audioForce;
          positions[i3 + 2] += Math.cos(time + i * 0.01) * audioForce;

          // Floating motion
          positions[i3 + 1] += Math.sin(time * 0.5 + i * 0.01) * 0.008;

          // Wrap around
          if (positions[i3] > 5.5) positions[i3] = -5.5;
          if (positions[i3] < -5.5) positions[i3] = 5.5;
          if (positions[i3 + 1] > 3.5) positions[i3 + 1] = -0.5;
          if (positions[i3 + 2] > 5.5) positions[i3 + 2] = -5.5;
          if (positions[i3 + 2] < -5.5) positions[i3 + 2] = 5.5;
        }

        geometry.attributes.position.needsUpdate = true;
      }
    } else if (obj.userData.type === "floatingOrb") {
      const { speed, orbitRadius, bobOffset } = obj.userData;
      obj.userData.orbitAngle += speed * 0.002;

      const baseX = Math.cos(obj.userData.orbitAngle) * orbitRadius;
      const baseZ = Math.sin(obj.userData.orbitAngle) * orbitRadius;
      const bobY = Math.sin(time * 0.8 + bobOffset) * 0.5;

      obj.position.x = baseX;
      obj.position.y = 1.5 + bobY;
      obj.position.z = baseZ;

      obj.rotation.x += 0.002;
      obj.rotation.y += 0.003;

      const avgFrequency =
        Array.from(frequencyData).reduce((a, b) => a + b, 0) /
        frequencyData.length;
      const scale = 1 + (avgFrequency / 255) * 0.3;
      obj.scale.set(scale, scale, scale);
    } else if (obj.userData.type === "gridLine") {
      const mat = (obj as THREE.Line).material as THREE.LineBasicMaterial;
      mat.opacity = 0.2 + Math.sin(time * 0.5) * 0.15;
    }
  });
};
