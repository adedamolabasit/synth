import * as THREE from "three";

export const animateVoronoiCells = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;
  
  // Get more frequency bands
  const bass = frequencyData[0] / 255;
  const bassMid = frequencyData[20] / 255;
  const mid = frequencyData[50] / 255;
  const midHigh = frequencyData[80] / 255;
  const treble = frequencyData[120] / 255;
  const intensity = (bass + mid + treble) / 3;

  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      const rotationSpeed = obj.userData.rotationSpeed || 0.01;
      
      // Use multiple frequency bands for each cell
      const dataIndex1 = Math.floor((index * 2) % frequencyData.length);
      const dataIndex2 = Math.floor((index * 3) % frequencyData.length);
      const dataIndex3 = Math.floor((index * 4) % frequencyData.length);
      
      const audioValue1 = frequencyData[dataIndex1] / 255;
      const audioValue2 = frequencyData[dataIndex2] / 255;
      const audioValue3 = frequencyData[dataIndex3] / 255;
      
      const combinedAudio = (audioValue1 + audioValue2 + audioValue3) / 3;

      // More intense rotation based on multiple frequencies
      obj.rotation.x += rotationSpeed * (1 + bass * 2);
      obj.rotation.y += rotationSpeed * 0.7 * (1 + mid * 1.5);
      obj.rotation.z += rotationSpeed * 0.3 * (1 + treble);
      
      // More dramatic scaling
      const scalePulse = Math.sin(scaledTime * 3 + index) * 0.2 * bass;
      const baseScale = 0.8 + combinedAudio * 1.5;
      const scale = baseScale + scalePulse;
      obj.scale.set(scale, scale, scale);

      // Position movement with audio
      const moveX = Math.sin(scaledTime * 2 + index) * 0.3 * audioValue1;
      const moveY = Math.cos(scaledTime * 1.5 + index) * 0.3 * audioValue2;
      const moveZ = Math.sin(scaledTime * 1.8 + index) * 0.3 * audioValue3;
      
      obj.position.x += moveX * 0.1;
      obj.position.y += moveY * 0.1;
      obj.position.z += moveZ * 0.1;

      // Clamp position to prevent drifting too far
      const maxDistance = 10;
      const distance = obj.position.length();
      if (distance > maxDistance) {
        obj.position.normalize().multiplyScalar(maxDistance);
      }

      // More dynamic color changes
      if (obj.material instanceof THREE.MeshPhongMaterial) {
        const hueShift = (index / objects.length + scaledTime * 0.1 + bass * 0.3) % 1;
        const saturation = 0.8 + audioValue1 * 0.4;
        const brightness = 0.5 + combinedAudio * 0.5 + Math.sin(scaledTime * 4 + index) * 0.1;
        
        obj.material.color.setHSL(hueShift, saturation, brightness);
        
        // Add emissive glow based on audio
        obj.material.emissive = new THREE.Color().setHSL(
          (hueShift + 0.5) % 1,
          0.6,
          combinedAudio * 0.4
        );
        obj.material.emissiveIntensity = combinedAudio * 0.8;
        
        // Opacity reacts to treble
        obj.material.opacity = 0.7 + treble * 0.3;
        
        // Wireframe toggle on high audio
        if (combinedAudio > 0.8 && Math.random() < 0.1) {
          obj.material.wireframe = !obj.material.wireframe;
        }
        
        // Flash on very high frequencies
        if (audioValue3 > 0.9) {
          obj.material.color.setHSL(Math.random(), 1, 0.9);
          obj.scale.setScalar(scale * 1.3);
        }
      }

      // Beat-like pulsing based on intensity peaks
      if (combinedAudio > 0.7) {
        const pulse = 1.2 + (combinedAudio - 0.7) * 0.5;
        obj.scale.setScalar(scale * pulse);
        
        if (obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.color.setHSL(Math.random(), 1, 0.8);
          obj.material.opacity = 0.9;
        }
      }

      // Visual feedback for different frequency ranges
      if (bass > 0.6) {
        // Bass makes cells rotate faster
        obj.rotation.x += 0.02;
        obj.rotation.y += 0.015;
      }
      
      if (treble > 0.6) {
        // Treble makes cells jitter
        const jitterX = (Math.random() - 0.5) * 0.1 * treble;
        const jitterY = (Math.random() - 0.5) * 0.1 * treble;
        obj.position.x += jitterX;
        obj.position.y += jitterY;
      }
    }
  });

  // Overall system animation
  objects.forEach((obj, index) => {
    if (obj instanceof THREE.Mesh) {
      // Gentle overall movement pattern
      const orbitX = Math.sin(scaledTime * 0.3 + index * 0.1) * 0.5 * intensity;
      const orbitZ = Math.cos(scaledTime * 0.3 + index * 0.1) * 0.5 * intensity;
      
      obj.position.x += orbitX * 0.05;
      obj.position.z += orbitZ * 0.05;
      
      // Center-seeking force to keep cells from drifting too far
      const center = new THREE.Vector3(0, 0, 0);
      const toCenter = center.clone().sub(obj.position);
      const distanceToCenter = toCenter.length();
      
      if (distanceToCenter > 8) {
        const pullForce = 0.01 * (distanceToCenter - 8);
        obj.position.add(toCenter.normalize().multiplyScalar(pullForce));
      }
    }
  });
};