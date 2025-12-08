import * as THREE from "three";

export const animateKaleidoscope = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;
  
  const bass = frequencyData[2] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;
  const intensity = (bass + mid + treble) / 3;

  objects.forEach((obj) => {
    // ==================== MANDALA ====================
    if (obj.userData.isMandala) {
      const mandala = obj as THREE.Group;
      
      // Rotate entire mandala
      mandala.rotation.y += 0.002 * (1 + bass * 0.5);
      
      // Scale mandala with audio intensity
      const mandalaScale = 1 + intensity * 0.3;
      mandala.scale.set(mandalaScale, mandalaScale, mandalaScale);
      
      // Animate petals
      mandala.children.forEach((petal, index) => {
        if (petal instanceof THREE.Mesh) {
          const petalData = petal.userData;
          
          // Petal waving motion
          const wave = Math.sin(scaledTime * 2 + index * 0.5) * 0.2 * bass;
          petal.scale.y = 0.3 + wave * 0.1;
          
          // Color shift
          const petalMaterial = petal.material as THREE.MeshPhongMaterial;
          const hue = (petalData.sliceIndex / 12 + scaledTime * 0.05) % 1;
          petalMaterial.color.setHSL(hue, 0.9, 0.6 + bass * 0.2);
          petalMaterial.emissive.setHSL(hue, 0.5, 0.2 + treble * 0.3);
          
          // Petal rotation
          petal.rotation.z = petalData.baseAngle + scaledTime * 0.1;
        }
      });
      return;
    }

    // ==================== FLOATING GEOMETRIES ====================
    if (obj.userData.isFloatingGeometry) {
      const mesh = obj as THREE.Mesh;
      const data = obj.userData;
      
      const freqIndex = (data.geometryType * 4 + data.instanceIndex) % frequencyData.length;
      const audioValue = frequencyData[freqIndex] / 255;
      
      // Orbit around center
      const orbitAngle = data.angle + scaledTime * 0.3 * (1 + audioValue * 0.5);
      const orbitRadius = data.radius + Math.sin(scaledTime * 1.5 + data.instanceIndex) * 0.5 * bass;
      
      // Floating motion
      const floatHeight = Math.sin(scaledTime * data.floatSpeed + data.phase) * 0.8 * mid;
      
      mesh.position.x = Math.cos(orbitAngle) * orbitRadius;
      mesh.position.y = data.basePosition.y + floatHeight;
      mesh.position.z = Math.sin(orbitAngle) * orbitRadius;
      
      // Scale with audio
      const scale = 1 + audioValue * 1.2;
      mesh.scale.set(scale, scale, scale);
      
      // Rotation
      mesh.rotation.x += 0.01 * data.rotationSpeed * (1 + mid * 0.5);
      mesh.rotation.y += 0.01 * data.rotationSpeed * (1 + bass * 0.5);
      mesh.rotation.z += 0.005 * (1 + treble * 0.3);
      
      // Color animation
      const meshMaterial = mesh.material as THREE.MeshStandardMaterial;
      const hue = (data.baseHue + scaledTime * 0.05 + audioValue * 0.2) % 1;
      meshMaterial.color.setHSL(hue, 0.8, 0.7 + audioValue * 0.2);
      meshMaterial.emissive.setHSL(hue, 0.5, 0.1 + audioValue * 0.3);
      meshMaterial.opacity = 0.7 + audioValue * 0.3;
      return;
    }

    // ==================== ENERGY STREAKS ====================
    if (obj.userData.isStreakGroup) {
      const streakGroup = obj as THREE.Group;
      
      // Rotate entire streak group
      streakGroup.rotation.y += 0.003 * (1 + mid * 0.3);
      
      // Animate individual streaks
      streakGroup.children.forEach((streak, index) => {
        if (streak instanceof THREE.Line) {
          const streakData = streak.userData;
          const streakMaterial = streak.material as THREE.LineBasicMaterial;
          
          const freqIndex = index % frequencyData.length;
          const freqValue = frequencyData[freqIndex] / 255;
          
          // Color animation
          const hue = (streakData.streakIndex / 48 + scaledTime * 0.08) % 1;
          streakMaterial.color.setHSL(hue, 0.9, 0.6 + freqValue * 0.3);
          streakMaterial.opacity = 0.5 + freqValue * 0.4;
          
          // Streak pulsing
          const pulse = Math.sin(scaledTime * 3 + index * 0.2) * 0.2 * bass;
          streak.scale.y = 1 + pulse;
        }
      });
      return;
    }

    // ==================== PARTICLE SPIRAL ====================
    if (obj.userData.isParticleSpiral) {
      const particles = obj as THREE.Points;
      const geometry = particles.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      const particlePhases = obj.userData.particlePhases;
      const basePositions = obj.userData.basePositions;
      const particleCount = obj.userData.particleCount;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const dataIndex = Math.floor((i * 5) % frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;
        const phase = particlePhases[i];
        
        // Get base position
        const baseX = basePositions[i3];
        const baseY = basePositions[i3 + 1];
        const baseZ = basePositions[i3 + 2];
        
        // Add wave motion
        const waveX = Math.sin(scaledTime * 1.5 + baseY * 0.5 + phase) * 0.5 * bass;
        const waveZ = Math.cos(scaledTime * 1.5 + baseY * 0.5 + phase) * 0.5 * mid;
        
        positions[i3] = baseX + waveX;
        positions[i3 + 1] = baseY + Math.sin(scaledTime + i * 0.01) * 0.3 * treble;
        positions[i3 + 2] = baseZ + waveZ;
        
        // Color animation
        const hue = (i / particleCount + scaledTime * 0.02) % 1;
        const color = new THREE.Color().setHSL(hue, 0.9, 0.6 + audioValue * 0.3);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      
      // Rotate entire particle system
      particles.rotation.y += 0.001 * (1 + bass * 0.3);
      
      // Scale with intensity
      const particleScale = 1 + Math.sin(scaledTime) * 0.1 * intensity;
      particles.scale.setScalar(particleScale);
      return;
    }
  });
};