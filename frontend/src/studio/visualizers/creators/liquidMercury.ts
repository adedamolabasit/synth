// creators/liquidMercury.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createLiquidMercuryVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const dropletCount = 200;
  const mercuryGroup = new THREE.Group();
  const droplets: THREE.Mesh[] = [];

  for (let i = 0; i < dropletCount; i++) {
    const radius = Math.random() * 0.5 + 0.2;
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.7, 0.8, 0.9),
      metalness: 1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 1
    });

    const droplet = new THREE.Mesh(geometry, material);
    
    // Distribute in a hemispherical pattern
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const distance = Math.random() * 8 + 2;
    
    droplet.position.set(
      Math.sin(phi) * Math.cos(theta) * distance,
      Math.abs(Math.cos(phi)) * 4,
      Math.sin(phi) * Math.sin(theta) * distance
    );

    mercuryGroup.add(droplet);
    droplets.push(droplet);
  }

  mercuryGroup.userData = {
    type: "liquidMercury",
    droplets,
    basePositions: droplets.map(d => d.position.clone()),
    surfaceTensions: droplets.map(() => Math.random() * 0.5 + 0.5),
    flowDirections: droplets.map(() => new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize()),
    isLyrics: false,
  };

  scene.add(mercuryGroup);
  objects.push(mercuryGroup);
  return objects;
};