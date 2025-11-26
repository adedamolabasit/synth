import * as THREE from "three";

export const createPlasmaStormVisualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const stormGroup = new THREE.Group();

  const plasmaCount = 300;
  const plasmaOrbs: THREE.Mesh[] = [];
  const energyArcs: THREE.Line[] = [];

  for (let i = 0; i < plasmaCount; i++) {
    const geometry = new THREE.SphereGeometry(
      0.2 + Math.random() * 0.3,
      12,
      12
    );
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.9, 0.6),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const plasmaOrb = new THREE.Mesh(geometry, material);

    const radius = Math.random() * 8 + 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    plasmaOrb.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      (Math.random() - 0.5) * 4,
      radius * Math.sin(phi) * Math.sin(theta)
    );

    stormGroup.add(plasmaOrb);
    plasmaOrbs.push(plasmaOrb);
  }

  for (let i = 0; i < plasmaCount; i += 5) {
    for (let j = i + 1; j < Math.min(i + 10, plasmaCount); j++) {
      if (Math.random() > 0.7) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        positions[0] = plasmaOrbs[i].position.x;
        positions[1] = plasmaOrbs[i].position.y;
        positions[2] = plasmaOrbs[i].position.z;
        positions[3] = plasmaOrbs[j].position.x;
        positions[4] = plasmaOrbs[j].position.y;
        positions[5] = plasmaOrbs[j].position.z;

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );

        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.6, 0.8, 0.7),
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
        });

        const arc = new THREE.Line(geometry, material);
        stormGroup.add(arc);
        energyArcs.push(arc);
      }
    }
  }

  stormGroup.userData = {
    type: "plasmaStorm",
    plasmaOrbs,
    energyArcs,
    orbitalSpeeds: plasmaOrbs.map(
      () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.02
        )
    ),
    chargeLevels: plasmaOrbs.map(() => Math.random()),
    stormIntensity: 0,
    isLyrics: false,
  };

  scene.add(stormGroup);
  objects.push(stormGroup);
  return objects;
};
