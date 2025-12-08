import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createBiomorphicVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];

  const groundGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
  groundGeometry.attributes.position.usage = THREE.DynamicDrawUsage;
  
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(0.15, 0.8, 0.3),
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    wireframe: false,
    shininess: 100,
  });

  const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
  groundPlane.position.y = -3;
  groundPlane.rotation.x = -Math.PI / 2;
  
  const floatingShapes: THREE.Mesh[] = [];
  const shapeMaterials = [
    new THREE.MeshPhongMaterial({ color: 0xff0066, transparent: true, opacity: 0.7 }),
    new THREE.MeshPhongMaterial({ color: 0x00ff88, transparent: true, opacity: 0.7 }),
    new THREE.MeshPhongMaterial({ color: 0x0088ff, transparent: true, opacity: 0.7 }),
  ];

  for (let i = 0; i < 12; i++) {
    const shapeType = Math.floor(Math.random() * 3);
    let shape: THREE.Mesh;
    
    if (shapeType === 0) {
      shape = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.3, 0),
        shapeMaterials[0]
      );
    } else if (shapeType === 1) {
      shape = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.1, 8, 16),
        shapeMaterials[1]
      );
    } else {
      shape = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.5, 8),
        shapeMaterials[2]
      );
    }
    
    const angle = (i / 12) * Math.PI * 2;
    const radius = 3 + Math.random() * 4;
    shape.position.set(
      Math.cos(angle) * radius,
      -1.5 + Math.random() * 1,
      Math.sin(angle) * radius
    );
    
    shape.userData = {
      basePosition: shape.position.clone(),
      rotationSpeed: 0.5 + Math.random() * 1,
      floatAmplitude: 0.3 + Math.random() * 0.3,
      floatSpeed: 1 + Math.random() * 2,
      phaseOffset: Math.random() * Math.PI * 2,
    };
    
    groundPlane.add(shape);
    floatingShapes.push(shape);
  }
  
  // Create energy orbs that will pulse with bass
  const orbCount = 6;
  const orbs: THREE.Mesh[] = [];
  const orbGeometry = new THREE.SphereGeometry(0.4, 16, 16);
  const orbMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
  });

  for (let i = 0; i < orbCount; i++) {
    const orb = new THREE.Mesh(orbGeometry, orbMaterial.clone());
    const angle = (i / orbCount) * Math.PI * 2;
    const radius = 5;
    orb.position.set(
      Math.cos(angle) * radius,
      -2,
      Math.sin(angle) * radius
    );
    
    orb.userData = {
      basePosition: orb.position.clone(),
      pulseSpeed: 2 + Math.random() * 2,
      phaseOffset: Math.random() * Math.PI * 2,
      colorPhase: Math.random() * Math.PI * 2,
    };
    
    groundPlane.add(orb);
    orbs.push(orb);
  }
  
  // Create audio-reactive grid lines on the ground
  const gridLines: THREE.Line[] = [];
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.3,
    linewidth: 1,
  });

  for (let i = -10; i <= 10; i += 2) {
    const points = [];
    for (let j = -10; j <= 10; j += 0.5) {
      points.push(new THREE.Vector3(i, 0.01, j));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, gridMaterial);
    line.position.y = 0.02;
    groundPlane.add(line);
    gridLines.push(line);
    
    const verticalPoints = [];
    for (let j = -10; j <= 10; j += 0.5) {
      verticalPoints.push(new THREE.Vector3(j, 0.01, i));
    }
    const verticalGeometry = new THREE.BufferGeometry().setFromPoints(verticalPoints);
    const verticalLine = new THREE.Line(verticalGeometry, gridMaterial);
    verticalLine.position.y = 0.02;
    groundPlane.add(verticalLine);
    gridLines.push(verticalLine);
  }

  groundPlane.userData = {
    isGround: true,
    floatingShapes: floatingShapes,
    orbs: orbs,
    gridLines: gridLines,
    originalVertices: groundGeometry.attributes.position.array.slice(),
  };

  scene.add(groundPlane);
  objects.push(groundPlane);

  // Original biomorphic branches
  const branches = Math.min(Math.floor(params.complexity * 3), 8);
  const maxDepth = Math.min(3 + Math.floor(params.complexity / 2), 5);

  const geometries: THREE.CylinderGeometry[] = [];
  const materials: THREE.MeshPhongMaterial[] = [];

  for (let depth = 0; depth <= maxDepth; depth++) {
    const length = 1.5 / (depth + 1);
    geometries[depth] = new THREE.CylinderGeometry(0.02, 0.05, length, 6);
    materials[depth] = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.3 + depth * 0.1, 0.8, 0.5),
      transparent: true,
      opacity: 0.8,
      shininess: 100,
    });
  }

  const createBranch = (
    depth: number,
    maxDepth: number,
    position: THREE.Vector3,
    direction: THREE.Vector3
  ): THREE.Object3D => {
    if (depth > maxDepth) return new THREE.Object3D();

    const segment = new THREE.Mesh(geometries[depth], materials[depth]);
    segment.position.copy(position);
    segment.lookAt(position.clone().add(direction));
    segment.rotateX(Math.PI / 2);

    const endPosition = position
      .clone()
      .add(direction.clone().multiplyScalar(1.5 / (depth + 1)));

    if (depth < maxDepth) {
      const childCount = Math.min(2 + Math.floor(params.patternDensity), 3);
      for (let i = 0; i < childCount; i++) {
        const angle = (i / childCount) * Math.PI * 2;
        const childDirection = new THREE.Vector3(
          Math.cos(angle) * 0.5,
          Math.sin(angle) * 0.3,
          (Math.random() - 0.5) * 0.5
        ).normalize();

        const child = createBranch(depth + 1, maxDepth, endPosition, childDirection);
        segment.add(child);
      }
    }

    segment.userData = {
      depth,
      pulsePhase: Math.random() * Math.PI * 2,
    };

    return segment;
  };

  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * Math.PI * 2;
    const direction = new THREE.Vector3(
      Math.cos(angle) * 0.5,
      (Math.random() - 0.5) * 0.3,
      Math.sin(angle) * 0.5
    ).normalize();

    const branch = createBranch(0, maxDepth, new THREE.Vector3(), direction);
    branch.position.set(
      Math.cos(angle) * 1.5,
      Math.sin(i) * 0.5,
      Math.sin(angle) * 1.5
    );

    scene.add(branch);
    objects.push(branch);
  }

  return objects;
};