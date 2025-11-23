// creators/crystalResonance.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCrystalResonanceVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const resonanceGroup = new THREE.Group();
  
  const crystalCount = 12;
  const resonanceCrystals: THREE.Mesh[] = [];
  const harmonicFields: THREE.Points[] = [];

  // Create resonance crystals in geometric formation
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  
  for (let i = 0; i < crystalCount; i++) {
    // Fibonacci sphere distribution
    const y = 1 - (i / (crystalCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const goldenAngle = Math.PI * 2 * goldenRatio;
    const theta = goldenAngle * i;
    
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    
    const position = new THREE.Vector3(x, y, z).multiplyScalar(8);

    // Create crystal with multiple geometries
    const crystalType = i % 4;
    let geometry: THREE.BufferGeometry;
    
    switch (crystalType) {
      case 0:
        geometry = new THREE.OctahedronGeometry(1, 0);
        break;
      case 1:
        geometry = new THREE.DodecahedronGeometry(0.8, 0);
        break;
      case 2:
        geometry = new THREE.IcosahedronGeometry(1.2, 0);
        break;
      case 3:
        geometry = new THREE.TetrahedronGeometry(1, 0);
        break;
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(i * 0.08, 0.8, 0.5),
      transparent: true,
      opacity: 0.8,
      transmission: 0.4,
      roughness: 0.1,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.copy(position);
    
    // Align crystal to point outward from center
    crystal.lookAt(0, 0, 0);
    crystal.rotateX(Math.PI / 2);

    resonanceGroup.add(crystal);
    resonanceCrystals.push(crystal);

    // Create harmonic field around each crystal
    const fieldCount = 80;
    const fieldGeometry = new THREE.BufferGeometry();
    const fieldPositions = new Float32Array(fieldCount * 3);
    const fieldColors = new Float32Array(fieldCount * 3);

    for (let j = 0; j < fieldCount; j++) {
      const i3 = j * 3;
      // Spherical distribution around crystal
      const fieldRadius = 2 + Math.random() * 3;
      const fieldTheta = Math.random() * Math.PI * 2;
      const fieldPhi = Math.acos(2 * Math.random() - 1);
      
      fieldPositions[i3] = Math.sin(fieldPhi) * Math.cos(fieldTheta) * fieldRadius;
      fieldPositions[i3 + 1] = Math.sin(fieldPhi) * Math.sin(fieldTheta) * fieldRadius;
      fieldPositions[i3 + 2] = Math.cos(fieldPhi) * fieldRadius;

      const color = new THREE.Color().setHSL(i * 0.08, 0.9, 0.6);
      fieldColors[i3] = color.r;
      fieldColors[i3 + 1] = color.g;
      fieldColors[i3 + 2] = color.b;
    }

    fieldGeometry.setAttribute("position", new THREE.BufferAttribute(fieldPositions, 3));
    fieldGeometry.setAttribute("color", new THREE.BufferAttribute(fieldColors, 3));

    const fieldMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const harmonicField = new THREE.Points(fieldGeometry, fieldMaterial);
    harmonicField.position.copy(position);
    resonanceGroup.add(harmonicField);
    harmonicFields.push(harmonicField);
  }

  resonanceGroup.userData = {
    type: "crystalResonance",
    resonanceCrystals,
    harmonicFields,
    resonanceFrequencies: resonanceCrystals.map(() => Math.random() * 2 + 1),
    phaseOffsets: resonanceCrystals.map(() => Math.random() * Math.PI * 2),
    energyLevels: resonanceCrystals.map(() => Math.random()),
    isLyrics: false,
  };

  scene.add(resonanceGroup);
  objects.push(resonanceGroup);
  return objects;
};