import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSacredGeometryVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];

  // ==================== SACRED FLOWER OF LIFE ====================
  const sacredGroup = new THREE.Group();
  
  // CENTRAL MANDALA
  const mandalaGroup = new THREE.Group();
  const petalCount = 12;
  
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    
    // Create beautiful petal shape
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(1.5, 0.5, 2, 2);
    petalShape.quadraticCurveTo(1, 3, 0, 2);
    petalShape.quadraticCurveTo(-1, 3, -2, 2);
    petalShape.quadraticCurveTo(-1.5, 0.5, 0, 0);
    
    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };
    
    const petalGeometry = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
    const petalMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / petalCount, 0.9, 0.6),
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      side: THREE.DoubleSide,
    });
    
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.rotation.z = angle;
    petal.scale.set(0.4, 0.4, 0.4);
    
    petal.userData = {
      type: "mandalaPetal",
      index: i,
      baseAngle: angle,
      phase: Math.random() * Math.PI * 2,
    };
    
    mandalaGroup.add(petal);
  }
  sacredGroup.add(mandalaGroup);

  // ==================== METATRON'S CUBE ====================
  const metatronGroup = new THREE.Group();
  
  // Create Flower of Life circles
  const flowerCircles: THREE.Mesh[] = [];
  const circleCount = 7;
  const circleRadius = 1.2;
  
  for (let i = 0; i < circleCount; i++) {
    const circleGeometry = new THREE.CircleGeometry(circleRadius, 64);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / circleCount, 0.8, 0.5),
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    
    if (i === 0) {
      circle.position.set(0, 0, 0);
    } else {
      const angle = ((i - 1) / 6) * Math.PI * 2;
      const x = Math.cos(angle) * circleRadius * 2;
      const y = Math.sin(angle) * circleRadius * 2;
      circle.position.set(x, y, 0);
    }
    
    circle.userData = {
      type: "flowerCircle",
      index: i,
      basePosition: circle.position.clone(),
      baseRadius: circleRadius,
    };
    
    flowerCircles.push(circle);
    metatronGroup.add(circle);
  }
  
  // Add sacred geometry lines
  const sacredLines: THREE.Line[] = [];
  const vertices = [
    [0, 0, 0], [1, 0, 0], [0.5, Math.sqrt(3)/2, 0], [-0.5, Math.sqrt(3)/2, 0],
    [-1, 0, 0], [-0.5, -Math.sqrt(3)/2, 0], [0.5, -Math.sqrt(3)/2, 0]
  ];
  
  const connections = [
    [0,1], [0,2], [0,3], [0,4], [0,5], [0,6],
    [1,2], [2,3], [3,4], [4,5], [5,6], [6,1]
  ];
  
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    linewidth: 1,
  });
  
  connections.forEach(([a, b]) => {
    const points = [
      new THREE.Vector3(vertices[a][0] * 3, vertices[a][1] * 3, 0),
      new THREE.Vector3(vertices[b][0] * 3, vertices[b][1] * 3, 0)
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    
    line.userData = {
      type: "sacredLine",
      index: sacredLines.length,
    };
    
    sacredLines.push(line);
    metatronGroup.add(line);
  });
  
  sacredGroup.add(metatronGroup);
  metatronGroup.position.z = -0.5;

  // ==================== FLOATING GEOMETRY ====================
  const floatingGeometries: THREE.Mesh[] = [];
  const geometryTypes = [
    new THREE.IcosahedronGeometry(0.3, 0),
    new THREE.DodecahedronGeometry(0.3, 0),
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TetrahedronGeometry(0.4, 0),
  ];
  
  for (let i = 0; i < 24; i++) {
    const geoType = i % 4;
    const geometry = geometryTypes[geoType];
    
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / 24, 0.9, 0.7),
      transparent: true,
      opacity: 0.8,
      shininess: 50,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Arrange in spherical pattern
    const phi = Math.acos(-1 + (i * 2) / 24);
    const theta = Math.sqrt(24 * Math.PI) * phi;
    
    const radius = 3 + (i % 3) * 0.5;
    mesh.position.setFromSphericalCoords(radius, phi, theta);
    
    mesh.userData = {
      type: "floatingGeo",
      index: i,
      geoType: geoType,
      basePosition: mesh.position.clone(),
      rotationSpeed: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
    };
    
    floatingGeometries.push(mesh);
    sacredGroup.add(mesh);
  }

  // ==================== ENERGY ORBS ====================
  const energyOrbs: THREE.Mesh[] = [];
  const orbCount = 8;
  
  for (let i = 0; i < orbCount; i++) {
    const orbGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / orbCount, 0.9, 0.7),
      transparent: true,
      opacity: 0.6,
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    
    const angle = (i / orbCount) * Math.PI * 2;
    const radius = 2.5;
    
    orb.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 2) * 0.3,
      Math.sin(angle) * radius
    );
    
    orb.userData = {
      type: "energyOrb",
      index: i,
      angle: angle,
      radius: radius,
      phase: Math.random() * Math.PI * 2,
      basePosition: orb.position.clone(),
    };
    
    energyOrbs.push(orb);
    sacredGroup.add(orb);
  }

  // ==================== GLOWING PARTICLES ====================
  const particleCount = 800;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particlePhases = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Arrange in Fibonacci spiral
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const radius = Math.sqrt(i / particleCount) * 4;
    const theta = i * goldenAngle;
    
    particlePositions[i3] = radius * Math.cos(theta);
    particlePositions[i3 + 1] = (i / particleCount - 0.5) * 3;
    particlePositions[i3 + 2] = radius * Math.sin(theta);
    
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
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  
  particles.userData = {
    type: "glowingParticles",
    particleCount,
    basePositions: particlePositions.slice(),
    particlePhases,
  };
  
  sacredGroup.add(particles);

  sacredGroup.userData = {
    mandalaGroup,
    metatronGroup,
    flowerCircles,
    sacredLines,
    floatingGeometries,
    energyOrbs,
    particles,
    activationWave: 0,
  };

  scene.add(sacredGroup);
  objects.push(sacredGroup);

  // ==================== LIGHTS ====================
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const pointLight1 = new THREE.PointLight(0xff0088, 0.8, 20);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0x00ffff, 0.6, 20);
  pointLight2.position.set(-5, -5, -5);
  scene.add(pointLight2);

  return objects;
}; 