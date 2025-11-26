import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSpectrumVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];

  const group = new THREE.Group();
  group.name = "waveVisualizerGroup";

  const bars = 64;
  const radius = 6;

  const ribbons: THREE.Line[] = [];
  for (let i = 0; i < bars; i++) {
    const points: THREE.Vector3[] = [];
    for (let j = 0; j <= 32; j++) {
      const angle = (j / 32) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(i / bars, 0.8, 0.5),
      transparent: true,
      opacity: 0.7,
    });

    const ribbon = new THREE.LineLoop(geometry, material);
    ribbon.userData = {
      baseRadius: radius,
      speed: 0.5 + Math.random(),
      seed: Math.random() * 1000,
      index: i,
    };

    group.add(ribbon);
    ribbons.push(ribbon);
    objects.push(ribbon);
  }

  const particleCount = params.particleCount ?? 800;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = Math.random() * 8;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;

    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = Math.random() * 0.02 + 0.005;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute(
    "velocity",
    new THREE.BufferAttribute(velocities, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.name = "waveParticles";
  group.add(particles);
  objects.push(particles);

  const coreGeo = new THREE.SphereGeometry(1.5 * (params.scale ?? 1), 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00ffff),
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = "coreGlow";
  group.add(core);
  objects.push(core);

  const bgGeo = new THREE.SphereGeometry(50, 32, 32);
  const bgMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x000000),
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.6,
  });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.name = "dynamicBackground";
  group.add(bg);
  objects.push(bg);

  group.userData = {
    isGroup: true,
    ribbons,
    particles,
    core,
    backgroundSphere: bg,
    rotationSpeed: params.rotationSpeed ?? 0.0015,
  };

  scene.add(group);
  objects.push(group);

  return objects;
};
