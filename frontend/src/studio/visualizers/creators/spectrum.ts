import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSpectrumVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const bars = 64;
  const radius = 6;
  const baseHeight = 1.5;

  const group = new THREE.Group();
  group.name = "spectrumGroup";

  const barMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    // Use a slightly different geometry profile to allow morphing
    const geometry = new THREE.CylinderGeometry(
      0.05 * params.scale,
      0.05 * params.scale,
      baseHeight * params.scale,
      8,
      1,
      true
    );
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL((i / bars + 0.02) % 1, 0.9, 0.5),
      emissive: new THREE.Color().setHSL(i / bars, 1, 0.35),
      emissiveIntensity: 0.6 * (params.glowIntensity ?? 1),
      transparent: true,
      opacity: params.bloom ? 0.95 : 0.85,
      metalness: 0.3,
      roughness: 0.35,
      wireframe: !!params.wireframe,
    });

    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(Math.cos(angle) * radius, (baseHeight * params.scale) / 2, Math.sin(angle) * radius);
    bar.rotation.y = -angle;
    bar.userData = {
      index: i,
      baseHeight,
      baseScale: 1,
      angle,
      // give each bar a random seed for per-bar animation variety
      seed: Math.random() * 1000,
    };

    group.add(bar);
    barMeshes.push(bar);
    objects.push(bar);
  }

  // central pulsing glow
  const glowGeometry = new THREE.SphereGeometry(1.2 * params.scale, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00ffff),
    transparent: true,
    opacity: 0.12 * (params.glowIntensity ?? 1),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.name = "centralGlow";
  group.add(glow);
  objects.push(glow);

  // projectile pool container (empty at start)
  const projectileContainer = new THREE.Group();
  projectileContainer.name = "projectileContainer";
  group.add(projectileContainer);
  // Not a mesh; not pushed to objects for animation-by-mesh loop, but stored in userData.

  // store runtime state in group.userData
  group.userData = {
    isGroup: true,
    bars,
    radius,
    baseHeight,
    barMeshes,
    projectileContainer,
    rotationSpeed: params.rotationSpeed ?? 0.002,
    lastSpawnTime: 0,
  };

  scene.add(group);
  objects.push(group); // include group so animator can find it

  return objects;
};



// visualizers/spectrumAdvanced.ts

// export interface AudioFeatures {
//   energy: number;
//   spectralCentroid: number;
//   spectralSpread: number;
//   spectralSlope: number;
//   rms: number;
//   zeroCrossingRate: number;
// }
// import * as THREE from "three";
// import { VisualizerParams, BeatInfo} from "../../types/visualizer";

// export const createSpectrumVisualizer = (
//   scene: THREE.Scene,
//   params: VisualizerParams
// ): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const bars = 128; // More bars for detail
//   const group = new THREE.Group();

//   // Multiple pattern generators
//   const patterns = {
//     circle: (i: number, total: number) => {
//       const angle = (i / total) * Math.PI * 2;
//       const radius = 4 + Math.sin(i * 0.3) * 2;
//       return {
//         x: Math.cos(angle) * radius,
//         z: Math.sin(angle) * radius,
//         rotation: -angle
//       };
//     },
//     spiral: (i: number, total: number) => {
//       const angle = (i / total) * Math.PI * 8;
//       const radius = 2 + (i / total) * 6;
//       return {
//         x: Math.cos(angle) * radius,
//         z: Math.sin(angle) * radius,
//         rotation: angle
//       };
//     },
//     grid: (i: number, total: number) => {
//       const cols = Math.sqrt(total);
//       const row = Math.floor(i / cols);
//       const col = i % cols;
//       const spacing = 1.5;
//       return {
//         x: (col - cols/2) * spacing,
//         z: (row - cols/2) * spacing,
//         rotation: 0
//       };
//     },
//     randomField: (i: number, total: number) => {
//       const angle = Math.random() * Math.PI * 2;
//       const radius = 3 + Math.random() * 4;
//       return {
//         x: Math.cos(angle) * radius,
//         z: Math.sin(angle) * radius,
//         rotation: Math.random() * Math.PI * 2
//       };
//     }
//   };

//   const patternTypes = Object.keys(patterns);
//   let currentPattern = 'circle';

//   for (let i = 0; i < bars; i++) {
//     // Randomly assign patterns based on complexity
//     if (Math.random() < params.complexity * 0.1) {
//       currentPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
//     }

//     const pattern = patterns[currentPattern as keyof typeof patterns];
//     const { x, z, rotation } = pattern(i, bars);

//     // Vary geometry based on position and randomness
//     const width = 0.08 + Math.sin(i) * 0.04 * params.randomness;
//     const depth = 0.08 + Math.cos(i * 0.5) * 0.04 * params.randomness;
//     const height = 1 + Math.sin(i * 0.7) * 0.5 * params.randomness;

//     const geometry = new THREE.BoxGeometry(width, height, depth);
    
//     // Dynamic material based on position
//     const hue = (i / bars + Math.sin(i * 0.1) * 0.2) % 1;
//     const saturation = 0.8 + Math.cos(i * 0.3) * 0.2;
    
//     const material = new THREE.MeshStandardMaterial({
//       color: new THREE.Color().setHSL(hue, saturation, 0.6),
//       emissive: new THREE.Color().setHSL(hue, saturation, 0.3),
//       emissiveIntensity: 0.4,
//       metalness: 0.2 + Math.sin(i) * 0.3,
//       roughness: 0.3 + Math.cos(i * 0.7) * 0.4,
//       transparent: true,
//       opacity: 0.9
//     });

//     const bar = new THREE.Mesh(geometry, material);
//     bar.position.set(x, height / 2, z);
//     bar.rotation.y = rotation;

//     // Store animation properties
//     bar.userData = {
//       index: i,
//       baseHeight: height,
//       basePosition: new THREE.Vector3(x, height / 2, z),
//       phase: Math.random() * Math.PI * 2,
//       speed: 1 + Math.random() * 2,
//       pattern: currentPattern,
//       morphTarget: Math.random(),
//       audioReactivity: 0.5 + Math.random() * 0.5
//     };

//     group.add(bar);
//     objects.push(bar);
//   }

//   // Central energy core
//   const coreGeometry = new THREE.IcosahedronGeometry(1.5, 2);
//   const coreMaterial = new THREE.MeshBasicMaterial({
//     color: new THREE.Color(0x00ffff),
//     transparent: true,
//     opacity: 0.2,
//     wireframe: true,
//     blending: THREE.AdditiveBlending
//   });
//   const energyCore = new THREE.Mesh(coreGeometry, coreMaterial);
//   group.add(energyCore);
//   objects.push(energyCore);

//   // Particle field
//   const particleCount = 500;
//   const particleGeometry = new THREE.BufferGeometry();
//   const positions = new Float32Array(particleCount * 3);
//   const colors = new Float32Array(particleCount * 3);

//   for (let i = 0; i < particleCount; i++) {
//     const i3 = i * 3;
//     const angle = Math.random() * Math.PI * 2;
//     const radius = 8 + Math.random() * 4;
    
//     positions[i3] = Math.cos(angle) * radius;
//     positions[i3 + 1] = (Math.random() - 0.5) * 10;
//     positions[i3 + 2] = Math.sin(angle) * radius;

//     const hue = Math.random();
//     const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
//     colors[i3] = color.r;
//     colors[i3 + 1] = color.g;
//     colors[i3 + 2] = color.b;
//   }

//   particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//   particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

//   const particleMaterial = new THREE.PointsMaterial({
//     size: 0.1,
//     vertexColors: true,
//     transparent: true,
//     opacity: 0.6,
//     blending: THREE.AdditiveBlending
//   });

//   const particleField = new THREE.Points(particleGeometry, particleMaterial);
//   particleField.userData = { particles: positions, originalPositions: positions.slice() };
//   group.add(particleField);
//   objects.push(particleField);

//   scene.add(group);
//   objects.push(group);

//   return objects;
// };
