import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createMoleculeBondsVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const atoms = Math.floor(15 * params.patternDensity);
  const atomPositions: THREE.Vector3[] = [];

  // Create atoms
  for (let i = 0; i < atoms; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
    );
    atomPositions.push(position);

    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
      transparent: true,
      opacity: 0.9,
    });

    const atom = new THREE.Mesh(geometry, material);
    atom.position.copy(position);
    atom.userData = { index: i, isAtom: true };
    scene.add(atom);
    objects.push(atom);
  }

  // Create bonds
  for (let i = 0; i < atoms; i++) {
    for (let j = i + 1; j < atoms; j++) {
      const distance = atomPositions[i].distanceTo(atomPositions[j]);
      if (distance < 3) {
        const direction = new THREE.Vector3().subVectors(atomPositions[j], atomPositions[i]);
        const geometry = new THREE.CylinderGeometry(0.08, 0.08, distance, 8);
        const material = new THREE.MeshPhongMaterial({
          color: 0xcccccc,
          transparent: true,
          opacity: 0.7,
        });

        const bond = new THREE.Mesh(geometry, material);
        bond.position.copy(atomPositions[i]).add(direction.multiplyScalar(0.5));
        bond.lookAt(atomPositions[j]);
        bond.rotateX(Math.PI / 2);
        bond.userData = { from: i, to: j, isBond: true };
        scene.add(bond);
        objects.push(bond);
      }
    }
  }

  return objects;
};
