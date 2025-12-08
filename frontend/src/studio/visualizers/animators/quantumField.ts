import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateQuantumField = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const scaledTime = time * 0.001; // Convert to seconds for smooth animation
  
  // Get more frequency bands - PROPERLY SYNCED
  const bass = frequencyData[0] / 255;
  const bassMid = frequencyData[20] / 255;
  const mid = frequencyData[50] / 255;
  const midHigh = frequencyData[80] / 255;
  const treble = frequencyData[120] / 255;
  const highTreble = frequencyData[200] / 255;
  
  const intensity = (bass + mid + treble) / 3;
  const peakIntensity = Math.max(bass, mid, treble);

  // CAMERA - SYNCED TO AUDIO
  if (camera) {
    const cameraShakeX = Math.sin(scaledTime * 15) * 0.3 * bass;
    const cameraShakeY = Math.cos(scaledTime * 12) * 0.3 * mid;
    const cameraZoom = 15 + Math.sin(scaledTime * 0.5) * 2 - intensity * 4;
    
    camera.position.x = Math.sin(scaledTime * 0.5) * 10 + cameraShakeX;
    camera.position.y = Math.cos(scaledTime * 0.4) * 6 + cameraShakeY;
    camera.position.z = cameraZoom;
    
    // Camera look-at point moves with audio
    const lookAtX = Math.sin(scaledTime * 0.8) * 2 * bass;
    const lookAtY = Math.cos(scaledTime * 0.6) * 1.5 * mid;
    camera.lookAt(lookAtX, lookAtY, 0);
    
    // Camera FOV reacts to treble - PROPERLY SYNCED
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 60 + treble * 8;
      camera.updateProjectionMatrix();
    }
  }

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Points) || obj.userData.type !== "quantumField")
      return;

    const geometry = obj.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute("position");
    const colorAttr = geometry.getAttribute("color");
    const sizeAttr = geometry.getAttribute("size");

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;
    const originalPositions = obj.userData.originalPositions as Float32Array;
    const quantumStates = obj.userData.quantumStates as number[];
    const entanglementGroups = obj.userData.entanglementGroups as number[];

    // PROPERLY SYNCED INTENSITY
    const audioIntensity = params.intensity * 0.03 * (1 + peakIntensity);
    const quantumSpeed = params.speed * 0.001 * (1 + mid * 0.5);

    // Update color phase - SYNCED
    obj.userData.colorPhase = (obj.userData.colorPhase + 0.01) % 1;

    for (let i = 0; i < obj.userData.particleCount; i++) {
      const i3 = i * 3;
      
      // Use multiple frequency bands - SYNCED
      const freqIndex1 = Math.floor((i * 1.5) % frequencyData.length);
      const freqIndex2 = Math.floor((i * 2.3) % frequencyData.length);
      const freqIndex3 = Math.floor((i * 3.7) % frequencyData.length);
      
      const energy1 = frequencyData[freqIndex1] / 255;
      const energy2 = frequencyData[freqIndex2] / 255;
      const energy3 = frequencyData[freqIndex3] / 255;
      
      const combinedEnergy = (energy1 + energy2 + energy3) / 3;
      const peakEnergy = Math.max(energy1, energy2, energy3);

      // WAVE FUNCTIONS - PROPERLY TIMED
      const waveFunction1 = Math.sin(scaledTime * 2 + quantumStates[i]) * combinedEnergy * audioIntensity;
      const waveFunction2 = Math.cos(scaledTime * 1.7 + quantumStates[i] * 1.2) * energy2 * audioIntensity;
      const waveFunction3 = Math.sin(scaledTime * 2.5 + quantumStates[i] * 1.8) * energy3 * audioIntensity;
      
      // POSITION - SYNCED TO AUDIO
      positions[i3] = originalPositions[i3] +
        Math.sin(scaledTime * 1.5 + quantumStates[i]) * waveFunction1 * (1 + bass) +
        Math.cos(scaledTime * 1.2 + i * 0.005) * 0.3 * bass +
        Math.sin(scaledTime * 2 + quantumStates[i]) * 0.2 * mid;
      
      positions[i3 + 1] = originalPositions[i3 + 1] +
        Math.cos(scaledTime * 1.8 + quantumStates[i]) * waveFunction2 * (1 + mid) +
        Math.sin(scaledTime * 1.5 + i * 0.007) * 0.4 * mid +
        Math.cos(scaledTime * 1.3 + quantumStates[i]) * 0.3 * bass;
      
      positions[i3 + 2] = originalPositions[i3 + 2] +
        Math.sin(scaledTime * 1.3 + quantumStates[i]) * waveFunction3 * (1 + treble * 0.8) +
        Math.cos(scaledTime * 2.2 + i * 0.004) * 0.3 * treble +
        Math.sin(scaledTime * 1.8 + quantumStates[i]) * 0.2 * highTreble;

      // ENTANGLEMENT GROUPS - SYNCED
      const group = entanglementGroups[i];
      const groupPhase = Math.sin(scaledTime * 1.2 + group) * (0.5 + combinedEnergy * 0.5);
      
      // Different groups move differently - ALL SYNCED
      if (group === 0) {
        // Bass group
        positions[i3] += groupPhase * bass * 1.2;
        positions[i3 + 1] += groupPhase * bass * 0.8;
      } else if (group === 1) {
        // Mid group
        positions[i3 + 1] += groupPhase * mid * 1.2;
        positions[i3 + 2] += groupPhase * mid * 0.8;
      } else if (group === 2) {
        // Treble group
        positions[i3] += groupPhase * treble * 1;
        positions[i3 + 2] += groupPhase * treble * 1.2;
      } else {
        // Mixed group
        positions[i3] += groupPhase * bass * 0.5;
        positions[i3 + 1] += groupPhase * mid * 0.5;
        positions[i3 + 2] += groupPhase * treble * 0.5;
      }

      // COLOR - SYNCED TO MUSIC
      const hue = (
        i / obj.userData.particleCount + 
        scaledTime * 0.1 + 
        obj.userData.colorPhase +
        combinedEnergy * 0.3
      ) % 1;
      
      const saturation = 0.8 + combinedEnergy * 0.3;
      const lightness = 0.5 + combinedEnergy * 0.4 + Math.sin(scaledTime * 2 + i * 0.001) * 0.1;
      
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // SIZE - SYNCED TO AUDIO
      const baseSize = 0.1;
      const energySize = combinedEnergy * 0.6;
      const bassSize = bass * 0.4;
      const trebleSize = treble * 0.3;
      const pulseSize = Math.sin(scaledTime * 3 + quantumStates[i]) * 0.1;
      
      sizes[i] = (baseSize + energySize + bassSize + trebleSize + pulseSize) * (1 + peakIntensity * 0.2);

      // PEAK REACTIONS - SYNCED
      if (peakEnergy > 0.8) {
        // Flash on peaks
        colors[i3] = 0.8 + Math.random() * 0.2;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 0.8 + Math.random() * 0.2;
        
        // Size increase
        sizes[i] *= 1.5;
        
        // Movement on peaks
        const peakForce = (peakEnergy - 0.8) * 2;
        positions[i3] += (Math.random() - 0.5) * peakForce;
        positions[i3 + 1] += (Math.random() - 0.5) * peakForce;
        positions[i3 + 2] += (Math.random() - 0.5) * peakForce;
      }
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    // ROTATION - SYNCED
    obj.rotation.x += quantumSpeed * mid;
    obj.rotation.y += quantumSpeed * bass * 1.2;
    obj.rotation.z += quantumSpeed * treble;

    // OVERALL PULSING - SYNCED
    const overallPulse = 1 + Math.sin(scaledTime * 1.5) * 0.1 * intensity;
    obj.scale.set(overallPulse, overallPulse, overallPulse);

    // BEAT EFFECTS - PROPERLY SYNCED
    if (beatInfo?.isBeat) {
      // Particle burst on beat
      for (let i = 0; i < obj.userData.particleCount; i += 8) {
        const i3 = i * 3;
        const beatForce = 2;
        
        positions[i3] += (Math.random() - 0.5) * bass * beatForce;
        positions[i3 + 1] += (Math.random() - 0.5) * mid * beatForce;
        positions[i3 + 2] += (Math.random() - 0.5) * treble * beatForce;
        
        // Color flash on beat
        colors[i3] = 0.9 + Math.random() * 0.1;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
        
        // Size increase on beat
        sizes[i] *= 1.3;
      }
      
      // Rotation bump on beat
      obj.rotation.x += 0.05 * bass;
      obj.rotation.y += 0.06 * mid;
      
      // Scale bump on beat
      obj.scale.set(1.15, 1.15, 1.15);
      
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
    }

    // BASS RUMBLE - SYNCED
    if (bass > 0.6) {
      const rumble = (bass - 0.6) * 0.3;
      for (let i = 0; i < obj.userData.particleCount; i += 25) {
        const i3 = i * 3;
        positions[i3 + 1] += (Math.random() - 0.5) * rumble;
      }
      posAttr.needsUpdate = true;
    }

    // TREBLE JITTER - SYNCED
    if (treble > 0.7) {
      const jitter = (treble - 0.7) * 0.2;
      for (let i = 0; i < obj.userData.particleCount; i += 20) {
        const i3 = i * 3;
        positions[i3] += (Math.random() - 0.5) * jitter;
        positions[i3 + 2] += (Math.random() - 0.5) * jitter;
      }
      posAttr.needsUpdate = true;
    }

    // CENTER ATTRACTION - KEEPS PARTICLES ORGANIZED
    for (let i = 0; i < obj.userData.particleCount; i += 40) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      const distance = Math.sqrt(x*x + y*y + z*z);
      
      if (distance > 10) {
        const pullForce = 0.01 * (distance - 10);
        positions[i3] -= (x / distance) * pullForce;
        positions[i3 + 1] -= (y / distance) * pullForce;
        positions[i3 + 2] -= (z / distance) * pullForce;
      }
    }
    posAttr.needsUpdate = true;
  });
};