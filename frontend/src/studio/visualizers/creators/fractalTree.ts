import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createFractalTreeVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const layers = Math.floor(4 + params.patternDensity * 6);
  const particlesPerLayer = Math.floor(200 + params.complexity * 300);
  const totalParticles = layers * particlesPerLayer;

  const geometry = new THREE.SphereGeometry(0.03, 6, 6);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x2222ff,
    transparent: true,
    opacity: 0.7,
    shininess: 50,
  });

  const instancedMesh = new THREE.InstancedMesh(geometry, material, totalParticles);
  instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();

  const particleData: { radius: number; angle: number; speed: number; pulsePhase: number }[] = [];

  let index = 0;
  for (let l = 0; l < layers; l++) {
    const radius = 1.5 + l * 0.6;
    for (let i = 0; i < particlesPerLayer; i++) {
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI;

      const x = radius * Math.sin(elevation) * Math.cos(angle);
      const y = radius * Math.cos(elevation);
      const z = radius * Math.sin(elevation) * Math.sin(angle);

      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(index, dummy.matrix);

      particleData.push({
        radius,
        angle,
        speed: 0.5 + Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
      });

      index++;
    }
  }

  scene.add(instancedMesh);
  (instancedMesh.userData as any).particleData = particleData;

  objects.push(instancedMesh);
  return objects;
};
