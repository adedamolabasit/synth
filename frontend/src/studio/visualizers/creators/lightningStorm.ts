import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createLightningStormVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const bolts = Math.floor(10 * params.complexity);

  const createLightningBolt = (startPos: THREE.Vector3, endPos: THREE.Vector3, index: number) => {
    const points: THREE.Vector3[] = [];
    const segments = 15;

    points.push(startPos.clone());

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const point = new THREE.Vector3().lerpVectors(startPos, endPos, t);
      point.x += (Math.random() - 0.5) * 0.5;
      point.y += (Math.random() - 0.5) * 0.5;
      point.z += (Math.random() - 0.5) * 0.5;
      points.push(point);
    }

    points.push(endPos.clone());

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });

    const bolt = new THREE.Line(geometry, material);
    bolt.userData = { index, isBolt: true, startPos, endPos };
    scene.add(bolt);
    objects.push(bolt);

    const glowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x88ccff,
      emissiveIntensity: 1.5,
    });

    const startGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    startGlow.position.copy(startPos);
    scene.add(startGlow);
    objects.push(startGlow);

    const endGlow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
    endGlow.position.copy(endPos);
    scene.add(endGlow);
    objects.push(endGlow);
  };

  for (let i = 0; i < bolts; i++) {
    const startPos = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      3,
      (Math.random() - 0.5) * 8
    );
    const endPos = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      -3,
      (Math.random() - 0.5) * 8
    );

    createLightningBolt(startPos, endPos, i);
  }

  return objects;
};
