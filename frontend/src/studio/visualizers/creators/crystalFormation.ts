import * as THREE from "three";

export const createCrystalFormationVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const crystalCount = 24;
  const baseHue = Math.random();

  const group = new THREE.Group();
  group.userData = {
    type: "crystalFormation",
    crystals: [] as THREE.Mesh[],
    baseHue,
    shatterPhase: 0,
  };

  const crystalGeometries = [
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.IcosahedronGeometry(0.4, 0),
    new THREE.DodecahedronGeometry(0.4, 0),
  ];

  for (let i = 0; i < crystalCount; i++) {
    const geoIndex = i % crystalGeometries.length;
    const geometry = crystalGeometries[geoIndex].clone();

    const angle = (i / crystalCount) * Math.PI * 2;
    const radius = 2 + Math.random() * 2;
    const height = (Math.random() - 0.5) * 4;

    const crystalHue = (baseHue + i / crystalCount * 0.5) % 1;

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(crystalHue, 0.7, 0.5),
      transparent: true,
      opacity: 0.85,
      metalness: 0.6,
      roughness: 0.2,
    });

    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    crystal.userData = {
      crystalIndex: i,
      basePosition: crystal.position.clone(),
      baseRotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      crystalHue,
      phaseOffset: Math.random() * Math.PI * 2,
      orbitRadius: radius,
      orbitAngle: angle,
      floatSpeed: 0.5 + Math.random() * 0.5,
      geoType: geoIndex,
    };

    crystal.rotation.copy(crystal.userData.baseRotation);

    group.add(crystal);
    group.userData.crystals.push(crystal);
  }

  scene.add(group);
  objects.push(group);
  return objects;
};