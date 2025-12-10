import * as THREE from "three";

export const createGalaxyNebulaVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const particleCount = 5000;
  const arms = 5;
  const baseHue = Math.random();

  const group = new THREE.Group();
  group.userData = {
    type: "galaxyNebula",
    baseHue,
    rotationPhase: 0,
  };

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const originalPositions = new Float32Array(particleCount * 3);
  const armIndices = new Float32Array(particleCount);
  const radiusData = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const armIndex = i % arms;
    const armAngle = (armIndex / arms) * Math.PI * 2;
    const radius = Math.random() * 6 + 0.5;
    const spinAngle = radius * 0.8;
    const randomOffset = (Math.random() - 0.5) * 0.8;

    const angle = armAngle + spinAngle + randomOffset;

    const i3 = i * 3;
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = (Math.random() - 0.5) * 0.3 * (7 - radius);
    positions[i3 + 2] = Math.sin(angle) * radius;

    originalPositions[i3] = positions[i3];
    originalPositions[i3 + 1] = positions[i3 + 1];
    originalPositions[i3 + 2] = positions[i3 + 2];

    armIndices[i] = armIndex;
    radiusData[i] = radius;

    const hue = (baseHue + armIndex / arms * 0.3 + radius / 10) % 1;
    const saturation = 0.6 + Math.random() * 0.4;
    const lightness = 0.4 + Math.random() * 0.4;
    const c = new THREE.Color().setHSL(hue, saturation, lightness);
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;

    sizes[i] = 0.03 + Math.random() * 0.05;
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

  const galaxy = new THREE.Points(geometry, material);
  galaxy.userData = {
    particleCount,
    originalPositions,
    armIndices,
    radiusData,
    arms,
    phaseOffsets: Array.from({ length: particleCount }, () => Math.random() * Math.PI * 2),
  };

  group.add(galaxy);

  const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(baseHue, 0.8, 0.7),
    transparent: true,
    opacity: 0.8,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.userData = { isCore: true };
  group.add(core);

  const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(baseHue, 0.9, 0.6),
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.userData = { isGlow: true };
  group.add(glow);

  scene.add(group);
  objects.push(group);
  return objects;
};