import * as THREE from "three";

export const createCyberGrid2Visualizer = (
  scene: THREE.Scene
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const gridGroup = new THREE.Group();
  const gridSize = 12;
  const nodes: THREE.Mesh[] = [];
  const connections: THREE.Line[] = [];

  for (let x = -gridSize; x <= gridSize; x += 2) {
    for (let y = -gridSize; y <= gridSize; y += 2) {
      for (let z = -gridSize; z <= gridSize; z += 2) {
        if (Math.random() > 0.7) continue;

        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.9, 0.5),
          transparent: true,
          opacity: 0.8,
        });

        const node = new THREE.Mesh(geometry, material);
        node.position.set(x, y, z);
        gridGroup.add(node);
        nodes.push(node);
      }
    }
  }

  nodes.forEach((node, index) => {
    for (let i = index + 1; i < Math.min(index + 10, nodes.length); i++) {
      const otherNode = nodes[i];
      const distance = node.position.distanceTo(otherNode.position);

      if (distance < 4 && Math.random() > 0.5) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
          node.position.x,
          node.position.y,
          node.position.z,
          otherNode.position.x,
          otherNode.position.y,
          otherNode.position.z,
        ]);

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );

        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.7, 0.8, 0.6),
          transparent: true,
          opacity: 0.4,
        });

        const connection = new THREE.Line(geometry, material);
        gridGroup.add(connection);
        connections.push(connection);
      }
    }
  });

  gridGroup.userData = {
    type: "cyberGrid",
    nodes,
    connections,
    dataFlow: Array.from({ length: nodes.length }, () => 0),
    packetDirections: nodes.map(() =>
      new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize()
    ),
    isLyrics: false,
  };

  scene.add(gridGroup);
  objects.push(gridGroup);
  return objects;
};
