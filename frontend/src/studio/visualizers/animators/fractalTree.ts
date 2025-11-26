import * as THREE from "three";

export const animateFractalTree = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
): void => {
  const scaledTime = time * 0.001;

  objects.forEach((obj) => {
    if (!(obj instanceof THREE.InstancedMesh)) return;

    const particleData = (obj.userData as any).particleData as {
      radius: number;
      angle: number;
      speed: number;
      pulsePhase: number;
    }[];

    const dummy = new THREE.Object3D();

    for (let i = 0; i < obj.count; i++) {
      const pdata = particleData[i];
      const dataIndex = Math.floor((i / obj.count) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const spinSpeed = 0.2 + (i % 10) * 0.01;
      pdata.angle += spinSpeed * 0.01;

      const pulse = pdata.radius + Math.sin(scaledTime * pdata.speed + pdata.pulsePhase) * audioValue * 0.5;
      const x = pulse * Math.cos(pdata.angle);
      const z = pulse * Math.sin(pdata.angle);
      const y = Math.sin(scaledTime * 2 + i) * audioValue * 0.3;

      dummy.position.set(x, y, z);
      const scale = 0.5 + audioValue * 1.2;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      obj.setMatrixAt(i, dummy.matrix);
    }

    obj.instanceMatrix.needsUpdate = true;

    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (scaledTime * 0.1) % 1;
      obj.material.color.setHSL(hue, 1, 0.5);
      obj.material.emissive.setHSL(hue, 1, 0.5);
    }
  });
};
