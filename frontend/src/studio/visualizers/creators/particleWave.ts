import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createParticleWaveVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
) => {
  const objects: THREE.Object3D[] = [];

  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);
  const originalPositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const phases = new Float32Array(particleCount);

  let baseHue = 0.6;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    const radius = 8;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 4;

    const x = Math.cos(angle) * radius;
    const y = height;
    const z = Math.sin(angle) * radius;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    originalPositions[i3] = x;
    originalPositions[i3 + 1] = y;
    originalPositions[i3 + 2] = z;

    const color = new THREE.Color().setHSL(baseHue, 0.8, 0.7);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  points.userData = {
    type: "particleWave",
    originalPositions,
    phases,
    baseHue,
    colorShiftSpeed: 0.001,
    flowDirection: 1,
  };

  scene.add(points);
  objects.push(points);

  const discGeometry = new THREE.CircleGeometry(10, 32);
  const discMaterial = new THREE.MeshBasicMaterial({
    color: 0x003366,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });

  const disc = new THREE.Mesh(discGeometry, discMaterial);
  disc.position.y = -5;
  disc.rotation.x = -Math.PI / 2;

  disc.userData = {
    isDisc: true,
  };

  scene.add(disc);
  objects.push(disc);

  const circleGeometry = new THREE.RingGeometry(9.5, 10, 32);
  const circleMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 2,
    transparent: true,
    opacity: 0.7,
  });

  const circle = new THREE.LineLoop(circleGeometry, circleMaterial);
  circle.position.y = -4.9;
  circle.rotation.x = -Math.PI / 2;

  circle.userData = {
    isCircle: true,
  };

  scene.add(circle);
  objects.push(circle);

  const lightOrbs: THREE.Mesh[] = [];
  const orbCount = 6;
  const orbGeometry = new THREE.SphereGeometry(0.8, 16, 16);

  for (let i = 0; i < orbCount; i++) {
    const angle = (i / orbCount) * Math.PI * 2;
    const radius = 6;
    
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / orbCount, 0.9, 0.7),
      transparent: true,
      opacity: 0.6,
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(
      Math.cos(angle) * radius,
      -4,
      Math.sin(angle) * radius
    );
    
    orb.userData = {
      isLightOrb: true,
      orbIndex: i,
      angle: angle,
      radius: radius,
    };
    
    scene.add(orb);
    lightOrbs.push(orb);
    objects.push(orb);
  }

  const centerOrbGeometry = new THREE.SphereGeometry(1.5, 32, 32);
  const centerOrbMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
  });
  
  const centerOrb = new THREE.Mesh(centerOrbGeometry, centerOrbMaterial);
  centerOrb.position.y = -4;
  
  centerOrb.userData = {
    isCenterOrb: true,
  };
  
  scene.add(centerOrb);
  objects.push(centerOrb);

  disc.userData.circle = circle;
  disc.userData.lightOrbs = lightOrbs;
  disc.userData.centerOrb = centerOrb;

  return objects;
};