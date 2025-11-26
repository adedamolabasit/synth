import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createToroidalFieldVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const toruses = Math.floor(3 * params.complexity);

  for (let i = 0; i < toruses; i++) {
    const radius = 2 - i * 0.5;
    const tube = 0.3 + i * 0.1;

    const geometry = new THREE.TorusGeometry(radius, tube, 32, 64);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / toruses, 1, 0.5),
      transparent: true,
      opacity: 0.7,
      wireframe: i % 2 === 0,
    });

    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.PI / 4;
    torus.userData = { index: i };
    scene.add(torus);
    objects.push(torus);

    const particleCount = Math.floor(30 * params.patternDensity);
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let j = 0; j < particleCount; j++) {
      const angle = (j / particleCount) * Math.PI * 2;
      const j3 = j * 3;
      positions[j3] = Math.cos(angle) * radius;
      positions[j3 + 1] = Math.sin(angle) * radius;
      positions[j3 + 2] = 0;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: new THREE.Color().setHSL(i / toruses, 1, 0.7),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.userData = { isParticles: true, torusIndex: i, particleCount };
    torus.add(particles);
    objects.push(particles);
  }

  return objects;
};
