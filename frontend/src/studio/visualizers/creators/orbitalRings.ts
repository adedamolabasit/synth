import * as THREE from "three";

export const createOrbitalRingsVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const orbitalGroup = new THREE.Group();

  const ringCount = 8;
  const rings: THREE.Mesh[] = [];
  const orbitingParticles: THREE.Points[] = [];

  for (let i = 0; i < ringCount; i++) {
    const radius = 3 + i * 2;
    const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.6 + i * 0.05, 0.8, 0.5),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = Math.random() * Math.PI;
    orbitalGroup.add(ring);
    rings.push(ring);

    const particleCount = 30;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let j = 0; j < particleCount; j++) {
      const i3 = j * 3;
      const angle = (j / particleCount) * Math.PI * 2;
      particlePositions[i3] = Math.cos(angle) * radius;
      particlePositions[i3 + 1] = 0;
      particlePositions[i3 + 2] = Math.sin(angle) * radius;

      const color = new THREE.Color().setHSL(0.6 + i * 0.05, 0.9, 0.6);
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.rotation.x = Math.PI / 2;
    orbitalGroup.add(particles);
    orbitingParticles.push(particles);
  }

  orbitalGroup.userData = {
    type: "orbitalRings",
    rings,
    orbitingParticles,
    ringSpeeds: rings.map(() => (Math.random() - 0.5) * 0.01),
    particleOffsets: orbitingParticles.map(() => Math.random() * Math.PI * 2),
    energyLevels: rings.map(() => Math.random()),
    isLyrics: false,
  };

  scene.add(orbitalGroup);
  objects.push(orbitalGroup);
  return objects;
};
