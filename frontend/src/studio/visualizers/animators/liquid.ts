import * as THREE from "three";
import type { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateLiquid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  const avgFrequency =
    Array.from(frequencyData).reduce((a, b) => a + b, 0) / frequencyData.length;

  objects.forEach((obj) => {
    if (
      obj.userData.type === "liquid" &&
      obj instanceof THREE.Mesh &&
      obj.geometry instanceof THREE.PlaneGeometry
    ) {
      const geometry = obj.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const originalVertices = obj.userData.originalVertices as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const vertexIndex = i / 3;
        const x = originalVertices[i];
        const z = originalVertices[i + 2];

        let waveHeight = 0;
        obj.userData.waveCenters.forEach((center: any) => {
          const dist = Math.sqrt((x - center.x) ** 2 + (z - center.y) ** 2);
          waveHeight +=
            Math.sin(dist * 2 - (time + center.time) * center.frequency) *
            center.amplitude *
            (1 + Math.sin(time * 0.5) * 0.4);
        });

        if (beatInfo?.isBeat && Math.random() < 0.08) {
          const dx = x - (Math.random() * 10 - 5);
          const dz = z - (Math.random() * 10 - 5);
          const dist = Math.sqrt(dx * dx + dz * dz);
          waveHeight += Math.exp(-dist * 2) * 1.5;
        }

        const audioInfluence =
          (frequencyData[
            Math.floor((vertexIndex / positions.length) * frequencyData.length)
          ] /
            255) *
          params.fluidity *
          0.02;
        positions[i + 1] =
          originalVertices[i + 1] +
          waveHeight +
          audioInfluence * 2 +
          Math.sin(time * 0.3 + vertexIndex * 0.01) * 0.12;
      }
      geometry.attributes.position.needsUpdate = true;

      if (obj.material instanceof THREE.MeshStandardMaterial) {
        obj.material.emissiveIntensity = 0.2 + avgFrequency * 0.6;
        obj.material.color.setHSL(
          0.55 + Math.sin(time) * 0.05,
          0.75,
          0.45 + avgFrequency * 0.2
        );
      }
    }

    if (
      obj.userData.type === "liquidParticles" &&
      obj instanceof THREE.Points
    ) {
      const geometry = obj.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const velocities = geometry.userData.velocities as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const audioForce =
          (frequencyData[
            Math.floor((i / positions.length) * frequencyData.length)
          ] /
            255) *
          0.03;
        positions[i] += velocities[i] + Math.sin(time + i * 0.01) * audioForce;
        positions[i + 1] +=
          velocities[i + 1] + Math.cos(time + i * 0.02) * audioForce * 0.5;
        positions[i + 2] +=
          velocities[i + 2] + Math.sin(time * 0.5 + i * 0.01) * audioForce;

        if (positions[i] > 5.5) positions[i] = -5.5;
        if (positions[i] < -5.5) positions[i] = 5.5;
        if (positions[i + 1] > 3.5) positions[i + 1] = -0.5;
        if (positions[i + 2] > 5.5) positions[i + 2] = -5.5;
        if (positions[i + 2] < -5.5) positions[i + 2] = 5.5;
      }
      geometry.attributes.position.needsUpdate = true;
    }

    if (obj.userData.type === "floatingOrb") {
      const { speed, orbitRadius, bobOffset } = obj.userData;
      obj.userData.orbitAngle += speed * 0.003;
      obj.position.set(
        Math.cos(obj.userData.orbitAngle) * orbitRadius,
        1.5 + Math.sin(time * 0.8 + bobOffset) * 0.6,
        Math.sin(obj.userData.orbitAngle) * orbitRadius
      );
      obj.rotation.x += 0.005;
      obj.rotation.y += 0.006;
      const scale = 1 + avgFrequency * 0.4;
      obj.scale.set(scale, scale, scale);
    }

    if (obj.userData.type === "gridLine") {
      const mat = (obj as THREE.Line).material as THREE.LineBasicMaterial;
      mat.opacity = 0.2 + Math.sin(time * 0.5) * 0.2 + avgFrequency * 0.1;
    }
  });
};
