import * as THREE from "three";

export const animateLightningStorm = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
): void => {
  
  objects.forEach((obj) => {
    if (obj.userData.isBolt && obj instanceof THREE.Line) {
      const index = obj.userData.index || 0;
      const dataIndex = Math.floor((index / 10) * frequencyData.length);
      const audioValue = frequencyData[dataIndex] / 255;

      const startPos = obj.userData.startPos;
      const endPos = obj.userData.endPos;
      const points: THREE.Vector3[] = [];
      const segments = 15;

      points.push(startPos.clone());

      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const point = new THREE.Vector3().lerpVectors(startPos, endPos, t);
        point.x += (Math.random() - 0.5) * 0.5 * (1 + audioValue);
        point.y += (Math.random() - 0.5) * 0.5 * (1 + audioValue);
        point.z += (Math.random() - 0.5) * 0.5 * (1 + audioValue);
        points.push(point);
      }

      points.push(endPos.clone());

      obj.geometry.setFromPoints(points);

      if (obj.material instanceof THREE.LineBasicMaterial) {
        obj.material.opacity = 0.7 + audioValue * 0.3;
      }
    } else if (obj instanceof THREE.Mesh && !obj.userData.isBolt) {
      const avgAudio = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;

      const scale = 1 + avgAudio * 0.8;
      obj.scale.set(scale, scale, scale);

      if (obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissiveIntensity = 1 + avgAudio * 1.5;
      }
    }
  });
};
