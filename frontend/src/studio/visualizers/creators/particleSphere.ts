import * as THREE from "three";

export const createParticleSphereVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const particleCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const originalPositions = new Float32Array(particleCount * 3);
  const phaseOffsets = new Float32Array(particleCount);

  const baseHue = Math.random();

  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;

    const radius = 3;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    const i3 = i * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    originalPositions[i3] = x;
    originalPositions[i3 + 1] = y;
    originalPositions[i3 + 2] = z;

    phaseOffsets[i] = Math.random() * Math.PI * 2;

    const c = new THREE.Color().setHSL(baseHue + Math.random() * 0.1, 0.8, 0.6);
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;

    sizes[i] = 0.05 + Math.random() * 0.05;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);

  particles.userData = {
    type: "particleSphere",
    particleCount,
    originalPositions,
    phaseOffsets,
    baseHue,
    pulsePhase: 0,
    rotationSpeed: 0.3 + Math.random() * 0.2,
  };

  scene.add(particles);
  objects.push(particles);
  return objects;
};
