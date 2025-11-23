// creators/dimensionalGateway.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createDimensionalGatewayVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const gatewayGroup = new THREE.Group();
  
  // Main gateway structure
  const gatewayGeometry = new THREE.TorusKnotGeometry(4, 1, 128, 16, 2, 3);
  const gatewayMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00ffff,
    emissive: 0x0088ff,
    emissiveIntensity: 0.3,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
    transmission: 0.4,
    side: THREE.DoubleSide
  });
  
  const mainGateway = new THREE.Mesh(gatewayGeometry, gatewayMaterial);
  gatewayGroup.add(mainGateway);

  // Portal energy field
  const portalGeometry = new THREE.SphereGeometry(6, 32, 32);
  const portalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      bass: { value: 0 },
      mid: { value: 0 },
      treble: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float bass;
      uniform float mid;
      uniform float treble;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        float energy = bass * 2.0 + mid * 1.5 + treble;
        
        // Portal ripple effect
        float ripple = sin(dist * 20.0 - time * 5.0) * 0.5 + 0.5;
        vec3 color1 = vec3(0.0, 0.8, 1.0);
        vec3 color2 = vec3(0.8, 0.0, 1.0);
        vec3 finalColor = mix(color1, color2, ripple);
        
        // Energy pulses
        float pulse = sin(time * 3.0) * 0.3 + 0.7;
        finalColor *= pulse + energy;
        
        // Radial gradient
        float alpha = (1.0 - dist) * (0.3 + energy * 0.5);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });

  const portalField = new THREE.Mesh(portalGeometry, portalMaterial);
  gatewayGroup.add(portalField);

  // Quantum filaments
  const filamentCount = 50;
  const filaments: THREE.Line[] = [];
  
  for (let i = 0; i < filamentCount; i++) {
    const points = [];
    const segments = 20;
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const angle = t * Math.PI * 4;
      const radius = 3 + Math.sin(angle * 3) * 0.5;
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        (t - 0.5) * 12,
        Math.sin(angle) * radius
      ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.9, 0.6),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    const filament = new THREE.Line(geometry, material);
    filaments.push(filament);
    gatewayGroup.add(filament);
  }

  // Dimensional particles
  const particleCount = 1000;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Spherical distribution with portal distortion
    const radius = Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    particlePositions[i3] = Math.sin(phi) * Math.cos(theta) * radius;
    particlePositions[i3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
    particlePositions[i3 + 2] = Math.cos(phi) * radius;

    // Radial velocities toward center
    particleVelocities[i3] = -particlePositions[i3] * 0.01;
    particleVelocities[i3 + 1] = -particlePositions[i3 + 1] * 0.01;
    particleVelocities[i3 + 2] = -particlePositions[i3 + 2] * 0.01;

    // Quantum color states
    const hue = Math.random() * 0.4 + 0.5;
    const color = new THREE.Color().setHSL(hue, 0.9, 0.7);
    particleColors[i3] = color.r;
    particleColors[i3 + 1] = color.g;
    particleColors[i3 + 2] = color.b;

    particleSizes[i] = Math.random() * 0.3 + 0.1;
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
  particleGeometry.setAttribute("velocity", new THREE.BufferAttribute(particleVelocities, 3));
  particleGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });

  const dimensionalParticles = new THREE.Points(particleGeometry, particleMaterial);
  gatewayGroup.add(dimensionalParticles);

  gatewayGroup.userData = {
    type: "dimensionalGateway",
    mainGateway,
    portalField,
    filaments,
    dimensionalParticles,
    filamentPhases: filaments.map(() => Math.random() * Math.PI * 2),
    particleData: {
      positions: particlePositions,
      velocities: particleVelocities,
      originalPositions: particlePositions.slice(),
      lifeCycles: Array.from({ length: particleCount }, () => Math.random())
    },
    timeAccumulator: 0,
    isLyrics: false,
  };

  scene.add(gatewayGroup);
  objects.push(gatewayGroup);
  return objects;
};