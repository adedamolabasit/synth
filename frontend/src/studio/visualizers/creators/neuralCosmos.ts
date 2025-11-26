import * as THREE from "three";

export const createNeuralCosmosVisualizer = (
  scene: THREE.Scene,
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const neuralCosmosGroup = new THREE.Group();
  
  const neuronCount = 200;
  const neurons: THREE.Mesh[] = [];
  const axons: THREE.Line[] = [];
  const synapticFields: THREE.Points[] = [];

  for (let i = 0; i < neuronCount; i++) {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const y = 1 - (i / (neuronCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const goldenAngle = Math.PI * 2 * goldenRatio;
    const theta = goldenAngle * i;
    
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    
    const position = new THREE.Vector3(x, y, z).multiplyScalar(12);

    const neuronGeometry = new THREE.DodecahedronGeometry(0.4, 1);
    const neuronMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(i * 0.005, 0.9, 0.6),
      emissive: new THREE.Color().setHSL(i * 0.005, 0.7, 0.3),
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9
    });

    const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
    neuron.position.copy(position);
    neuralCosmosGroup.add(neuron);
    neurons.push(neuron);

    const synapticCount = 30;
    const synapticGeometry = new THREE.BufferGeometry();
    const synapticPositions = new Float32Array(synapticCount * 3);
    const synapticColors = new Float32Array(synapticCount * 3);

    for (let j = 0; j < synapticCount; j++) {
      const i3 = j * 3;
      const synapticRadius = 1.5 + Math.random() * 2;
      const synapticTheta = Math.random() * Math.PI * 2;
      const synapticPhi = Math.acos(2 * Math.random() - 1);
      
      synapticPositions[i3] = Math.sin(synapticPhi) * Math.cos(synapticTheta) * synapticRadius;
      synapticPositions[i3 + 1] = Math.sin(synapticPhi) * Math.sin(synapticTheta) * synapticRadius;
      synapticPositions[i3 + 2] = Math.cos(synapticPhi) * synapticRadius;

      const color = new THREE.Color().setHSL(i * 0.005, 0.8, 0.7);
      synapticColors[i3] = color.r;
      synapticColors[i3 + 1] = color.g;
      synapticColors[i3 + 2] = color.b;
    }

    synapticGeometry.setAttribute("position", new THREE.BufferAttribute(synapticPositions, 3));
    synapticGeometry.setAttribute("color", new THREE.BufferAttribute(synapticColors, 3));

    const synapticMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const synapticField = new THREE.Points(synapticGeometry, synapticMaterial);
    synapticField.position.copy(position);
    neuralCosmosGroup.add(synapticField);
    synapticFields.push(synapticField);
  }

  for (let i = 0; i < neuronCount; i++) {
    const connectionCount = 4;
    for (let j = 0; j < connectionCount; j++) {
      const targetIndex = (i + Math.floor(Math.random() * 20) + 1) % neuronCount;
      
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(6);
      positions[0] = neurons[i].position.x;
      positions[1] = neurons[i].position.y;
      positions[2] = neurons[i].position.z;
      positions[3] = neurons[targetIndex].position.x;
      positions[4] = neurons[targetIndex].position.y;
      positions[5] = neurons[targetIndex].position.z;

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL((i * 0.005 + targetIndex * 0.005) / 2, 0.8, 0.5),
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });

      const axon = new THREE.Line(geometry, material);
      neuralCosmosGroup.add(axon);
      axons.push(axon);
    }
  }

  const impulseCount = 100;
  const impulseGeometry = new THREE.BufferGeometry();
  const impulsePositions = new Float32Array(impulseCount * 3);
  const impulsePaths = new Float32Array(impulseCount * 3);
  const impulseProgress = new Float32Array(impulseCount);
  const impulseColors = new Float32Array(impulseCount * 3);

  for (let i = 0; i < impulseCount; i++) {
    const i3 = i * 3;
    const startNeuron = Math.floor(Math.random() * neuronCount);
    const endNeuron = (startNeuron + Math.floor(Math.random() * 20) + 1) % neuronCount;
    
    impulsePaths[i3] = startNeuron;
    impulsePaths[i3 + 1] = endNeuron;
    impulsePaths[i3 + 2] = Math.random();
    
    impulsePositions[i3] = neurons[startNeuron].position.x;
    impulsePositions[i3 + 1] = neurons[startNeuron].position.y;
    impulsePositions[i3 + 2] = neurons[startNeuron].position.z;
    
    impulseProgress[i] = 0;

    const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.9, 0.7);
    impulseColors[i3] = color.r;
    impulseColors[i3 + 1] = color.g;
    impulseColors[i3 + 2] = color.b;
  }

  impulseGeometry.setAttribute("position", new THREE.BufferAttribute(impulsePositions, 3));
  impulseGeometry.setAttribute("color", new THREE.BufferAttribute(impulseColors, 3));
  impulseGeometry.setAttribute("path", new THREE.BufferAttribute(impulsePaths, 3));
  impulseGeometry.setAttribute("progress", new THREE.BufferAttribute(impulseProgress, 1));

  const impulseMaterial = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const neuralImpulses = new THREE.Points(impulseGeometry, impulseMaterial);
  neuralCosmosGroup.add(neuralImpulses);

  neuralCosmosGroup.userData = {
    type: "neuralCosmos",
    neurons,
    axons,
    synapticFields,
    neuralImpulses,
    neuronStates: neurons.map(() => Math.random()),
    axonPhases: axons.map(() => Math.random() * Math.PI * 2),
    impulseData: {
      positions: impulsePositions,
      paths: impulsePaths,
      progress: impulseProgress
    },
    cosmicTime: 0,
    isLyrics: false,
  };

  scene.add(neuralCosmosGroup);
  objects.push(neuralCosmosGroup);
  return objects;
};