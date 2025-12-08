import * as THREE from "three";

interface CosmicObjectData {
  isNode?: boolean;
  isConnection?: boolean;
  index?: number;
  distance?: number;
  basePosition?: THREE.Vector3;
  pulsePhase?: number;
  connectionStrength?: number;
  velocity?: THREE.Vector3;
  audioForce?: THREE.Vector3;
  resonance?: number;
  mass?: number;
  neighborCount?: number;
}

export const animateCosmicWeb = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  audioIntensity: number = 1,
  reactionSpeed: number = 0.8,
  movementScale: number = 2,
  gravityStrength: number = 0.1,
  attractionForce: number = 0.5
): void => {
  const scaledTime = time * 0.001;
  const normalizedIntensity = Math.min(audioIntensity, 2);
  
  // Analyze frequency bands for different movement types
  const bassRange = frequencyData.slice(0, Math.floor(frequencyData.length * 0.1));
  const midRange = frequencyData.slice(
    Math.floor(frequencyData.length * 0.1),
    Math.floor(frequencyData.length * 0.6)
  );
  const highRange = frequencyData.slice(Math.floor(frequencyData.length * 0.6));
  
  const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
  const midEnergy = midRange.reduce((sum, val) => sum + val, 0) / midRange.length / 255;
  const highEnergy = highRange.reduce((sum, val) => sum + val, 0) / highRange.length / 255;
  
  // Calculate rhythm patterns
  const kickDetected = bassEnergy > 0.7;
  const snareDetected = midEnergy > 0.6 && highEnergy > 0.4;
  const hihatDetected = highEnergy > 0.5;
  
  // Global movement forces based on audio
  const globalForce = new THREE.Vector3(
    Math.sin(scaledTime * 0.5) * bassEnergy * 0.5,
    Math.cos(scaledTime * 0.7) * midEnergy * 0.3,
    Math.sin(scaledTime * 0.3) * highEnergy * 0.2
  ).multiplyScalar(movementScale);

  // Apply audio-driven physics to all objects first
  objects.forEach((obj) => {
    const userData = obj.userData as CosmicObjectData;
    
    // Initialize physics properties
    if (!userData.velocity) userData.velocity = new THREE.Vector3();
    if (!userData.audioForce) userData.audioForce = new THREE.Vector3();
    if (!userData.mass) userData.mass = 0.5 + Math.random() * 1.5;
    if (!userData.resonance) userData.resonance = 0.8 + Math.random() * 0.4;
    if (!userData.basePosition && obj.position) {
      userData.basePosition = obj.position.clone();
    }
    if (userData.pulsePhase === undefined) {
      userData.pulsePhase = Math.random() * Math.PI * 2;
    }
    
    // Calculate audio forces
    calculateAudioForces(obj, userData, frequencyData, scaledTime, {
      bassEnergy,
      midEnergy,
      highEnergy,
      kickDetected,
      snareDetected,
      hihatDetected,
      movementScale
    });
  });

  // Then update positions with physics
  objects.forEach((obj) => {
    const userData = obj.userData as CosmicObjectData;
    
    if (userData.isNode && obj instanceof THREE.Mesh) {
      animateNodeWithPhysics(obj, userData, frequencyData, scaledTime, {
        bassEnergy,
        midEnergy,
        highEnergy,
        kickDetected,
        snareDetected,
        hihatDetected,
        globalForce,
        gravityStrength,
        normalizedIntensity,
        movementScale
      }, objects);
    } else if (userData.isConnection && obj instanceof THREE.Line) {
      animateConnectionWithPhysics(obj, userData, frequencyData, {
        bassEnergy,
        midEnergy,
        highEnergy,
        kickDetected,
        normalizedIntensity
      });
    }
  });
};

interface AudioAnalysis {
  bassEnergy: number;
  midEnergy: number;
  highEnergy: number;
  kickDetected: boolean;
  snareDetected: boolean;
  hihatDetected: boolean;
  movementScale: number;
}

const calculateAudioForces = (
  obj: THREE.Object3D,
  userData: CosmicObjectData,
  frequencyData: Uint8Array,
  scaledTime: number,
  analysis: AudioAnalysis
): void => {
  const index = userData.index || 0;
  const timeOffset = scaledTime + index * 0.1;
  
  // Bass force - slow, powerful movements
  const bassForce = new THREE.Vector3(
    Math.sin(timeOffset * 0.3) * analysis.bassEnergy,
    Math.cos(timeOffset * 0.4) * analysis.bassEnergy,
    Math.sin(timeOffset * 0.5) * analysis.bassEnergy
  ).multiplyScalar(analysis.movementScale * 2);

  // Mid force - rhythmic pulsing
  const midForce = new THREE.Vector3(
    Math.sin(timeOffset * 2) * analysis.midEnergy,
    Math.cos(timeOffset * 1.8) * analysis.midEnergy,
    Math.sin(timeOffset * 2.2) * analysis.midEnergy
  ).multiplyScalar(analysis.movementScale * 1.5);

  // High force - rapid, shimmering movements
  const highForce = new THREE.Vector3(
    Math.sin(timeOffset * 8) * analysis.highEnergy,
    Math.cos(timeOffset * 7) * analysis.highEnergy,
    Math.sin(timeOffset * 9) * analysis.highEnergy
  ).multiplyScalar(analysis.movementScale);

  // Special rhythm forces
  if (analysis.kickDetected) {
    const kickForce = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 1.5,
      (Math.random() - 0.5) * 2
    ).multiplyScalar(analysis.bassEnergy * 3);
    bassForce.add(kickForce);
  }

  if (analysis.snareDetected) {
    const snareForce = new THREE.Vector3(
      Math.sin(timeOffset * 10),
      Math.cos(timeOffset * 10),
      0
    ).multiplyScalar(analysis.midEnergy * 2);
    midForce.add(snareForce);
  }

  if (analysis.hihatDetected) {
    const hihatForce = new THREE.Vector3(
      Math.sin(timeOffset * 20) * 0.3,
      Math.cos(timeOffset * 18) * 0.3,
      Math.sin(timeOffset * 22) * 0.3
    ).multiplyScalar(analysis.highEnergy * 1.5);
    highForce.add(hihatForce);
  }

  // Combine all forces with resonance
  userData.audioForce!.copy(bassForce).add(midForce).add(highForce);
  userData.audioForce!.multiplyScalar(userData.resonance!);
};

interface NodePhysicsParams {
  bassEnergy: number;
  midEnergy: number;
  highEnergy: number;
  kickDetected: boolean;
  snareDetected: boolean;
  hihatDetected: boolean;
  globalForce: THREE.Vector3;
  gravityStrength: number;
  normalizedIntensity: number;
  movementScale: number;
}

const animateNodeWithPhysics = (
  obj: THREE.Mesh,
  userData: CosmicObjectData,
  frequencyData: Uint8Array,
  scaledTime: number,
  params: NodePhysicsParams,
  allObjects: THREE.Object3D[]
): void => {
  const index = userData.index || 0;
  const timeOffset = scaledTime + index * 0.1;

  // Apply physics forces
  const gravity = new THREE.Vector3(0, -params.gravityStrength * userData.mass!, 0);
  
  // Attraction to base position (spring-like behavior)
  const toBase = new THREE.Vector3();
  if (userData.basePosition) {
    toBase.subVectors(userData.basePosition, obj.position);
    toBase.multiplyScalar(0.05 * userData.mass!);
  }

  // Calculate repulsion from other nodes (avoid clustering)
  const repulsion = new THREE.Vector3();
  allObjects.forEach((otherObj) => {
    const otherData = otherObj.userData as CosmicObjectData;
    if (otherData.isNode && otherObj !== obj) {
      const distance = obj.position.distanceTo(otherObj.position);
      if (distance < 2) {
        const direction = new THREE.Vector3()
          .subVectors(obj.position, otherObj.position)
          .normalize()
          .multiplyScalar(1 / (distance * distance) * 0.1);
        repulsion.add(direction);
      }
    }
  });

  // Add audio-driven rhythmic forces
  const rhythmForce = new THREE.Vector3();
  if (params.kickDetected) {
    rhythmForce.y += params.bassEnergy * 2;
  }
  if (params.snareDetected) {
    rhythmForce.x += Math.sin(timeOffset * 5) * params.midEnergy;
    rhythmForce.z += Math.cos(timeOffset * 5) * params.midEnergy;
  }

  // Combine all forces
  const totalForce = new THREE.Vector3()
    .add(userData.audioForce!)
    .add(gravity)
    .add(toBase)
    .add(repulsion)
    .add(rhythmForce)
    .add(params.globalForce);

  // Update velocity (with damping)
  userData.velocity!.add(totalForce.multiplyScalar(1 / userData.mass!));
  userData.velocity!.multiplyScalar(0.95); // Damping

  // Update position
  obj.position.add(userData.velocity!);

  // Rotation based on velocity
  const speed = userData.velocity!.length();
  obj.rotation.x += speed * 0.1 * params.midEnergy;
  obj.rotation.y += speed * 0.15 * params.bassEnergy;
  obj.rotation.z += speed * 0.08 * params.highEnergy;

  // Scale with audio energy
  const baseScale = 0.7 + params.bassEnergy * 0.5;
  const pulseScale = Math.sin(scaledTime * 4 + userData.pulsePhase!) * params.midEnergy * 0.3;
  const shakeScale = (Math.random() - 0.5) * params.highEnergy * 0.2;
  const scaleValue = baseScale + pulseScale + shakeScale;
  
  obj.scale.setScalar(scaleValue * params.normalizedIntensity);

  // Material effects synchronized with movement
  if (obj.material instanceof THREE.MeshPhongMaterial) {
    // Emissive intensity based on speed and audio
    const speedIntensity = Math.min(speed * 2, 1);
    const emissiveValue = 0.3 + 
      params.bassEnergy * 0.4 + 
      speedIntensity * 0.3 + 
      params.highEnergy * 0.2;
    
    obj.material.emissiveIntensity = Math.min(emissiveValue, 1.5);

    // Color based on velocity direction
    const velocityColor = new THREE.Color().setHSL(
      Math.atan2(userData.velocity!.y, userData.velocity!.x) / (Math.PI * 2),
      0.8,
      0.5 + params.midEnergy * 0.3
    );
    obj.material.emissive.lerp(velocityColor, 0.1);

    // Opacity pulsing with rhythm
    obj.material.opacity = 0.9 + Math.sin(scaledTime * 8) * 0.1 * params.highEnergy;
  }

  // Special effects for strong audio events
  if (params.kickDetected) {
    obj.position.y += Math.sin(scaledTime * 20) * 0.2 * params.bassEnergy;
  }
  if (params.hihatDetected) {
    const jitter = new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    ).multiplyScalar(params.highEnergy);
    obj.position.add(jitter);
  }
};

interface ConnectionPhysicsParams {
  bassEnergy: number;
  midEnergy: number;
  highEnergy: number;
  kickDetected: boolean;
  normalizedIntensity: number;
}

const animateConnectionWithPhysics = (
  obj: THREE.Line,
  userData: CosmicObjectData,
  frequencyData: Uint8Array,
  params: ConnectionPhysicsParams
): void => {
  const distance = userData.distance || 3;
  const normalizedDistance = Math.min(distance / 10, 1);
  const falloff = 1 - normalizedDistance * 0.6;

  // Audio-responsive opacity
  const bassOpacity = params.bassEnergy * 0.5 * falloff;
  const midOpacity = params.midEnergy * 0.4 * falloff;
  const highOpacity = params.highEnergy * 0.3 * falloff;
  
  const baseOpacity = 0.1 + Math.sin(Date.now() * 0.001) * 0.05;
  const totalOpacity = Math.min(
    baseOpacity + bassOpacity + midOpacity + highOpacity,
    0.8
  ) * params.normalizedIntensity;

  if (obj.material instanceof THREE.LineBasicMaterial) {
    obj.material.opacity = totalOpacity;
    
    // Dynamic line properties
    obj.material.linewidth = 0.5 + params.bassEnergy * 3;
    
    // Color pulse with audio
    const colorPulse = 1 + Math.sin(Date.now() * 0.002) * params.midEnergy * 0.3;
    obj.material.color.multiplyScalar(colorPulse);
    
    // Dash effect for high frequencies
    if (params.highEnergy > 0.6) {
      obj.material.opacity *= 0.8 + Math.sin(Date.now() * 0.02) * 0.2;
    }
  }

  // Animate line vertices with audio-driven waves
  if (obj.geometry) {
    const positions = obj.geometry.attributes.position;
    if (positions) {
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < positions.count; i++) {
        const ratio = i / positions.count;
        
        // Bass wave - slow, large movements
        const bassWave = Math.sin(time * 0.5 + ratio * Math.PI) * params.bassEnergy * 0.5;
        
        // Mid wave - rhythmic patterns
        const midWave = Math.sin(time * 3 + ratio * Math.PI * 2) * params.midEnergy * 0.3;
        
        // High wave - rapid vibrations
        const highWave = Math.sin(time * 10 + ratio * Math.PI * 3) * params.highEnergy * 0.2;
        
        // Combine waves
        const totalWave = bassWave + midWave + highWave;
        
        // Apply to all axes for organic movement
        positions.setX(i, positions.getX(i) + totalWave * 0.1);
        positions.setY(i, positions.getY(i) + Math.cos(time * 2 + ratio) * totalWave * 0.1);
        positions.setZ(i, positions.getZ(i) + Math.sin(time * 1.5 + ratio) * totalWave * 0.1);
      }
      positions.needsUpdate = true;
    }
  }

  // React to kick events
  if (params.kickDetected && obj.geometry) {
    const positions = obj.geometry.attributes.position;
    const center = new THREE.Vector3();
    obj.geometry.computeBoundingBox();
    if (obj.geometry.boundingBox) {
      obj.geometry.boundingBox.getCenter(center);
    }
    
    for (let i = 0; i < positions.count; i++) {
      const point = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      
      // Push vertices away from center on kick
      const direction = new THREE.Vector3().subVectors(point, center).normalize();
      positions.setX(i, point.x + direction.x * params.bassEnergy * 0.2);
      positions.setY(i, point.y + direction.y * params.bassEnergy * 0.2);
      positions.setZ(i, point.z + direction.z * params.bassEnergy * 0.2);
    }
    positions.needsUpdate = true;
  }
};