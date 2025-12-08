import * as THREE from "three";

export const animateCrystalLattice = (
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
    if (obj.userData.isCenterOrb) {
      const centerOrbMaterial = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      
      const hue = (scaledTime * 0.1) % 1;
      centerOrbMaterial.color.setHSL(hue, 0.9, 0.7);
      centerOrbMaterial.opacity = 0.3 + intensity * 0.4;
      
      const scale = 1 + bass * 0.8;
      obj.scale.set(scale, scale, scale);
      
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.008;
      return;
    }
    
    if (obj.userData.isRing) {
      const ringIndex = obj.userData.ringIndex;
      const freqValue = frequencyData[10 + ringIndex * 15] / 255;
      
      const ring = obj as THREE.Line;
      const ringMaterial = ring.material as THREE.LineBasicMaterial;
      
      ringMaterial.color.setHSL(0.55, 0.8, 0.5 + freqValue * 0.3);
      ringMaterial.opacity = 0.2 + freqValue * 0.4;
      
      const pulse = 1 + Math.sin(scaledTime * 2 + ringIndex) * 0.2 * bass;
      obj.scale.set(pulse, pulse, pulse);
      
      obj.rotation.z += 0.002 * (ringIndex + 1);
      return;
    }

    if (!(obj instanceof THREE.Mesh) || !obj.userData.crystalIndex) return;

    const {
      basePosition,
      angle,
      radius,
      layer,
      floatSpeed,
      rotationSpeed,
      phase,
      crystalIndex,
      baseHue,
    } = obj.userData;
    
    const dataIndex = Math.floor((crystalIndex + layer * 10) % frequencyData.length);
    const audioValue = frequencyData[dataIndex] / 255;

    const twist = scaledTime * 0.1 + layer * 0.05;
    obj.position.x = Math.cos(angle + twist) * radius;
    obj.position.z = Math.sin(angle + twist) * radius;
    obj.position.y = basePosition.y + Math.sin(scaledTime * floatSpeed + phase) * 0.3 * audioValue;

    obj.rotation.x += 0.01 * rotationSpeed * (1 + mid * 0.5);
    obj.rotation.y += 0.01 * rotationSpeed * (1 + bass * 0.5);
    obj.rotation.z += 0.005 * (1 + treble * 0.3);

    const scale = 0.5 + audioValue * 1;
    obj.scale.set(scale, scale, scale);

    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (baseHue + scaledTime * 0.05 + audioValue * 0.1) % 1;
      obj.material.color.setHSL(hue, 0.8, 0.6 + audioValue * 0.3);
      obj.material.emissive.setHSL(hue, 0.6, audioValue * 0.3);
      obj.material.opacity = 0.8 + audioValue * 0.2;
    }
  });
};