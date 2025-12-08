import * as THREE from "three";

export const animatePlasmaField = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number
): void => {
  const scaledTime = time * 0.001;
  
  // Audio analysis
  const bass = frequencyData[2] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;
  const intensity = (bass + mid + treble) / 3;

  objects.forEach((obj) => {
    // ==================== CENTER SPHERE ====================
    if (obj.userData.isCenterSphere) {
      const sphere = obj as THREE.Mesh;
      const material = sphere.material as THREE.MeshStandardMaterial;
      
      const hue = (scaledTime * 0.05) % 1;
      material.color.setHSL(hue, 0.8, 0.7);
      material.opacity = 0.3 + intensity * 0.2;
      
      // Pulsing with bass
      const pulse = 1 + bass * 0.3;
      sphere.scale.set(pulse, pulse, pulse);
      
      // Gentle rotation
      sphere.rotation.y += 0.002;
      return;
    }

    // ==================== GRID SPHERE ====================
    if (obj.userData.isGridSphere) {
      const gridSphere = obj as THREE.Mesh;
      const material = gridSphere.material as THREE.MeshBasicMaterial;
      
      material.color.setHSL(0.6, 0.9, 0.6 + treble * 0.2);
      material.opacity = 0.1 + mid * 0.15;
      
      gridSphere.scale.setScalar(1 + bass * 0.2);
      gridSphere.rotation.x += 0.001;
      gridSphere.rotation.y += 0.0015;
      return;
    }

    // ==================== ORBIT RINGS ====================
    if (obj.userData.isOrbitRing) {
      const ring = obj as THREE.Line;
      const material = ring.material as THREE.LineBasicMaterial;
      const ringIndex = obj.userData.ringIndex;
      
      const freqIndex = Math.min(ringIndex * 10, frequencyData.length - 1);
      const freqValue = frequencyData[freqIndex] / 255;
      
      const hue = (0.6 + ringIndex * 0.05) % 1;
      material.color.setHSL(hue, 0.8, 0.5 + freqValue * 0.3);
      material.opacity = 0.15 + freqValue * 0.2;
      
      // Gentle pulsing
      const pulse = 1 + Math.sin(scaledTime * 2 + ringIndex) * 0.1 * freqValue;
      ring.scale.setScalar(pulse);
      
      // Slow rotation
      ring.rotation.z += 0.001 * (ringIndex + 1);
      return;
    }

    // ==================== ORBITING PARTICLES ====================
    if (obj instanceof THREE.Points) {
      const geometry = obj.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      const orbitData = geometry.attributes.orbitData.array as Float32Array;
      
      const particleCount = obj.userData.particleCount;
      const baseHue = obj.userData.baseHue;
      
      const hueShift = (baseHue + scaledTime * 0.03) % 1;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const i4 = i * 4;
        
        const dataIndex = Math.floor((i * 2) % frequencyData.length);
        const audioValue = frequencyData[dataIndex] / 255;
        
        // Get orbit data
        const orbitRadius = orbitData[i4];
        const orbitAngle = orbitData[i4 + 1];
        const orbitHeight = orbitData[i4 + 2];
        const orbitSpeed = orbitData[i4 + 3];
        
        // Calculate new position in orbit
        const newAngle = orbitAngle + scaledTime * orbitSpeed * 0.5 * (1 + mid * 0.5);
        const x = Math.cos(newAngle) * orbitRadius;
        const z = Math.sin(newAngle) * orbitRadius;
        
        // Add vertical wave motion based on audio
        const verticalWave = Math.sin(scaledTime * 1.5 + i * 0.01) * 0.5 * bass;
        const y = orbitHeight + verticalWave;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        // Color based on orbit radius and audio
        const radiusHue = hueShift + (orbitRadius / 9) * 0.2;
        const hue = radiusHue % 1;
        const brightness = 0.7 + audioValue * 0.2;
        const color = new THREE.Color().setHSL(hue, 0.8, brightness);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Size based on treble and position
        sizes[i] = 0.1 + treble * 0.15 + Math.sin(scaledTime * 2 + i * 0.05) * 0.02;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;

      // Gentle overall rotation
      obj.rotation.y += 0.0003;
      
      // Scale entire particle system with intensity
      const systemScale = 1 + Math.sin(scaledTime) * 0.05 * intensity;
      obj.scale.setScalar(systemScale);
    }
  });
};