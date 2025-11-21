import * as THREE from "three";
import { VisualizerParams } from "../../../shared/types/visualizer.types";

export const createAudioReactiveVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const count = 5000;

  const baseGeometry = new THREE.ConeGeometry(0.02, 0.2, 6, 1, true);
  const instancedGeometry = new THREE.InstancedBufferGeometry();
  instancedGeometry.index = baseGeometry.index;
  instancedGeometry.attributes.position = baseGeometry.attributes.position;
  instancedGeometry.attributes.normal = baseGeometry.attributes.normal;
  instancedGeometry.attributes.uv = baseGeometry.attributes.uv;

  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const angles = new Float32Array(count);
  const rings = new Float32Array(count);

  let i = 0;
  for (let a = 0; a < 100; a++) {
    for (let b = 0; b < 50; b++) {
      const theta = (a / 100) * Math.PI * 2;
      const radius = 2 + b * 0.05;

      offsets[i * 3 + 0] = Math.cos(theta) * radius;
      offsets[i * 3 + 1] = (b - 25) * 0.02;
      offsets[i * 3 + 2] = Math.sin(theta) * radius;

      scales[i] = 0.5 + Math.random() * 0.8;
      angles[i] = Math.random() * Math.PI * 2;
      rings[i] = b;

      i++;
    }
  }

  instancedGeometry.setAttribute("offset", new THREE.InstancedBufferAttribute(offsets, 3));
  instancedGeometry.setAttribute("scale", new THREE.InstancedBufferAttribute(scales, 1));
  instancedGeometry.setAttribute("angle", new THREE.InstancedBufferAttribute(angles, 1));
  instancedGeometry.setAttribute("ring", new THREE.InstancedBufferAttribute(rings, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: params.intensity },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uTreble: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 offset;
      attribute float scale;
      attribute float angle;
      attribute float ring;

      uniform float uTime;
      uniform float uBass;
      uniform float uMid;
      uniform float uTreble;

      varying float vRing;
      varying float vHeight;

      float rand(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      void main() {
        vRing = ring / 50.0;

        vec3 pos = position;

        // Pulse outwards (bass)
        float bassPulse = sin(uTime * 2.0 + ring * 0.1) * uBass * 0.6;
        pos.x += cos(angle) * bassPulse;
        pos.z += sin(angle) * bassPulse;

        // Wobble (mid)
        float wobble = sin(uTime * 1.5 + ring) * uMid * 0.1;
        pos.x += wobble;
        pos.z += wobble;

        // Twist (treble)
        float twist = sin(uTime + ring) * uTreble * 0.3;
        float xNew = pos.x * cos(twist) - pos.z * sin(twist);
        float zNew = pos.x * sin(twist) + pos.z * cos(twist);
        pos.x = xNew;
        pos.z = zNew;

        // Scale by bass
        pos.y *= 1.0 + uBass * 1.0;

        // Random jitter
        pos.x += (rand(angle) - 0.5) * uTreble * 0.05;
        pos.z += (rand(angle + 1.0) - 0.5) * uTreble * 0.05;

        vHeight = pos.y;

        vec4 mvPosition = modelViewMatrix * vec4(pos + offset, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uBass;
      uniform float uTreble;

      varying float vRing;
      varying float vHeight;

      void main() {
        float hue = mod(vRing + uTime * 0.15 + uTreble * 0.5, 1.0);
        float brightness = 0.3 + uBass * 0.6;

        vec3 color = vec3(
          abs(sin(hue * 6.283)),
          abs(sin((hue + 0.33) * 6.283)),
          abs(sin((hue + 0.66) * 6.283))
        );

        gl_FragColor = vec4(color * brightness, 1.0);
      }
    `,
    transparent: false,
  });

  const mesh = new THREE.Mesh(instancedGeometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return [mesh];
};
