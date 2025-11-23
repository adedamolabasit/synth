// creators/quantumFlux.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createQuantumFluxVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const quantumGroup = new THREE.Group();
  
  const fluxCount = 20;
  const fluxTubes: THREE.Mesh[] = [];
  const probabilityWaves: THREE.Points[] = [];

  // Create quantum flux tubes
  for (let i = 0; i < fluxCount; i++) {
    const tubeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 8, 32, true);
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.7 + Math.random() * 0.2, 0.9, 0.5),
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });

    const fluxTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    
    // Position tubes in quantum field pattern
    const angle = (i / fluxCount) * Math.PI * 2;
    const radius = 5 + Math.random() * 8;
    
    fluxTube.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 6,
      Math.sin(angle) * radius
    );

    fluxTube.rotation.x = Math.random() * Math.PI;
    fluxTube.rotation.y = Math.random() * Math.PI;
    fluxTube.rotation.z = Math.random() * Math.PI;

    quantumGroup.add(fluxTube);
    fluxTubes.push(fluxTube);

    // Create probability wave particles around each tube
    const waveCount = 100;
    const waveGeometry = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(waveCount * 3);
    const waveColors = new Float32Array(waveCount * 3);

    for (let j = 0; j < waveCount; j++) {
      const i3 = j * 3;
      const tubeAngle = (j / waveCount) * Math.PI * 2;
      const waveRadius = 2 + Math.random() * 3;
      
      wavePositions[i3] = Math.cos(tubeAngle) * waveRadius;
      wavePositions[i3 + 1] = (Math.random() - 0.5) * 12;
      wavePositions[i3 + 2] = Math.sin(tubeAngle) * waveRadius;

      const color = new THREE.Color().setHSL(0.7 + Math.random() * 0.2, 0.8, 0.6);
      waveColors[i3] = color.r;
      waveColors[i3 + 1] = color.g;
      waveColors[i3 + 2] = color.b;
    }

    waveGeometry.setAttribute("position", new THREE.BufferAttribute(wavePositions, 3));
    waveGeometry.setAttribute("color", new THREE.BufferAttribute(waveColors, 3));

    const waveMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const probabilityWave = new THREE.Points(waveGeometry, waveMaterial);
    probabilityWave.position.copy(fluxTube.position);
    quantumGroup.add(probabilityWave);
    probabilityWaves.push(probabilityWave);
  }

  quantumGroup.userData = {
    type: "quantumFlux",
    fluxTubes,
    probabilityWaves,
    tubeOscillations: fluxTubes.map(() => Math.random() * Math.PI * 2),
    wavePhases: probabilityWaves.map(() => Math.random() * Math.PI * 2),
    quantumStates: fluxTubes.map(() => Math.random()),
    isLyrics: false,
  };

  scene.add(quantumGroup);
  objects.push(quantumGroup);
  return objects;
};