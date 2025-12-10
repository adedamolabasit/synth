import * as THREE from "three";

export const createKaleidoscopeVisualizer2 = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const segments = 12;
  const layerCount = 5;
  const shapesPerLayer = 8;
  const baseHue = Math.random();

  const group = new THREE.Group();
  group.userData = {
    type: "kaleidoscope",
    segments,
    baseHue,
    morphPhase: 0,
  };

  const geometryTypes = [
    () => new THREE.TetrahedronGeometry(0.3, 0),
    () => new THREE.OctahedronGeometry(0.25, 0),
    () => new THREE.IcosahedronGeometry(0.2, 0),
    () => new THREE.BoxGeometry(0.25, 0.25, 0.25),
    () => new THREE.ConeGeometry(0.15, 0.4, 6),
  ];

  for (let layer = 0; layer < layerCount; layer++) {
    const layerRadius = 1.5 + layer * 1.2;
    const layerHue = (baseHue + (layer / layerCount) * 0.3) % 1;

    for (let seg = 0; seg < segments; seg++) {
      const segmentAngle = (seg / segments) * Math.PI * 2;

      for (let shape = 0; shape < shapesPerLayer; shape++) {
        const shapeAngle =
          segmentAngle + (shape / shapesPerLayer) * ((Math.PI * 2) / segments);
        const shapeRadius = layerRadius + (shape / shapesPerLayer) * 0.8;

        const geoIndex = (layer + shape) % geometryTypes.length;
        const geometry = geometryTypes[geoIndex]();

        const shapeHue = (layerHue + (shape / shapesPerLayer) * 0.1) % 1;
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(shapeHue, 0.8, 0.5),
          transparent: true,
          opacity: 0.85,
          metalness: 0.4,
          roughness: 0.3,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          Math.cos(shapeAngle) * shapeRadius,
          0,
          Math.sin(shapeAngle) * shapeRadius
        );

        mesh.userData = {
          layer,
          segment: seg,
          shapeIndex: shape,
          baseAngle: shapeAngle,
          baseRadius: shapeRadius,
          shapeHue,
          phaseOffset: Math.random() * Math.PI * 2,
          rotationSpeed: 0.5 + Math.random() * 0.5,
        };

        group.add(mesh);
      }
    }
  }

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(layerCount * shapesPerLayer * 3);

    for (let j = 0; j < layerCount * shapesPerLayer; j++) {
      const radius =
        1.5 + (j / shapesPerLayer) * 0.8 + Math.floor(j / shapesPerLayer) * 1.2;
      const j3 = j * 3;
      positions[j3] = Math.cos(angle) * radius;
      positions[j3 + 1] = 0;
      positions[j3 + 2] = Math.sin(angle) * radius;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL((baseHue + i / segments) % 1, 0.6, 0.4),
      transparent: true,
      opacity: 0.3,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { isConnector: true, segmentIndex: i };
    group.add(line);
  }

  scene.add(group);
  objects.push(group);
  return objects;
};
