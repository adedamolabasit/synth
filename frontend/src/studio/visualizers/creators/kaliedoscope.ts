import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createKaleidoscopeVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];

  // ==================== CENTER MANDALA ====================
  const mandalaGroup = new THREE.Group();
  const mandalaSlices = 12;
  
  for (let i = 0; i < mandalaSlices; i++) {
    const angle = (i / mandalaSlices) * Math.PI * 2;
    
    // Create petal shapes
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(1, 0.5, 2, 2, 0, 4);
    petalShape.bezierCurveTo(-2, 2, -1, 0.5, 0, 0);
    
    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3,
    };
    
    const petalGeometry = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
    const petalMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / mandalaSlices, 0.9, 0.6),
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      side: THREE.DoubleSide,
    });
    
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.rotation.z = angle;
    petal.scale.set(0.3, 0.3, 0.3);
    petal.position.y = 0.5;
    
    petal.userData = {
      isMandalaPetal: true,
      sliceIndex: i,
      baseAngle: angle,
    };
    
    mandalaGroup.add(petal);
  }
  
  mandalaGroup.userData = {
    isMandala: true,
  };
  
  scene.add(mandalaGroup);
  objects.push(mandalaGroup);

  // ==================== FLOATING GEOMETRIES ====================
  const floatingGeometries: THREE.Mesh[] = [];
  const geometryTypes = 4;
  const instancesPerType = 16;
  
  const geometries = [
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.IcosahedronGeometry(0.25, 0),
    new THREE.TorusKnotGeometry(0.2, 0.08, 64, 8),
    new THREE.DodecahedronGeometry(0.3, 0),
  ];
  
  for (let type = 0; type < geometryTypes; type++) {
    const baseHue = type / geometryTypes;
    
    for (let i = 0; i < instancesPerType; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(baseHue, 0.8, 0.7),
        transparent: true,
        opacity: 0.8,
        metalness: 0.3,
        roughness: 0.4,
        emissive: new THREE.Color().setHSL(baseHue, 0.5, 0.1),
      });
      
      const mesh = new THREE.Mesh(geometries[type], material);
      
      // Arrange in spherical pattern
      const radius = 3 + (type * 1.5);
      const angle = (i / instancesPerType) * Math.PI * 2 + type * 0.5;
      const height = Math.sin(angle * 2) * 0.8;
      
      mesh.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      mesh.userData = {
        isFloatingGeometry: true,
        geometryType: type,
        instanceIndex: i,
        basePosition: mesh.position.clone(),
        radius: radius,
        angle: angle,
        rotationSpeed: 0.5 + Math.random() * 1,
        floatSpeed: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        baseHue: baseHue,
      };
      
      scene.add(mesh);
      floatingGeometries.push(mesh);
      objects.push(mesh);
    }
  }

  // ==================== ENERGY STREAKS ====================
  const streakCount = 48;
  const streakGroup = new THREE.Group();
  
  for (let i = 0; i < streakCount; i++) {
    const streakLength = 5;
    const streakPoints = [];
    
    for (let j = 0; j <= 20; j++) {
      const t = j / 20;
      const x = Math.sin(t * Math.PI * 2) * 0.1;
      const y = t * streakLength;
      const z = Math.cos(t * Math.PI * 2) * 0.1;
      streakPoints.push(new THREE.Vector3(x, y, z));
    }
    
    const streakGeometry = new THREE.BufferGeometry().setFromPoints(streakPoints);
    const streakMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(i / streakCount, 0.9, 0.7),
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });
    
    const streak = new THREE.Line(streakGeometry, streakMaterial);
    
    const angle = (i / streakCount) * Math.PI * 2;
    streak.rotation.y = angle;
    streak.position.y = -2.5;
    
    streak.userData = {
      isEnergyStreak: true,
      streakIndex: i,
      baseAngle: angle,
      length: streakLength,
    };
    
    streakGroup.add(streak);
  }
  
  streakGroup.userData = {
    isStreakGroup: true,
  };
  
  scene.add(streakGroup);
  objects.push(streakGroup);

  // ==================== PARTICLES ====================
  const particleCount = 1200;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particlePhases = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Create particle spiral
    const spiralRadius = 0.5 + (i % 20) * 0.2;
    const spiralAngle = (i / particleCount) * Math.PI * 8;
    const spiralHeight = (i / particleCount) * 10 - 5;
    
    particlePositions[i3] = Math.cos(spiralAngle) * spiralRadius;
    particlePositions[i3 + 1] = spiralHeight;
    particlePositions[i3 + 2] = Math.sin(spiralAngle) * spiralRadius;
    
    const hue = (i / particleCount) % 1;
    const color = new THREE.Color().setHSL(hue, 0.9, 0.7);
    particleColors[i3] = color.r;
    particleColors[i3 + 1] = color.g;
    particleColors[i3 + 2] = color.b;
    
    particlePhases[i] = Math.random() * Math.PI * 2;
  }
  
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.userData = {
    isParticleSpiral: true,
    particleCount,
    particlePhases,
    basePositions: particlePositions.slice(),
  };
  
  scene.add(particles);
  objects.push(particles);

  // ==================== LIGHTS ====================
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0xff0088, 1, 15);
  pointLight.position.set(0, 5, 0);
  scene.add(pointLight);
  
  const pointLight2 = new THREE.PointLight(0x00ffff, 1, 15);
  pointLight2.position.set(0, -5, 0);
  scene.add(pointLight2);

  return objects;
};