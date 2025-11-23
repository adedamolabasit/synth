// animations/fractalExpansion.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateFractalExpansion = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[0] / 255;
  const mid = frequencyData[64] / 255;
  const treble = frequencyData[127] / 255;

  // Fractal exploration camera
  if (camera) {
    camera.position.x = Math.sin(time * 0.1) * 15;
    camera.position.y = Math.cos(time * 0.07) * 12;
    camera.position.z = Math.cos(time * 0.1) * 15;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "fractalExpansion") return;

    const fractalNodes = obj.userData.fractalNodes as THREE.Mesh[];
    const basePositions = obj.userData.basePositions as THREE.Vector3[];
    const baseScales = obj.userData.baseScales as THREE.Vector3[];
    const vibrationPhases = obj.userData.vibrationPhases as number[];

    const fractalIntensity = params.intensity * 0.03;
    const expansionSpeed = params.speed * 0.001;

    // Update expansion level
    obj.userData.expansionLevel = (obj.userData.expansionLevel + expansionSpeed) % 1;

    fractalNodes.forEach((node, index) => {
      const basePos = basePositions[index];
      const baseScale = baseScales[index];
      const phase = vibrationPhases[index];
      const freqIndex = Math.floor((index / fractalNodes.length) * frequencyData.length);
      const energy = frequencyData[freqIndex] / 255;

      // Fractal vibration
      const vibration = Math.sin(time * 3 + phase) * energy * 0.5;
      const expansion = Math.sin(obj.userData.expansionLevel * Math.PI * 2 + index * 0.1) * 2;

      // Position animation
      node.position.x = basePos.x + basePos.x * expansion * bass;
      node.position.y = basePos.y + basePos.y * expansion * mid;
      node.position.z = basePos.z + basePos.z * expansion * treble;
      node.position.addScaledVector(basePos, vibration * 0.1);

      // Scale animation
      const scaleFactor = 1 + energy * 0.5 + Math.sin(time * 2 + index) * 0.2;
      node.scale.copy(baseScale).multiplyScalar(scaleFactor);

      // Color and appearance
      const material = node.material as THREE.MeshBasicMaterial;
      const depthFactor = 1 - (basePos.length() / 20); // Deeper nodes are different
      const hue = (0.3 + depthFactor * 0.3 + time * 0.01 + energy * 0.2) % 1;
      material.color.setHSL(hue, 0.8, 0.4 + energy * 0.3);
      material.opacity = 0.5 + energy * 0.4;

      // Pulsing effect
      const pulse = Math.sin(time * 1.5 + index * 0.2) * 0.3 + 0.7;
      node.scale.multiplyScalar(pulse);
    });

    // Global fractal rotation
    obj.rotation.y += expansionSpeed * bass;
    obj.rotation.x += expansionSpeed * mid * 0.3;
    obj.rotation.z += expansionSpeed * treble * 0.2;

    // Fractal growth burst on beat
    if (beatInfo?.isBeat) {
      // Expand fractal rapidly
      fractalNodes.forEach((node, index) => {
        const basePos = basePositions[index];
        node.position.add(basePos.clone().multiplyScalar(0.5));
        node.scale.multiplyScalar(1.5);

        // Color flash
        const material = node.material as THREE.MeshBasicMaterial;
        material.color.set(1, 1, 1);
        
        setTimeout(() => {
          material.color.setHSL(0.3, 0.8, 0.5);
        }, 100);
      });

      // Reset after expansion
      setTimeout(() => {
        fractalNodes.forEach((node, index) => {
          node.scale.copy(baseScales[index]);
        });
      }, 200);
    }
  });
};