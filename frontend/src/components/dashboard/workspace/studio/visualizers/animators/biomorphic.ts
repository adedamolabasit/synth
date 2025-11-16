import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateBiomorphic = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  // Use requestAnimationFrame time for smoother animation
  const scaledTime = time * 0.001; // Scale down time for slower animation
  
  objects.forEach((obj, index) => {
    // Only animate visible objects and limit traversal
    if (index < objects.length) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.depth !== undefined) {
          const depth = child.userData.depth;
          const pulsePhase = child.userData.pulsePhase;

          // Smoother, less intensive pulsing
          const pulse = Math.sin(scaledTime * 1.5 + pulsePhase) * 0.05 + 1; // Reduced scale
          child.scale.y = pulse;

          // Optimized color animation - only update when needed
          if (child.material instanceof THREE.MeshPhongMaterial) {
            const dataIndex = Math.min(
              Math.floor((depth / 5) * frequencyData.length),
              frequencyData.length - 1
            );
            const audioInfluence = frequencyData[dataIndex] / 255;
            const hue = (0.3 + depth * 0.1 + audioInfluence * 0.1) % 1; // Reduced audio influence
            child.material.color.setHSL(hue, 0.8, 0.5);
          }

          // Slower, gentler rotation
          child.rotation.z = Math.sin(scaledTime * 0.3 + depth) * 0.05; // Reduced rotation
        }
      });
    }
  });
};