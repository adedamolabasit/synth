// creators/neuralFireworks.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createNeuralFireworksVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const fireworksGroup = new THREE.Group();
  
  const fireworkCount = 15;
  const fireworks: THREE.Points[] = [];
  const neuralConnections: THREE.Line[] = [];

  // Create multiple firework systems
  for (let i = 0; i < fireworkCount; i++) {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Create firework at random position
    const fireworkX = (Math.random() - 0.5) * 20;
    const fireworkY = (Math.random() - 0.5) * 10;
    const fireworkZ = (Math.random() - 0.5) * 20;

    for (let j = 0; j < particleCount; j++) {
      const i3 = j * 3;
      
      // Start all particles at firework origin
      positions[i3] = fireworkX;
      positions[i3 + 1] = fireworkY;
      positions[i3 + 2] = fireworkZ;

      // Random velocity directions for explosion
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      
      velocities[i3] = velocity.x;
      velocities[i3 + 1] = velocity.y;
      velocities[i3 + 2] = velocity.z;

      // Vibrant firework colors
      const hue = Math.random() * 0.3 + i * 0.05;
      const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const firework = new THREE.Points(geometry, material);
    fireworksGroup.add(firework);
    fireworks.push(firework);
  }

  fireworksGroup.userData = {
    type: "neuralFireworks",
    fireworks,
    neuralConnections,
    explosionStates: fireworks.map(() => Math.random()),
    lifeCycles: fireworks.map(() => Math.random()),
    connectionTargets: Array.from({ length: fireworkCount }, () => 
      Math.floor(Math.random() * fireworkCount)
    ),
    isLyrics: false,
  };

  scene.add(fireworksGroup);
  objects.push(fireworksGroup);
  return objects;
};