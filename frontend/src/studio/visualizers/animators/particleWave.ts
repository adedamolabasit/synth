import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";
import { beatPulse } from "../../effects/gsapAnimations";

export const animateParticleWave = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
) => {
  const scaledTime = time * 0.001;
  
  const bass = frequencyData[2] / 255;
  const mid = frequencyData[50] / 255;
  const treble = frequencyData[120] / 255;
  
  const intensity = (bass + mid + treble) / 3;

  if (camera) {
    camera.position.x = Math.sin(scaledTime * 0.2) * 3;
    camera.position.y = Math.cos(scaledTime * 0.1) * 1;
    camera.position.z = 12;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (obj instanceof THREE.Points) {
      const geometry = obj.geometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");

      const positions = posAttr.array;
      const colors = colorAttr.array;
      const original = obj.userData.originalPositions;
      const phases = obj.userData.phases;

      const baseHue = obj.userData.baseHue;
      const hueShift = (baseHue + scaledTime * 0.05) % 1;

      for (let i = 0; i < original.length; i += 3) {
        const idx = i / 3;
        const px = original[i];
        const py = original[i + 1];
        const pz = original[i + 2];
        const phase = phases[idx];

        const wave = Math.sin(scaledTime + phase) * 1.5;
        const lift = Math.sin(scaledTime * 0.5 + px * 0.1) * bass * 3;

        positions[i] = px + Math.cos(scaledTime + phase) * 0.5;
        positions[i + 1] = py + lift + wave * 0.3;
        positions[i + 2] = pz + Math.sin(scaledTime + phase) * 0.5;

        const brightness = 0.7 + bass * 0.2;
        const c = new THREE.Color().setHSL(hueShift, 0.8, brightness);
        
        colors[i] = c.r;
        colors[i + 1] = c.g;
        colors[i + 2] = c.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      obj.rotation.y += 0.001;

      if (beatInfo?.isBeat) {
        beatPulse(obj, 1.2);
      }
    }

    if (obj.userData.isDisc) {
      const discMaterial = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const discColor = new THREE.Color().setHSL(
        (scaledTime * 0.1) % 1,
        0.7,
        0.2 + bass * 0.1
      );
      discMaterial.color.copy(discColor);
      discMaterial.opacity = 0.7 + treble * 0.2;
    }

    if (obj.userData.isCircle) {
      const circle = obj as THREE.Line;
      const circleMaterial = circle.material as THREE.LineBasicMaterial;
      
      circleMaterial.color.setHSL(0.55, 0.9, 0.5 + mid * 0.3);
      circleMaterial.opacity = 0.6 + treble * 0.3;
      
      const pulse = 1 + Math.sin(scaledTime * 2) * 0.1 * bass;
      circle.scale.set(pulse, pulse, pulse);
      
      circle.rotation.z += 0.002;
    }

    if (obj.userData.isLightOrb) {
      const orbIndex = obj.userData.orbIndex;
      const freqIndex = Math.floor(orbIndex * 3);
      const freqValue = frequencyData[freqIndex * 15] / 255;
      
      const orbMaterial = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const baseHue = orbIndex / 6;
      const hue = (baseHue + scaledTime * 0.05) % 1;
      
      orbMaterial.color.setHSL(hue, 0.9, 0.6 + freqValue * 0.2);
      orbMaterial.opacity = 0.5 + freqValue * 0.3;
      
      const scale = 1 + freqValue * 0.5;
      obj.scale.set(scale, scale, scale);
      
      const float = Math.sin(scaledTime * 2 + orbIndex) * 0.5 * freqValue;
      obj.position.y = -4 + float;
      
      obj.rotation.y += 0.01;
    }

    if (obj.userData.isCenterOrb) {
      const centerOrbMaterial = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      
      const hue = (scaledTime * 0.15) % 1;
      centerOrbMaterial.color.setHSL(hue, 0.8, 0.8);
      centerOrbMaterial.opacity = 0.4 + intensity * 0.4;
      
      const scale = 1 + bass * 0.8;
      obj.scale.set(scale, scale, scale);
      
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.008;
    }
  });
};