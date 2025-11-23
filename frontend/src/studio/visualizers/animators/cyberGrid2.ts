// animations/cyberGrid.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCyberGrid2 = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[20] / 255;
  const mid = frequencyData[80] / 255;
  const treble = frequencyData[140] / 255;

  // Cyber camera - fast orbiting with data-like movement
  if (camera) {
    camera.position.x = Math.sin(time * 0.2) * 25;
    camera.position.y = Math.sin(time * 0.15) * 8;
    camera.position.z = Math.cos(time * 0.2) * 25;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "cyberGrid") return;

    const nodes = obj.userData.nodes as THREE.Mesh[];
    const connections = obj.userData.connections as THREE.Line[];
    const dataFlow = obj.userData.dataFlow as number[];
    const packetDirections = obj.userData.packetDirections as THREE.Vector3[];

    const networkSpeed = params.speed * 0.002;
    const dataIntensity = params.intensity * 0.03;

    nodes.forEach((node, index) => {
      const freqIndex = Math.floor((index / nodes.length) * frequencyData.length);
      const signalStrength = frequencyData[freqIndex] / 255;

      // Node pulsing with data
      const pulse = Math.sin(time * 3 + index * 0.1) * 0.3 + 0.7;
      const scale = 0.3 + signalStrength * 0.4 * pulse;
      node.scale.set(scale, scale, scale);

      // Data flow visualization
      dataFlow[index] = (dataFlow[index] + networkSpeed * signalStrength) % 1;
      
      // Node color based on data activity
      const material = node.material as THREE.MeshBasicMaterial;
      const hue = (0.6 + dataFlow[index] * 0.3 + treble * 0.2) % 1;
      material.color.setHSL(hue, 0.9, 0.5 + signalStrength * 0.3);
      material.opacity = 0.6 + signalStrength * 0.4;

      // Data packet movement
      const packetMove = Math.sin(time * 2 + dataFlow[index] * Math.PI * 2) * 0.5;
      node.position.add(packetDirections[index].clone().multiplyScalar(packetMove * dataIntensity));

      // Reset position periodically
      if (dataFlow[index] < 0.1) {
        const basePos = obj.userData.basePositions?.[index];
        if (basePos) {
          node.position.lerp(basePos, 0.1);
        }
      }
    });

    // Animate connections
    connections.forEach((connection, index) => {
      const material = connection.material as THREE.LineBasicMaterial;
      const dataFlow = Math.sin(time * 4 + index * 0.05) * 0.4 + 0.6;
      material.opacity = 0.2 + bass * 0.3 * dataFlow;

      // Data transmission effect
      if (beatInfo?.isBeat && Math.random() < 0.2) {
        material.opacity = 1;
        material.color.setHSL(Math.random() * 0.2 + 0.7, 1, 0.7);
      }
    });

    // Global grid rotation
    obj.rotation.x += networkSpeed * mid;
    obj.rotation.y += networkSpeed * bass;
    obj.rotation.z += networkSpeed * treble;

    // Cyber attack simulation on beat
    if (beatInfo?.isBeat) {
      // Flash all nodes
      nodes.forEach(node => {
        const material = node.material as THREE.MeshBasicMaterial;
        material.color.set(1, 0.2, 0.2);
        node.scale.setScalar(1.5);
        
        setTimeout(() => {
          material.color.setHSL(0.6, 0.9, 0.5);
        }, 100);
      });

      // Intensify connections
      connections.forEach(connection => {
        const material = connection.material as THREE.LineBasicMaterial;
        material.opacity = 0.8;
        setTimeout(() => {
          material.opacity = 0.4;
        }, 150);
      });
    }
  });
};