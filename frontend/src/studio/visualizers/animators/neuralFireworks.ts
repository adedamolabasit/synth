// animations/neuralFireworks.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateNeuralFireworks = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[5] / 255;
  const mid = frequencyData[70] / 255;
  const treble = frequencyData[135] / 255;

  // Dynamic fireworks camera - constantly moving to follow explosions
  if (camera) {
    camera.position.x = Math.sin(time * 0.1) * 25;
    camera.position.y = Math.sin(time * 0.07) * 15;
    camera.position.z = Math.cos(time * 0.1) * 25;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "neuralFireworks") return;

    const fireworks = obj.userData.fireworks as THREE.Points[];
    const explosionStates = obj.userData.explosionStates as number[];
    const lifeCycles = obj.userData.lifeCycles as number[];
    const connectionTargets = obj.userData.connectionTargets as number[];

    const fireworkIntensity = params.intensity * 0.04;
    const explosionSpeed = params.speed * 0.002;

    fireworks.forEach((firework, index) => {
      const geometry = firework.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");
      const velAttr = geometry.getAttribute("velocity");
      
      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const velocities = velAttr.array as Float32Array;

      let explosionState = explosionStates[index];
      let lifeCycle = lifeCycles[index];
      const freqIndex = Math.floor((index / fireworks.length) * frequencyData.length);
      const energy = frequencyData[freqIndex] / 255;

      // Firework life cycle management
      lifeCycle += explosionSpeed;
      if (lifeCycle >= 1) {
        lifeCycle = 0;
        explosionState = Math.random();
        // Reset firework to new random position
        const newX = (Math.random() - 0.5) * 20;
        const newY = (Math.random() - 0.5) * 10;
        const newZ = (Math.random() - 0.5) * 20;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = newX;
          positions[i + 1] = newY;
          positions[i + 2] = newZ;
        }
      }
      
      lifeCycles[index] = lifeCycle;
      explosionStates[index] = explosionState;

      // Animate particles
      for (let i = 0; i < positions.length; i += 3) {
        const explosionPhase = lifeCycle * 3; // 0: idle, 1: launch, 2: explode, 3: fade
        
        if (explosionPhase < 1) {
          // Launch phase - particles move upward
          positions[i + 1] += 0.1 * (1 + bass);
        } else if (explosionPhase < 2) {
          // Explosion phase - particles expand
          positions[i] += velocities[i] * explosionState * (1 + mid * 2);
          positions[i + 1] += velocities[i + 1] * explosionState * (1 + bass * 2);
          positions[i + 2] += velocities[i + 2] * explosionState * (1 + treble * 2);
        } else {
          // Fade phase - slow movement and gravity
          positions[i] += velocities[i] * 0.1;
          positions[i + 1] += velocities[i + 1] * 0.1 - 0.02; // gravity
          positions[i + 2] += velocities[i + 2] * 0.1;
        }

        // Color evolution through life cycle
        const hue = (index * 0.05 + explosionPhase * 0.3 + time * 0.02) % 1;
        const saturation = 0.8 + treble * 0.2;
        const brightness = Math.max(0.3, 1 - explosionPhase * 0.5) + energy * 0.3;
        
        const color = new THREE.Color().setHSL(hue, saturation, brightness);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Firework scaling based on energy
      const material = firework.material as THREE.PointsMaterial;
      material.size = 0.2 + energy * 0.3 + bass * 0.2;
      material.opacity = 0.6 + energy * 0.4;
    });

    // Create neural connections between fireworks
    if (obj.userData.neuralConnections.length < fireworks.length * 2) {
      for (let i = 0; i < fireworks.length; i++) {
        const targetIndex = connectionTargets[i];
        if (targetIndex !== i) {
          const sourcePos = new THREE.Vector3();
          const targetPos = new THREE.Vector3();
          
          fireworks[i].getWorldPosition(sourcePos);
          fireworks[targetIndex].getWorldPosition(targetPos);

          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array([
            sourcePos.x, sourcePos.y, sourcePos.z,
            targetPos.x, targetPos.y, targetPos.z
          ]);

          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          const material = new THREE.LineBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
          });

          const connection = new THREE.Line(geometry, material);
          obj.add(connection);
          obj.userData.neuralConnections.push(connection);
        }
      }
    }

    // Animate neural connections
    obj.userData.neuralConnections.forEach((connection: THREE.Line, index: number) => {
      const material = connection.material as THREE.LineBasicMaterial;
      const pulse = Math.sin(time * 2 + index * 0.1) * 0.4 + 0.6;
      material.opacity = 0.1 + mid * 0.3 * pulse;
    });

    // Grand finale on beat
    if (beatInfo?.isBeat) {
      // Trigger multiple fireworks simultaneously
      fireworks.forEach((firework, index) => {
        if (Math.random() < 0.6) {
          lifeCycles[index] = 0.1; // Start launch phase
          explosionStates[index] = 0.5 + Math.random() * 0.5;
        }
      });

      // Flash all connections
      obj.userData.neuralConnections.forEach((connection: THREE.Line) => {
        const material = connection.material as THREE.LineBasicMaterial;
        material.opacity = 0.8;
        setTimeout(() => {
          material.opacity = 0.2;
        }, 100);
      });
    }
  });
};