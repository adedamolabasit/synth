import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateAudioReactive = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.PerspectiveCamera
): void => {
  const bass = frequencyData[10] / 255;
  const mid = frequencyData[75] / 255;
  const treble = frequencyData[140] / 255;

  if (camera) {
    const neuralOrbit = time * 0.03;
    const neuralRadius = 18 + Math.sin(time * 0.08) * 4;
    const neuralHeight = Math.sin(time * 0.05) * 8;

    camera.position.x = Math.cos(neuralOrbit) * neuralRadius;
    camera.position.y = neuralHeight;
    camera.position.z = Math.sin(neuralOrbit) * neuralRadius;

    const focusPoint = new THREE.Vector3(
      Math.sin(time * 0.02) * 5,
      Math.cos(time * 0.03) * 3,
      Math.sin(time * 0.04) * 2
    );
    camera.lookAt(focusPoint);

    if (beatInfo?.isBeat && bass > 0.8) {
      camera.position.x += (Math.random() - 0.5) * 0.5;
      camera.position.y += (Math.random() - 0.5) * 0.3;
      camera.position.z += (Math.random() - 0.5) * 0.5;
    }
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "neuralCosmos") return;

    const neurons = obj.userData.neurons as THREE.Mesh[];
    const axons = obj.userData.axons as THREE.Line[];
    const synapticFields = obj.userData.synapticFields as THREE.Points[];
    const neuralImpulses = obj.userData.neuralImpulses as THREE.Points;
    const neuronStates = obj.userData.neuronStates as number[];
    const axonPhases = obj.userData.axonPhases as number[];
    const impulseData = obj.userData.impulseData;

    const cosmicSpeed = params.speed * 0.0015;

    obj.userData.cosmicTime += cosmicSpeed;

    neurons.forEach((neuron, index) => {
      const state = neuronStates[index];
      const freqIndex = Math.floor(
        (index / neurons.length) * frequencyData.length
      );
      const activation = frequencyData[freqIndex] / 255;

      neuronStates[index] = (state + cosmicSpeed * activation) % 1;

      const pulse = Math.sin(time * 2 + index * 0.1) * 0.3 + 0.7;
      neuron.scale.setScalar(pulse + activation * 0.4);

      neuron.rotation.x += cosmicSpeed * (1 + mid);
      neuron.rotation.y += cosmicSpeed * (1 + bass);
      neuron.rotation.z += cosmicSpeed * (1 + treble);

      const material = neuron.material as THREE.MeshPhysicalMaterial;
      const hue = (index * 0.005 + time * 0.01 + activation * 0.2) % 1;
      material.color.setHSL(hue, 0.9, 0.5 + activation * 0.3);
      material.emissive.setHSL(hue, 0.7, 0.2 + activation * 0.3);
      material.emissiveIntensity = 0.1 + activation * 0.4;

      neuron.position.y += Math.sin(time * 1.2 + index) * 0.02 * bass;
    });

    synapticFields.forEach((field, index) => {
      const geometry = field.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute("position");
      const colorAttr = geometry.getAttribute("color");
      const positions = posAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;

      const neuron = neurons[index];
      const activation = neuronStates[index];

      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;

        const orbitSpeed = 1 + Math.sin(time + particleIndex) * 0.5;
        const angle = time * orbitSpeed + particleIndex * 0.2;

        positions[i] = Math.cos(angle) * (1.5 + Math.sin(time * 1.5) * 0.5);
        positions[i + 1] =
          Math.sin(angle * 1.3) * (1.5 + Math.cos(time * 1.7) * 0.5);
        positions[i + 2] = Math.sin(angle) * (1.5 + Math.cos(time * 1.5) * 0.5);

        const hue = (index * 0.005 + activation * 0.3) % 1;
        const color = new THREE.Color().setHSL(
          hue,
          0.8,
          0.6 + activation * 0.3
        );
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      field.position.copy(neuron.position);

      const fieldMaterial = field.material as THREE.PointsMaterial;
      fieldMaterial.size = 0.08 + activation * 0.12;
      fieldMaterial.opacity = 0.4 + activation * 0.4;
    });

    axons.forEach((axon, index) => {
      const geometry = axon.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const phase = axonPhases[index];

      const pulse = Math.sin(time * 3 + phase) * 0.5 + 0.5;

      for (let i = 0; i < positions.length; i += 3) {
        const segment = i / (positions.length - 3);
        const segmentPulse = Math.sin(segment * Math.PI * 2 + time * 4) * 0.1;
        positions[i + 1] += segmentPulse * bass;
      }

      geometry.attributes.position.needsUpdate = true;

      const material = axon.material as THREE.LineBasicMaterial;
      material.opacity = 0.1 + pulse * 0.3 + mid * 0.2;
    });

    const impulseGeometry = neuralImpulses.geometry as THREE.BufferGeometry;
    const impulsePositions = impulseData.positions;
    const impulsePaths = impulseData.paths;
    const impulseProgress = impulseData.progress;

    for (let i = 0; i < impulseProgress.length; i++) {
      const i3 = i * 3;
      let progress = impulseProgress[i];
      const speed = impulsePaths[i3 + 2] * 0.02 + 0.01;

      progress = (progress + speed * (1 + bass)) % 1;
      impulseProgress[i] = progress;

      if (progress < 0.01) {
        const newStart = Math.floor(Math.random() * neurons.length);
        const newEnd =
          (newStart + Math.floor(Math.random() * 20) + 1) % neurons.length;

        impulsePaths[i3] = newStart;
        impulsePaths[i3 + 1] = newEnd;
        impulsePaths[i3 + 2] = Math.random();
      }

      const startPos = neurons[impulsePaths[i3]].position;
      const endPos = neurons[impulsePaths[i3 + 1]].position;

      impulsePositions[i3] = startPos.x + (endPos.x - startPos.x) * progress;
      impulsePositions[i3 + 1] =
        startPos.y + (endPos.y - startPos.y) * progress;
      impulsePositions[i3 + 2] =
        startPos.z + (endPos.z - startPos.z) * progress;
    }

    impulseGeometry.attributes.position.needsUpdate = true;

    obj.rotation.y += cosmicSpeed * bass * 0.3;
    obj.rotation.x += cosmicSpeed * mid * 0.2;

    if (beatInfo?.isBeat) {
      neurons.forEach((neuron, index) => {
        neuronStates[index] = 1;
        neuron.scale.setScalar(1.5);

        const material = neuron.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = 1;

        setTimeout(() => {
          neuron.scale.setScalar(1);
          material.emissiveIntensity = 0.2;
        }, 200);
      });

      for (let i = 0; i < impulseProgress.length; i++) {
        impulseProgress[i] += 0.3;
      }

      synapticFields.forEach((field) => {
        const material = field.material as THREE.PointsMaterial;
        material.size = 0.2;
        material.opacity = 0.9;
        setTimeout(() => {
          material.size = 0.1;
          material.opacity = 0.6;
        }, 150);
      });
    }
  });
};
