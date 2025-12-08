import * as THREE from "three";
import { BeatInfo } from "../../types/visualizer";

export const animateSacredGeometry = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  beatInfo?: BeatInfo
): void => {
  const t = time * 0.001;
  
  const bass = frequencyData[0] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;
  const intensity = (bass + mid + treble) / 3;

  objects.forEach(obj => {
    if (!obj.userData || !obj.userData.mandalaGroup) return;

    const {
      mandalaGroup,
      metatronGroup,
      flowerCircles,
      sacredLines,
      floatingGeometries,
      energyOrbs,
      particles,
      activationWave,
    } = obj.userData;
    
    // Update activation wave
    obj.userData.activationWave = (activationWave + 0.03) % 1;

    // ==================== MANDALA ANIMATION ====================
    mandalaGroup.children.forEach((petal: THREE.Mesh) => {
      if (petal.userData.type === "mandalaPetal") {
        const petalData = petal.userData;
        const petalIndex = petalData.index;
        
        const freqIndex = petalIndex * 3 % frequencyData.length;
        const audioValue = frequencyData[freqIndex] / 255;
        
        // Petal waving
        const wave = Math.sin(t * 2 + petalData.phase) * 0.3 * bass;
        petal.scale.y = 0.4 + wave * 0.1;
        
        // Petal rotation
        petal.rotation.z = petalData.baseAngle + Math.sin(t * 0.5 + petalIndex) * 0.2;
        
        // Color animation
        const petalMaterial = petal.material as THREE.MeshPhongMaterial;
        const hue = (petalIndex / 12 + t * 0.05) % 1;
        const brightness = 0.6 + audioValue * 0.3;
        petalMaterial.color.setHSL(hue, 0.9, brightness);
        petalMaterial.emissive.setHSL(hue, 0.5, 0.2 + audioValue * 0.3);
        petalMaterial.opacity = 0.7 + audioValue * 0.3;
        
        // Mandala overall rotation
        mandalaGroup.rotation.y += 0.002 * (1 + mid * 0.3);
        mandalaGroup.rotation.x += 0.001 * (1 + treble * 0.2);
      }
    });

    // ==================== METATRON'S CUBE ====================
    flowerCircles.forEach((circle: THREE.Mesh, i: number) => {
      const circleMaterial = circle.material as THREE.MeshBasicMaterial;
      const freqIndex = i * 5 % frequencyData.length;
      const audioValue = frequencyData[freqIndex] / 255;
      
      // Circle pulsing
      const pulse = 1 + audioValue * 0.5;
      circle.scale.set(pulse, pulse, 1);
      
      // Circle color
      const hue = (i / 7 + t * 0.03) % 1;
      circleMaterial.color.setHSL(hue, 0.8, 0.4 + audioValue * 0.3);
      circleMaterial.opacity = 0.15 + audioValue * 0.2;
      
      // Circle rotation
      circle.rotation.z += 0.001 * (i + 1);
    });
    
    // Sacred lines animation
    sacredLines.forEach((line: THREE.Line, i: number) => {
      const lineMaterial = line.material as THREE.LineBasicMaterial;
      const lineValue = frequencyData[i * 2 % frequencyData.length] / 255;
      
      lineMaterial.opacity = 0.2 + lineValue * 0.3;
      lineMaterial.color.setHSL(0.6, 0.8, 0.5 + lineValue * 0.3);
    });
    
    metatronGroup.rotation.y += 0.001;

    // ==================== FLOATING GEOMETRY ====================
    floatingGeometries.forEach((geo: THREE.Mesh) => {
      const geoData = geo.userData;
      const geoIndex = geoData.index;
      
      const freqIndex = (geoIndex * 4) % frequencyData.length;
      const audioValue = frequencyData[freqIndex] / 255;
      
      // Orbit around center
      const orbitAngle = Math.atan2(geo.position.z, geo.position.x) + 0.01 * (1 + audioValue);
      const orbitRadius = geoData.basePosition.length();
      
      const x = Math.cos(orbitAngle) * orbitRadius;
      const z = Math.sin(orbitAngle) * orbitRadius;
      const y = geoData.basePosition.y + Math.sin(t * 2 + geoData.phase) * 0.5 * bass;
      
      geo.position.set(x, y, z);
      
      // Scaling
      const scale = 1 + audioValue * 0.8;
      geo.scale.set(scale, scale, scale);
      
      // Rotation
      geo.rotation.x += 0.01 * geoData.rotationSpeed * (1 + mid * 0.3);
      geo.rotation.y += 0.01 * geoData.rotationSpeed * (1 + bass * 0.3);
      geo.rotation.z += 0.005 * (1 + treble * 0.2);
      
      // Material
      const geoMaterial = geo.material as THREE.MeshPhongMaterial;
      const hue = (geoIndex / 24 + t * 0.04) % 1;
      geoMaterial.color.setHSL(hue, 0.9, 0.6 + audioValue * 0.3);
      geoMaterial.opacity = 0.7 + audioValue * 0.3;
    });

    // ==================== ENERGY ORBS ====================
    energyOrbs.forEach((orb: THREE.Mesh) => {
      const orbData = orb.userData;
      const orbIndex = orbData.index;
      
      const freqIndex = orbIndex * 6 % frequencyData.length;
      const audioValue = frequencyData[freqIndex] / 255;
      
      // Orb movement
      const orbitAngle = orbData.angle + t * 0.3 * (1 + audioValue);
      const orbitRadius = orbData.radius + Math.sin(t * 1.5 + orbIndex) * 0.3 * bass;
      
      orb.position.x = Math.cos(orbitAngle) * orbitRadius;
      orb.position.z = Math.sin(orbitAngle) * orbitRadius;
      orb.position.y = orbData.basePosition.y + Math.sin(t * 2 + orbData.phase) * 0.4 * mid;
      
      // Orb scaling
      const scale = 1 + audioValue * 1.2;
      orb.scale.set(scale, scale, scale);
      
      // Orb material
      const orbMaterial = orb.material as THREE.MeshBasicMaterial;
      const hue = (orbIndex / 8 + t * 0.06) % 1;
      orbMaterial.color.setHSL(hue, 0.9, 0.6 + audioValue * 0.4);
      orbMaterial.opacity = 0.5 + audioValue * 0.5;
    });

    // ==================== GLOWING PARTICLES ====================
    if (particles) {
      const particleGeometry = particles.geometry;
      const particlePositions = particleGeometry.attributes.position.array as Float32Array;
      const particleColors = particleGeometry.attributes.color.array as Float32Array;
      const basePositions = particles.userData.basePositions;
      const particlePhases = particles.userData.particlePhases;
      const particleCount = particles.userData.particleCount;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const dataIndex = (i * 2) % frequencyData.length;
        const audioValue = frequencyData[dataIndex] / 255;
        const phase = particlePhases[i];
        
        // Particle movement in Fibonacci spiral
        const waveX = Math.sin(t * 1.8 + phase) * 0.3 * bass;
        const waveY = Math.cos(t * 1.5 + phase) * 0.3 * mid;
        const waveZ = Math.sin(t * 2 + phase) * 0.3 * treble;
        
        particlePositions[i3] = basePositions[i3] + waveX;
        particlePositions[i3 + 1] = basePositions[i3 + 1] + waveY;
        particlePositions[i3 + 2] = basePositions[i3 + 2] + waveZ;
        
        // Color animation
        const hue = (i / particleCount + t * 0.02) % 1;
        const brightness = 0.7 + audioValue * 0.3;
        const color = new THREE.Color().setHSL(hue, 0.9, brightness);
        
        particleColors[i3] = color.r;
        particleColors[i3 + 1] = color.g;
        particleColors[i3 + 2] = color.b;
      }
      
      particleGeometry.attributes.position.needsUpdate = true;
      particleGeometry.attributes.color.needsUpdate = true;
      
      // Particle system rotation
      particles.rotation.y += 0.001;
    }

    // ==================== SYSTEM ANIMATION ====================
    obj.rotation.y += 0.001 * (1 + intensity * 0.2);
    obj.rotation.x += Math.sin(t * 0.3) * 0.001 * bass;

    // ==================== BEAT EFFECTS ====================
    if (beatInfo?.isBeat) {
      // Mandala flash
      mandalaGroup.children.forEach((petal: THREE.Mesh) => {
        if (petal.userData.type === "mandalaPetal") {
          const petalMaterial = petal.material as THREE.MeshPhongMaterial;
          petalMaterial.color.setHSL(Math.random(), 1, 0.9);
          petalMaterial.opacity = 1;
          petal.scale.setScalar(0.6);
        }
      });
      
      // Geometry flash
      floatingGeometries.forEach((geo: THREE.Mesh) => {
        geo.scale.setScalar(1.8);
        const geoMaterial = geo.material as THREE.MeshPhongMaterial;
        geoMaterial.color.setHSL(Math.random(), 1, 0.9);
      });
      
      // Energy orbs burst
      energyOrbs.forEach((orb: THREE.Mesh) => {
        orb.scale.setScalar(1.5);
        const orbMaterial = orb.material as THREE.MeshBasicMaterial;
        orbMaterial.color.setHSL(Math.random(), 1, 1);
      });
    }
  });
};