// src/studio/types/visualizer.ts
import * as THREE from 'three';

export interface AIConfig extends Partial<VisualizerParams> {
  name: string;
  description: string;
}

export interface UserVisualizerConfig {
  id: string;
  name: string;
  config: AIConfig;
  createdAt: Date;
  createdBy: string;
  likes: number;
  tags: string[];
}

export interface BackgroundConfig {
  type: 'gradient' | 'particles' | 'nebula' | 'grid' | 'abstract';
  colors: [string, string, string?];
  speed: number;
  complexity: number;
  opacity: number;
}

export interface AudioSource {
  type: 'file' | 'youtube' | 'microphone' | 'oscillator';
  url?: string;
  name: string;
}

export interface VisualizerObjects {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  audioSource:
    | AudioBufferSourceNode
    | MediaElementAudioSourceNode
    | MediaStreamAudioSourceNode
    | OscillatorNode
    | null;
  visualizerObjects: THREE.Object3D[];
}

export interface AudioAnalysis {
  frequencyData: Uint8Array;
  timeData: Float32Array;
  audioLevel: number;
  beatDetected: boolean;
}

export interface VisualizerParams {
  visualizerType:
    | 'spectrum'
    | 'particleWave'
    | 'orbital'
    | 'tunnel'
    | 'nebula'
    | 'crystal'
    | 'solarSystem'
    | 'blackHole'
    | 'galaxy'
    | 'constellation'
    | 'pulsar'
    | 'cometField';
  colorScheme:
    | 'cyberpunk'
    | 'ocean'
    | 'sunset'
    | 'forest'
    | 'neon'
    | 'monochrome'
    | 'rainbow'
    | 'cosmic'
    | 'aurora'
    | 'supernova'
    | 'quasar';
  intensity: number;
  speed: number;
  rotationSpeed: number;
  particleCount: number;
  bloom: boolean;
  wireframe: boolean;
  mirrorEffect: boolean;
  complexity: number;
  scale: number;
  bassBoost: boolean;
  reverb: boolean;
  frequencyRange: [number, number];
  smoothing: number;
  beatDetection: boolean;
  gravity: boolean;
  orbitalPaths: boolean;
  asteroidBelts: boolean;
  planetaryRings: boolean;
  darkMatter: boolean;
}

export interface CelestialBody {
  type:
    | 'star'
    | 'planet'
    | 'moon'
    | 'asteroid'
    | 'comet'
    | 'blackhole'
    | 'nebula'
    | 'pulsar';
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  color: number;
  emissive: number;
  hasRings?: boolean;
  ringColor?: number;
  moons?: CelestialBody[];
}
