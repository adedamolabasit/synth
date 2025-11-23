// animations/dimensionalGateway.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateDimensionalGateway = (
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

  // Cinematic camera movement - orbiting with dramatic angles
  if (camera) {
    const cameraOrbit = time * 0.05;
    const cameraRadius = 15 + Math.sin(time * 0.1) * 3;
    const cameraHeight = Math.sin(time * 0.07) * 5;
    
    camera.position.x = Math.cos(cameraOrbit) * cameraRadius;
    camera.position.y = cameraHeight;
    camera.position.z = Math.sin(cameraOrbit) * cameraRadius;
    
    // Look at the gateway with slight lead for cinematic feel
    const lookAhead = new THREE.Vector3(
      Math.sin(time * 0.03) * 2,
      Math.sin(time * 0.05) * 1,
      0
    );
    camera.lookAt(lookAhead);
    
    // Cinematic camera effects
    if (beatInfo?.isBeat) {
      camera.position.y += Math.sin(time * 20) * 0.5;
    }
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "dimensionalGateway") return;

    const mainGateway = obj.userData.mainGateway as THREE.Mesh;
    const portalField = obj.userData.portalField as THREE.Mesh;
    const filaments = obj.userData.filaments as THREE.Line[];
    const dimensionalParticles = obj.userData.dimensionalParticles as THREE.Points;
    const filamentPhases = obj.userData.filamentPhases as number[];
    const particleData = obj.userData.particleData;

    const gatewayIntensity = params.intensity * 0.04;
    const dimensionalSpeed = params.speed * 0.002;

    obj.userData.timeAccumulator += dimensionalSpeed;

    // Update shader uniforms
    const portalMaterial = portalField.material as THREE.ShaderMaterial;
    portalMaterial.uniforms.time.value = time;
    portalMaterial.uniforms.bass.value = bass;
    portalMaterial.uniforms.mid.value = mid;
    portalMaterial.uniforms.treble.value = treble;

    // Animate main gateway
    mainGateway.rotation.x += dimensionalSpeed * bass;
    mainGateway.rotation.y += dimensionalSpeed * mid;
    mainGateway.rotation.z += dimensionalSpeed * treble;
    
    // Gateway pulsation
    const gatewayPulse = Math.sin(time * 2) * 0.2 + 1;
    mainGateway.scale.setScalar(gatewayPulse + bass * 0.3);

    // Animate quantum filaments
    filaments.forEach((filament, index) => {
      const geometry = filament.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const phase = filamentPhases[index];
      
      // Dynamic filament undulation
      for (let i = 0; i < positions.length; i += 3) {
        const t = i / (positions.length - 3);
        const wave = Math.sin(time * 3 + phase + t * Math.PI * 4) * 0.3;
        positions[i + 1] += wave * bass;
      }
      
      geometry.attributes.position.needsUpdate = true;

      // Filament material animation
      const material = filament.material as THREE.LineBasicMaterial;
      const hue = (0.6 + time * 0.01 + index * 0.02) % 1;
      material.color.setHSL(hue, 0.9, 0.5 + mid * 0.3);
      material.opacity = 0.3 + treble * 0.3;
    });

    // Animate dimensional particles
    const particleGeometry = dimensionalParticles.geometry as THREE.BufferGeometry;
    const posAttr = particleGeometry.getAttribute("position");
    const colorAttr = particleGeometry.getAttribute("color");
    const sizeAttr = particleGeometry.getAttribute("size");
    
    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;
    const velocities = particleData.velocities;
    const lifeCycles = particleData.lifeCycles;

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      let lifeCycle = lifeCycles[i];

      // Particle life cycle
      lifeCycle += dimensionalSpeed * (1 + bass);
      if (lifeCycle >= 1) {
        lifeCycle = 0;
        // Reset particle to edge
        const radius = 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = Math.sin(phi) * Math.cos(theta) * radius;
        positions[i3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
        positions[i3 + 2] = Math.cos(phi) * radius;
      }
      lifeCycles[i] = lifeCycle;

      // Particle movement with vortex effect
      const vortexStrength = 0.02 * (1 + mid);
      const vortexX = -positions[i3 + 2] * vortexStrength;
      const vortexZ = positions[i3] * vortexStrength;
      
      positions[i3] += velocities[i3] + vortexX;
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2] + vortexZ;

      // Color evolution
      const hue = (i / (positions.length / 3) + time * 0.02) % 1;
      const color = new THREE.Color().setHSL(hue, 0.9, 0.6 + bass * 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Size based on position and audio
      const distance = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      );
      sizes[i] = (0.1 + (1 - distance / 8) * 0.3) * (1 + treble * 0.5);
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    // Global gateway effects
    obj.rotation.y += dimensionalSpeed * bass * 0.5;

    // Dimensional rift on beat
    if (beatInfo?.isBeat) {
      // Gateway expansion
      mainGateway.scale.setScalar(1.5);
      const gatewayMaterial = mainGateway.material as THREE.MeshPhysicalMaterial;
      gatewayMaterial.emissiveIntensity = 2;
      
      // Particle burst
      for (let i = 0; i < positions.length / 3; i += 10) {
        const i3 = i * 3;
        velocities[i3] *= 3;
        velocities[i3 + 1] *= 3;
        velocities[i3 + 2] *= 3;
      }

      // Filament intensification
      filaments.forEach(filament => {
        const material = filament.material as THREE.LineBasicMaterial;
        material.opacity = 0.8;
        setTimeout(() => {
          material.opacity = 0.4;
        }, 200);
      });

      // Reset effects
      setTimeout(() => {
        mainGateway.scale.setScalar(1);
        gatewayMaterial.emissiveIntensity = 0.3;
      }, 300);
    }
  });
};