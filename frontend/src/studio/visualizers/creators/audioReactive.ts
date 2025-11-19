import * as THREE from "three";
import { VisualizerParams } from "../../../shared/types/visualizer.types";
// import noise from "../utils/noise"; // simplex noise function

export const createAudioReactiveVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const noise = new SimplexNoise();
  const count = 5000;
  const instancedGeometry = new THREE.InstancedBufferGeometry();
  const baseGeometry = new THREE.CylinderGeometry(0.02, 0.05, 1, 6, 1, true);

  instancedGeometry.index = baseGeometry.index;
  instancedGeometry.attributes.position = baseGeometry.attributes.position;
  instancedGeometry.attributes.normal = baseGeometry.attributes.normal;
  instancedGeometry.attributes.uv = baseGeometry.attributes.uv;

  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const ringIndex = new Float32Array(count);

  let i = 0;
  for (let a = 0; a < 100; a++) {
    for (let b = 0; b < 50; b++) {
      const theta = (a / 100) * Math.PI * 2;
      const rad = 2 + b * 0.05;

      offsets[i * 3 + 0] = Math.cos(theta) * rad;
      offsets[i * 3 + 1] = (b - 25) * 0.02;
      offsets[i * 3 + 2] = Math.sin(theta) * rad;

      scales[i] = 1 + Math.random() * 0.5;
      ringIndex[i] = b;

      i++;
    }
  }

  instancedGeometry.setAttribute(
    "offset",
    new THREE.InstancedBufferAttribute(offsets, 3)
  );
  instancedGeometry.setAttribute(
    "scale",
    new THREE.InstancedBufferAttribute(scales, 1)
  );
  instancedGeometry.setAttribute(
    "ringIndex",
    new THREE.InstancedBufferAttribute(ringIndex, 1)
  );

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
      attribute float ringIndex;

      uniform float uTime;
      uniform float uBass;
      uniform float uMid;
      uniform float uTreble;

      varying float vRing;
      varying float vHeight;

      void main() {
        vRing = ringIndex / 50.0;

        vec3 pos = position;

        // organic wobble
        float noiseVal = sin(uTime * 1.5 + ringIndex * 0.1) * uMid * 0.04;
        pos.x += noiseVal;
        pos.z += noiseVal;

        // scale by bass
        float scaleFactor = 1.0 + uBass * 0.6;
        pos.y *= scaleFactor;

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
        float hue = mod(vRing + uTime * 0.1 + uTreble * 0.5, 1.0);
        float brightness = 0.4 + uBass * 0.4;

        vec3 color = vec3(
          abs(sin(hue * 6.283)),
          abs(sin((hue + 0.33) * 6.283)),
          abs(sin((hue + 0.66) * 6.283))
        );

        gl_FragColor = vec4(color * brightness, 1.0);
      }
    `,
    transparent: false,
    depthWrite: true,
  });

  const mesh = new THREE.Mesh(instancedGeometry, material);
  mesh.frustumCulled = false;

  scene.add(mesh);

  return [mesh];
};



// Simplex noise implementation (2D/3D)
// from Stefan Gustavson’s algorithm – optimized for real-time graphics

export default class SimplexNoise {
  private grad3: number[][] = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
  ];

  private p: number[] = [];
  private perm: number[] = [];
  private permMod12: number[] = [];

  constructor(seed: number = Math.random() * 65536) {
    this.p = new Array(256);

    for (let i = 0; i < 256; i++) {
      this.p[i] = (seed + i * 1315423911) & 255;
    }

    this.perm = new Array(512);
    this.permMod12 = new Array(512);

    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    let n0 = 0, n1 = 0, n2 = 0;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;

    const X0 = i - t;
    const Y0 = j - t;

    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1 = 0, j1 = 0;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    const t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      const g = this.grad3[gi0];
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }

    const t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      const g = this.grad3[gi1];
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }

    const t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      const g = this.grad3[gi2];
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }

    return 70 * (n0 + n1 + n2);
  }
}
