import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateNeuralNetwork = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const t = time * 0.001;
  
  const bass = frequencyData[2] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;

  // CAMERA
  if (camera) {
    camera.position.x = Math.sin(t * 0.2) * 10;
    camera.position.z = Math.cos(t * 0.2) * 10;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach(obj => {
    if (!obj.userData || obj.userData.type !== "neuralNetwork") return;

    const { connections } = obj.userData;
    
    // CORE
    const core = obj.children[0] as THREE.Mesh;
    if (core) {
      core.scale.setScalar(1 + bass * 0.5);
      core.rotation.y += 0.01;
      
      const material = core.material as THREE.MeshBasicMaterial;
      material.color.setHSL((t * 0.1) % 1, 0.8, 0.6);
      material.opacity = 0.3 + treble * 0.2;
    }

    // NEURONS
    obj.children.forEach((child, i) => {
      if (i === 0) return; // Skip core
      
      if (child instanceof THREE.Mesh && child.userData.layer !== undefined) {
        const data = child.userData;
        const freqIndex = (data.i + data.layer * 3) * 5 % frequencyData.length;
        const audioValue = frequencyData[freqIndex] / 255;
        
        const waveX = Math.sin(t * 2 + data.phase) * 0.3 * audioValue;
        const waveY = Math.cos(t * 1.5 + data.phase) * 0.3 * audioValue;
        
        child.position.x = data.basePosition.x + waveX;
        child.position.y = data.basePosition.y + waveY;
        child.position.z = data.basePosition.z;
        
        child.scale.setScalar(0.2 + audioValue * 0.4);
        
        const material = child.material as THREE.MeshBasicMaterial;
        material.color.setHSL(
          (data.i / 12 + t * 0.05) % 1,
          0.8,
          0.6 + audioValue * 0.3
        );
        material.opacity = 0.6 + audioValue * 0.4;
      }
    });

    // CONNECTIONS
    connections.forEach((line: THREE.Line) => {
      const material = line.material as THREE.LineBasicMaterial;
      material.opacity = 0.2 + mid * 0.3;
      
      if (beatInfo?.isBeat && Math.random() < 0.1) {
        material.opacity = 1;
        material.color.setHSL(Math.random(), 0.8, 0.7);
      }
    });

    // ROTATION
    obj.rotation.y += 0.002 * (1 + mid * 0.5);

    // BEAT EFFECT
    if (beatInfo?.isBeat) {
      obj.children.forEach((child, i) => {
        if (i > 0 && child instanceof THREE.Mesh) {
          child.scale.setScalar(0.6);
          const material = child.material as THREE.MeshBasicMaterial;
          material.color.setHSL(Math.random(), 1, 0.9);
        }
      });
    }
  });
};