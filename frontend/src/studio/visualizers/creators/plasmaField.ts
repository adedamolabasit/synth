import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createPlasmaFieldVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];

  // ==================== CENTER SPHERE ====================
  const sphereGeometry = new THREE.SphereGeometry(2.5, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.3,
    metalness: 0.3,
    roughness: 0.7,
  });
  
  const centerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  centerSphere.userData = {
    isCenterSphere: true,
    baseRadius: 2.5,
  };
  
  scene.add(centerSphere);
  objects.push(centerSphere);

  // ==================== GRID SPHERE ====================
  const gridGeometry = new THREE.SphereGeometry(2.8, 16, 16);
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.1,
    wireframe: true,
  });
  
  const gridSphere = new THREE.Mesh(gridGeometry, gridMaterial);
  gridSphere.userData = {
    isGridSphere: true,
  };
  
  scene.add(gridSphere);
  objects.push(gridSphere);

  // ==================== ORBITING RINGS ====================
  const rings: THREE.Line[] = [];
  const ringCount = 5;
  
  for (let i = 1; i <= ringCount; i++) {
    const ringGeometry = new THREE.RingGeometry(i * 0.8, i * 0.8 + 0.05, 64);
    const ringMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(0.6, 0.8, 0.7),
      transparent: true,
      opacity: 0.15,
    });
    
    const ring = new THREE.LineLoop(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.userData = {
      isOrbitRing: true,
      radius: i * 0.8,
      ringIndex: i,
      phase: Math.random() * Math.PI * 2,
    };
    
    scene.add(ring);
    rings.push(ring);
    objects.push(ring);
  }

  // ==================== ORBITING PARTICLES ====================
  const particleCount = 800;
  const geometry = new THREE.BufferGeometry();
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const orbitData = new Float32Array(particleCount * 4); // radius, angle, height, speed

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const i4 = i * 4;
    
    // Orbiting particles - organized in clean orbits
    const orbitRadius = 3 + Math.random() * 6;
    const orbitHeight = (Math.random() - 0.5) * 2;
    const orbitAngle = Math.random() * Math.PI * 2;
    const orbitSpeed = 0.5 + Math.random() * 1.5;
    
    const x = Math.cos(orbitAngle) * orbitRadius;
    const z = Math.sin(orbitAngle) * orbitRadius;
    const y = orbitHeight;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Beautiful blue/purple color gradient
    const hue = 0.6 + Math.random() * 0.2;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.7);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = 0.1 + Math.random() * 0.15;
    
    // Store orbit data
    orbitData[i4] = orbitRadius;
    orbitData[i4 + 1] = orbitAngle;
    orbitData[i4 + 2] = orbitHeight;
    orbitData[i4 + 3] = orbitSpeed;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("orbitData", new THREE.BufferAttribute(orbitData, 4));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  
  particles.userData = {
    particleCount,
    orbitData,
    baseHue: 0.6,
    colorShiftSpeed: 0.0005,
  };

  scene.add(particles);
  objects.push(particles);

  // ==================== LIGHTS ====================
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0x00aaff, 0.5, 20);
  pointLight.position.set(0, 5, 0);
  scene.add(pointLight);

  return objects;
};