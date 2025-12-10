import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateAudioMesh = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[Math.min(2, frequencyData.length - 1)] / 255;
  const mid = frequencyData[Math.min(50, frequencyData.length - 1)] / 255;
  const treble = frequencyData[Math.min(120, frequencyData.length - 1)] / 255;

  if (camera) {
    const cameraAngle = time * 0.1;
    const cameraRadius = 10 - bass * 2;
    const cameraHeight = 6 + Math.sin(time * 0.2) * 2 + mid * 3;
    camera.position.x = Math.sin(cameraAngle) * cameraRadius;
    camera.position.y = cameraHeight;
    camera.position.z = Math.cos(cameraAngle) * cameraRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (obj.userData.type !== "audioMesh" && !obj.userData.isSolid) return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute("position");
    const colorAttr = geometry.getAttribute("color");

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;
    const gridSize = obj.userData.gridSize;
    const baseHue = obj.userData.baseHue ?? 0.5;
    const intensity = params.intensity ?? 2;

    const vertexCount = posAttr.count;

    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      const x = originalPositions[i3];
      const z = originalPositions[i3 + 2];

      const gridX = Math.floor((x / 12 + 0.5) * (gridSize - 1));
      const gridZ = Math.floor((z / 12 + 0.5) * (gridSize - 1));

      const freqIndex = Math.floor(
        ((gridX + gridZ) / (gridSize * 2)) * frequencyData.length * 0.7
      );
      const freqValue = frequencyData[Math.min(freqIndex, frequencyData.length - 1)] / 255;

      const distFromCenter = Math.sqrt(x * x + z * z);
      const radialWave = Math.sin(distFromCenter * 2 - time * 3) * 0.3 * mid;
      const crossWave = Math.sin(x * 0.5 + time * 2) * Math.cos(z * 0.5 + time * 1.5) * 0.2;

      const height = freqValue * intensity * 2 + radialWave + crossWave + bass * 0.5;
      positions[i3 + 1] = height;

      const hueShift = (baseHue + time * 0.02 + freqValue * 0.3 + distFromCenter * 0.03) % 1;
      const saturation = 0.6 + treble * 0.4;
      const lightness = 0.3 + freqValue * 0.4;
      const c = new THREE.Color().setHSL(hueShift, saturation, lightness);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    if (obj.userData.type === "audioMesh") {
      const material = obj.material as THREE.MeshStandardMaterial;
      if (beatInfo?.isBeat) {
        material.opacity = 1;
        material.emissive = new THREE.Color().setHSL(baseHue, 0.5, 0.2);
      } else {
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0.9, 0.1);
        material.emissive.setHSL(baseHue, 0.3, bass * 0.1);
      }
    }

    obj.rotation.y += (params.rotationSpeed ?? 1) * 0.001;
  });
};
