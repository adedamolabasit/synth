// creators/timeVortex.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createTimeVortexVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const vortexGroup = new THREE.Group();
  
  const timelineCount = 6;
  const timeRings: THREE.Mesh[] = [];
  const temporalParticles: THREE.Points[] = [];
  const realityFragments: THREE.Mesh[] = [];

  // Create concentric time rings
  for (let i = 0; i < timelineCount; i++) {
    const ringRadius = 3 + i * 2.5;
    const ringGeometry = new THREE.TorusGeometry(ringRadius, 0.3, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.1 + i * 0.15, 0.9, 0.5),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    const timeRing = new THREE.Mesh(ringGeometry, ringMaterial);
    timeRing.rotation.x = Math.PI / 2;
    vortexGroup.add(timeRing);
    timeRings.push(timeRing);

    // Create temporal particles for each ring
    const particleCount = 150;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let j = 0; j < particleCount; j++) {
      const i3 = j * 3;
      const angle = (j / particleCount) * Math.PI * 2;
      const height = (Math.random() - 0.5) * 8;
      
      particlePositions[i3] = Math.cos(angle) * ringRadius;
      particlePositions[i3 + 1] = height;
      particlePositions[i3 + 2] = Math.sin(angle) * ringRadius;

      // Time-based color gradient
      const timeHue = (i / timelineCount + j / particleCount) % 1;
      const color = new THREE.Color().setHSL(timeHue, 0.8, 0.6);
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;

      particleSizes[j] = Math.random() * 0.4 + 0.1;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const temporalParticle = new THREE.Points(particleGeometry, particleMaterial);
    vortexGroup.add(temporalParticle);
    temporalParticles.push(temporalParticle);
  }

  // Create floating reality fragments
  const fragmentCount = 30;
  for (let i = 0; i < fragmentCount; i++) {
    const fragmentType = Math.random();
    let geometry: THREE.BufferGeometry;
    
    if (fragmentType < 0.3) {
      geometry = new THREE.TetrahedronGeometry(0.5, 0);
    } else if (fragmentType < 0.6) {
      geometry = new THREE.OctahedronGeometry(0.4, 0);
    } else {
      geometry = new THREE.DodecahedronGeometry(0.3, 0);
    }

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      transparent: true,
      opacity: 0.7,
      wireframe: true
    });

    const fragment = new THREE.Mesh(geometry, material);
    
    // Distribute fragments throughout the vortex
    const radius = Math.random() * 12;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 10;
    
    fragment.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    fragment.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    vortexGroup.add(fragment);
    realityFragments.push(fragment);
  }

  vortexGroup.userData = {
    type: "timeVortex",
    timeRings,
    temporalParticles,
    realityFragments,
    ringSpeeds: timeRings.map(() => (Math.random() - 0.5) * 0.02),
    timeFlows: temporalParticles.map(() => Math.random()),
    fragmentDrifts: realityFragments.map(() => 
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      )
    ),
    isLyrics: false,
  };

  scene.add(vortexGroup);
  objects.push(vortexGroup);
  return objects;
};