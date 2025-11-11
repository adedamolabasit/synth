import {
  Play,
  Pause,
  Maximize2,
  Square,
  Download,
  Wand2,
  Trash2,
  Volume2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";
import * as THREE from "three";



// Enhanced Types
interface VisualizerParams {
  visualizerType: "spectrum" | "particleWave" | "orbital" | "tunnel" | "nebula" | "crystal";
  colorScheme: "cyberpunk" | "ocean" | "sunset" | "forest" | "neon" | "monochrome" | "rainbow";
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
  frequencyRange: [number, number]; // [low, high]
  smoothing: number;
  beatDetection: boolean;
}

interface AIConfig extends Partial<VisualizerParams> {
  name: string;
  description: string;
}

// Advanced AI Configuration Generator
class AdvancedAIVisualizerGenerator {
  private static colorSchemes = {
    cyberpunk: { primary: 0x00ff88, secondary: 0xff0088, accent: 0x0088ff },
    ocean: { primary: 0x00a8ff, secondary: 0x0095e8, accent: 0x0066cc },
    sunset: { primary: 0xff6b6b, secondary: 0xffa726, accent: 0xff4081 },
    forest: { primary: 0x4caf50, secondary: 0x8bc34a, accent: 0xcddc39 },
    neon: { primary: 0xff00ff, secondary: 0x00ffff, accent: 0xffff00 },
    monochrome: { primary: 0xffffff, secondary: 0xcccccc, accent: 0x888888 },
    rainbow: { primary: 0xff0000, secondary: 0x00ff00, accent: 0x0000ff }
  };

  static generateFromPrompt(prompt: string): AIConfig {
    const presets: { [key: string]: AIConfig } = {
      "cyberpunk city": {
        name: "Cyberpunk City",
        description: "Neon-lit digital metropolis with particle rain",
        visualizerType: "particleWave",
        colorScheme: "cyberpunk",
        intensity: 85,
        speed: 70,
        rotationSpeed: 25,
        particleCount: 5000,
        bloom: true,
        wireframe: false,
        mirrorEffect: true,
        complexity: 8,
        scale: 1.2,
        bassBoost: true,
        reverb: false,
        frequencyRange: [20, 20000],
        smoothing: 0.7,
        beatDetection: true
      },
      "deep ocean": {
        name: "Deep Ocean",
        description: "Calm underwater currents with flowing particles",
        visualizerType: "nebula",
        colorScheme: "ocean",
        intensity: 60,
        speed: 30,
        rotationSpeed: 15,
        particleCount: 3000,
        bloom: true,
        wireframe: false,
        mirrorEffect: false,
        complexity: 6,
        scale: 0.8,
        bassBoost: false,
        reverb: true,
        frequencyRange: [50, 5000],
        smoothing: 0.9,
        beatDetection: false
      },
      "cosmic journey": {
        name: "Cosmic Journey",
        description: "Interstellar travel through nebula clouds",
        visualizerType: "orbital",
        colorScheme: "neon",
        intensity: 75,
        speed: 45,
        rotationSpeed: 20,
        particleCount: 8000,
        bloom: true,
        wireframe: true,
        mirrorEffect: true,
        complexity: 9,
        scale: 1.5,
        bassBoost: true,
        reverb: true,
        frequencyRange: [30, 15000],
        smoothing: 0.8,
        beatDetection: true
      },
      "crystal cave": {
        name: "Crystal Cave",
        description: "Geometric crystals pulsing with energy",
        visualizerType: "crystal",
        colorScheme: "monochrome",
        intensity: 80,
        speed: 40,
        rotationSpeed: 30,
        particleCount: 2000,
        bloom: false,
        wireframe: true,
        mirrorEffect: false,
        complexity: 7,
        scale: 1.1,
        bassBoost: false,
        reverb: false,
        frequencyRange: [100, 10000],
        smoothing: 0.6,
        beatDetection: true
      }
    };

    const lowerPrompt = prompt.toLowerCase();
    let matchedPreset: AIConfig | null = null;

    for (const [key, preset] of Object.entries(presets)) {
      if (lowerPrompt.includes(key)) {
        matchedPreset = { ...preset, name: prompt };
        break;
      }
    }

    return matchedPreset || this.generateCustomConfig(prompt);
  }

  static generateCustomConfig(prompt: string): AIConfig {
    const words = prompt.toLowerCase().split(" ");
    
    const isEnergetic = words.some(w => ["energetic", "intense", "powerful", "dynamic"].includes(w));
    const isCalm = words.some(w => ["calm", "peaceful", "gentle", "soothing"].includes(w));
    const isComplex = words.some(w => ["complex", "detailed", "intricate", "sophisticated"].includes(w));
    const isMinimal = words.some(w => ["minimal", "simple", "clean", "elegant"].includes(w));

    return {
      name: prompt,
      description: `AI-generated ${prompt} visualizer`,
      visualizerType: this.determineVisualizerType(words),
      colorScheme: this.determineColorScheme(words),
      intensity: isEnergetic ? 90 : isCalm ? 50 : 75,
      speed: isEnergetic ? 80 : isCalm ? 20 : 50,
      rotationSpeed: isEnergetic ? 35 : isCalm ? 10 : 25,
      particleCount: isComplex ? 6000 : isMinimal ? 1000 : 3000,
      bloom: !isMinimal,
      wireframe: words.includes("wireframe") || words.includes("grid"),
      mirrorEffect: !isCalm,
      complexity: isComplex ? 9 : isMinimal ? 3 : 6,
      scale: isEnergetic ? 1.4 : isCalm ? 0.7 : 1.0,
      bassBoost: isEnergetic,
      reverb: isCalm,
      frequencyRange: isEnergetic ? [20, 20000] : [50, 8000],
      smoothing: isCalm ? 0.9 : 0.7,
      beatDetection: isEnergetic
    };
  }

  private static determineVisualizerType(words: string[]): VisualizerParams["visualizerType"] {
    if (words.some(w => ["spectrum", "bars", "frequency"].includes(w))) return "spectrum";
    if (words.some(w => ["particle", "wave", "flow"].includes(w))) return "particleWave";
    if (words.some(w => ["orbital", "planet", "space"].includes(w))) return "orbital";
    if (words.some(w => ["tunnel", "vortex", "wormhole"].includes(w))) return "tunnel";
    if (words.some(w => ["nebula", "cloud", "gas"].includes(w))) return "nebula";
    if (words.some(w => ["crystal", "geometric", "fractal"].includes(w))) return "crystal";
    
    const types: VisualizerParams["visualizerType"][] = ["spectrum", "particleWave", "orbital", "tunnel", "nebula", "crystal"];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static determineColorScheme(words: string[]): VisualizerParams["colorScheme"] {
    if (words.some(w => ["cyber", "digital", "matrix"].includes(w))) return "cyberpunk";
    if (words.some(w => ["ocean", "water", "blue"].includes(w))) return "ocean";
    if (words.some(w => ["sunset", "warm", "orange"].includes(w))) return "sunset";
    if (words.some(w => ["forest", "nature", "green"].includes(w))) return "forest";
    if (words.some(w => ["neon", "bright", "vibrant"].includes(w))) return "neon";
    if (words.some(w => ["monochrome", "black", "white"].includes(w))) return "monochrome";
    return "rainbow";
  }

  static getColorValues(scheme: VisualizerParams["colorScheme"]) {
    return this.colorSchemes[scheme];
  }
}

export const LivePreviewCanvas = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [customConfigs, setCustomConfigs] = useState<AIConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<string>("default");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [beatDetected, setBeatDetected] = useState<boolean>(false);

  const [params, setParams] = useState<VisualizerParams>({
    visualizerType: "spectrum",
    colorScheme: "cyberpunk",
    intensity: 75,
    speed: 50,
    rotationSpeed: 25,
    particleCount: 3000,
    bloom: true,
    wireframe: false,
    mirrorEffect: true,
    complexity: 6,
    scale: 1.0,
    bassBoost: false,
    reverb: false,
    frequencyRange: [20, 20000],
    smoothing: 0.8,
    beatDetection: true
  });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationIdRef = useRef<number>(0);
  const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(1024));
  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(1024));
  const beatHistoryRef = useRef<number[]>([]);
  const timeDataRef = useRef<Float32Array>(new Float32Array(2048));

  // Advanced Three.js Initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 15, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Advanced Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const hemisphereLight = new THREE.HemisphereLight(0x443333, 0x111122, 0.2);
    scene.add(hemisphereLight);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener("resize", handleResize);
    createAdvancedVisualizer();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Advanced Audio Setup with YouTube Integration
  useEffect(() => {
    if (!isPlaying) return;

    const setupAdvancedAudio = async (): Promise<void> => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = context.createAnalyser();
        
        // Higher resolution analysis
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = params.smoothing;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;

        // Create advanced audio processing chain
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const biquadFilter = context.createBiquadFilter();

        // Configure audio source
        oscillator.type = "sawtooth";
        oscillator.frequency.value = 110;
        gainNode.gain.value = 0.1;

        // Connect processing chain
        oscillator.connect(gainNode);
        gainNode.connect(biquadFilter);
        biquadFilter.connect(analyser);
        analyser.connect(context.destination);

        // Apply effects based on params
        if (params.bassBoost) {
          biquadFilter.type = "lowshelf";
          biquadFilter.frequency.value = 200;
          biquadFilter.gain.value = 15;
        }

        if (params.reverb) {
          const convolver = context.createConvolver();
          // Simple reverb simulation
          biquadFilter.connect(convolver);
          convolver.connect(analyser);
        }

        oscillator.start();

        audioContextRef.current = context;
        analyserRef.current = analyser;

      } catch (error) {
        console.error("Advanced audio setup failed:", error);
        simulateAdvancedAudioData();
      }
    };

    setupAdvancedAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isPlaying, params.bassBoost, params.reverb, params.smoothing]);

  // Advanced Audio Analysis with Beat Detection
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;

    const analyzeAdvancedAudio = (): void => {
      if (!analyserRef.current) return;

      // Get frequency data
      const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(frequencyData);
      frequencyDataRef.current = frequencyData;

      // Get time domain data for waveform and beat detection
      const timeData = new Float32Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getFloatTimeDomainData(timeData);
      timeDataRef.current = timeData;

      // Calculate overall audio level
      const rms = Math.sqrt(timeData.reduce((sum, value) => sum + value * value, 0) / timeData.length);
      setAudioLevel(rms * 100);

      // Beat detection
      if (params.beatDetection) {
        detectBeat(rms);
      }

      animationIdRef.current = requestAnimationFrame(analyzeAdvancedAudio);
    };

    analyzeAdvancedAudio();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying, params.beatDetection]);

  const detectBeat = (currentLevel: number) => {
    const history = beatHistoryRef.current;
    history.push(currentLevel);
    
    if (history.length > 60) { // Keep last second of data (60fps)
      history.shift();
    }

    if (history.length > 10) {
      const average = history.reduce((a, b) => a + b) / history.length;
      const threshold = average * 1.3; // 30% above average
      
      if (currentLevel > threshold) {
        setBeatDetected(true);
        setTimeout(() => setBeatDetected(false), 100);
      }
    }
  };

  const simulateAdvancedAudioData = (): (() => void) => {
    const interval = setInterval(() => {
      const simulatedData = new Uint8Array(1024);
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < simulatedData.length; i++) {
        // Simulate musical frequency response
        const baseFreq = Math.sin(time * 2 + i * 0.01) * 0.5 + 0.5;
        const harmonic1 = Math.sin(time * 4 + i * 0.02) * 0.3;
        const harmonic2 = Math.sin(time * 8 + i * 0.04) * 0.2;
        const value = (baseFreq + harmonic1 + harmonic2) / 1.5;
        
        simulatedData[i] = Math.floor(value * 155 + 100);
      }
      
      frequencyDataRef.current = simulatedData;
      
      // Simulate beat
      if (Math.sin(time * 2) > 0.9) {
        setBeatDetected(true);
        setTimeout(() => setBeatDetected(false), 100);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  };

  // Advanced Visualizer Creation
  const createAdvancedVisualizer = (): void => {
    if (!sceneRef.current) return;

    // Clear existing objects
    visualizerObjectsRef.current.forEach((obj) => sceneRef.current!.remove(obj));
    visualizerObjectsRef.current = [];

    switch (params.visualizerType) {
      case "spectrum":
        createSpectrumVisualizer();
        break;
      case "particleWave":
        createParticleWaveVisualizer();
        break;
      case "orbital":
        createOrbitalVisualizer();
        break;
      case "tunnel":
        createTunnelVisualizer();
        break;
      case "nebula":
        createNebulaVisualizer();
        break;
      case "crystal":
        createCrystalVisualizer();
        break;
    }
  };

  const createSpectrumVisualizer = (): void => {
    if (!sceneRef.current) return;

    const bars = 128;
    const colors = AdvancedAIVisualizerGenerator.getColorValues(params.colorScheme);

    for (let i = 0; i < bars; i++) {
      const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i / bars) * 0.8, 0.9, 0.6),
        emissive: new THREE.Color(colors.primary).multiplyScalar(0.2),
        shininess: 100
      });

      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (i - bars / 2) * 0.2;
      bar.position.y = 0;
      bar.castShadow = true;
      bar.receiveShadow = true;
      bar.userData = { index: i, baseHeight: 1 };

      sceneRef.current.add(bar);
      visualizerObjectsRef.current.push(bar);
    }
  };

  const createParticleWaveVisualizer = (): void => {
    if (!sceneRef.current) return;

    const particles = params.particleCount;
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);
    const sizes = new Float32Array(particles);

    const colorValues = AdvancedAIVisualizerGenerator.getColorValues(params.colorScheme);

    for (let i = 0; i < particles; i++) {
      const i3 = i * 3;
      const angle = (i / particles) * Math.PI * 2;
      const radius = 5 + Math.random() * 10;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = Math.sin(angle) * radius;

      const color = new THREE.Color().setHSL(
        (i / particles) * 0.8,
        0.8,
        0.6
      );
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    sceneRef.current.add(particleSystem);
    visualizerObjectsRef.current.push(particleSystem);
  };

  const createOrbitalVisualizer = (): void => {
    if (!sceneRef.current) return;

    // Create central sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: AdvancedAIVisualizerGenerator.getColorValues(params.colorScheme).primary,
      emissive: new THREE.Color(0x222222),
      transparent: true,
      opacity: 0.8
    });

    const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    centralSphere.castShadow = true;
    sceneRef.current.add(centralSphere);
    visualizerObjectsRef.current.push(centralSphere);

    // Create orbiting particles
    const orbitCount = 3;
    const particlesPerOrbit = 200;

    for (let orbit = 0; orbit < orbitCount; orbit++) {
      const radius = 4 + orbit * 2;
      
      for (let i = 0; i < particlesPerOrbit; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshPhongMaterial({
          color: AdvancedAIVisualizerGenerator.getColorValues(params.colorScheme).secondary,
          emissive: new THREE.Color(0x111111)
        });

        const particle = new THREE.Mesh(geometry, material);
        const angle = (i / particlesPerOrbit) * Math.PI * 2;
        
        particle.position.x = Math.cos(angle) * radius;
        particle.position.z = Math.sin(angle) * radius;
        particle.userData = { orbit, angle, radius };

        sceneRef.current.add(particle);
        visualizerObjectsRef.current.push(particle);
      }
    }
  };

  const createTunnelVisualizer = (): void => {
    if (!sceneRef.current) return;

    const rings = 20;
    const particlesPerRing = 100;

    for (let ring = 0; ring < rings; ring++) {
      const radius = 2 + ring * 0.5;
      const z = -ring * 2;

      for (let i = 0; i < particlesPerRing; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 6, 6);
        const material = new THREE.MeshPhongMaterial({
          color: AdvancedAIVisualizerGenerator.getColorValues(params.colorScheme).primary,
          emissive: new THREE.Color(0x222222)
        });

        const particle = new THREE.Mesh(geometry, material);
        const angle = (i / particlesPerRing) * Math.PI * 2;
        
        particle.position.x = Math.cos(angle) * radius;
        particle.position.y = Math.sin(angle) * radius;
        particle.position.z = z;
        particle.userData = { ring, angle, radius };

        sceneRef.current.add(particle);
        visualizerObjectsRef.current.push(particle);
      }
    }
  };

  const createNebulaVisualizer = (): void => {
    if (!sceneRef.current) return;

    const cloudCount = 5;
    const particlesPerCloud = 500;

    for (let cloud = 0; cloud < cloudCount; cloud++) {
      const cloudX = (Math.random() - 0.5) * 20;
      const cloudY = (Math.random() - 0.5) * 20;
      const cloudZ = (Math.random() - 0.5) * 20;

      for (let i = 0; i < particlesPerCloud; i++) {
        const geometry = new THREE.SphereGeometry(0.2, 6, 6);
        const material = new THREE.MeshPhongMaterial({
          color: AdvancedAIVisualizerGenerator.getColorValues(params.colorScheme).primary,
          transparent: true,
          opacity: 0.3
        });

        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.x = cloudX + (Math.random() - 0.5) * 8;
        particle.position.y = cloudY + (Math.random() - 0.5) * 8;
        particle.position.z = cloudZ + (Math.random() - 0.5) * 8;

        sceneRef.current.add(particle);
        visualizerObjectsRef.current.push(particle);
      }
    }
  };

  const createCrystalVisualizer = (): void => {
    if (!sceneRef.current) return;

    const crystalCount = 50;

    for (let i = 0; i < crystalCount; i++) {
      const geometry = new THREE.ConeGeometry(0.3, 2, 4);
      const material = new THREE.MeshPhongMaterial({
        color: AdvancedAIVisualizerGenerator.getColorValues(params.colorScheme).primary,
        transparent: true,
        opacity: 0.7,
        wireframe: params.wireframe
      });

      const crystal = new THREE.Mesh(geometry, material);
      
      crystal.position.x = (Math.random() - 0.5) * 20;
      crystal.position.y = (Math.random() - 0.5) * 20;
      crystal.position.z = (Math.random() - 0.5) * 20;
      
      crystal.rotation.x = Math.random() * Math.PI;
      crystal.rotation.y = Math.random() * Math.PI;
      crystal.rotation.z = Math.random() * Math.PI;

      crystal.castShadow = true;
      crystal.receiveShadow = true;

      sceneRef.current.add(crystal);
      visualizerObjectsRef.current.push(crystal);
    }
  };

  // Advanced Animation System
  const animateSpectrum = (frequencyData: Uint8Array, time: number): void => {
    visualizerObjectsRef.current.forEach((bar, i) => {
      if (!(bar instanceof THREE.Mesh)) return;

      const dataIndex = Math.floor(i * (frequencyData.length / visualizerObjectsRef.current.length));
      const frequencyValue = frequencyData[dataIndex] / 255;
      
      // Enhanced animation with multiple frequency bands
      const bass = frequencyData[Math.floor(i * 0.1)] / 255;
      const mid = frequencyData[Math.floor(i * 0.5)] / 255;
      const treble = frequencyData[Math.floor(i * 0.9)] / 255;
      
      const combinedHeight = (bass * 0.4 + mid * 0.3 + treble * 0.3) * params.intensity * 0.2;
      
      bar.scale.y = Math.max(0.1, 1 + combinedHeight);
      bar.position.y = combinedHeight / 2;

      // Dynamic coloring based on frequency and beat
      const hue = (time * params.speed * 0.01 + i * 0.02) % 1;
      const saturation = 0.8 + frequencyValue * 0.2;
      const lightness = 0.5 + frequencyValue * 0.3;

      if (bar.material instanceof THREE.MeshPhongMaterial) {
        bar.material.color.setHSL(hue, saturation, lightness);
        
        // Beat-responsive emissive
        if (beatDetected) {
          bar.material.emissive.setHSL(hue, 0.8, 0.3);
        } else {
          bar.material.emissive.setHSL(hue, 0.5, 0.1);
        }
      }
    });
  };

  const animateParticleWave = (frequencyData: Uint8Array, time: number): void => {
    const particleSystem = visualizerObjectsRef.current[0];
    if (!particleSystem || !(particleSystem instanceof THREE.Points)) return;

    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    const colors = particleSystem.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const particleIndex = i / 3;
      const dataIndex = Math.floor((particleIndex / positions.length) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;

      const angle = (particleIndex / (positions.length / 3)) * Math.PI * 2;
      const baseRadius = 5;
      const waveRadius = baseRadius + frequencyValue * params.intensity * 0.5;
      
      const wave = Math.sin(time * params.speed * 0.01 + particleIndex * 0.1) * 2;
      
      positions[i] = Math.cos(angle) * (waveRadius + wave);
      positions[i + 2] = Math.sin(angle) * (waveRadius + wave);
      positions[i + 1] = (frequencyValue - 0.5) * params.intensity;

      // Dynamic coloring
      const hue = (time * 0.1 + particleIndex * 0.001) % 1;
      colors[i] = hue;
      colors[i + 1] = (hue + 0.3) % 1;
      colors[i + 2] = (hue + 0.6) % 1;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
  };

  const animateOrbital = (frequencyData: Uint8Array, time: number): void => {
    visualizerObjectsRef.current.forEach((obj, i) => {
      if (i === 0) {
        // Central sphere pulsation
        const average = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
        const scale = 1 + average * params.intensity * 0.02;
        obj.scale.set(scale, scale, scale);
        
        if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshPhongMaterial) {
          obj.material.emissiveIntensity = 0.1 + average * 0.3;
        }
      } else {
        // Orbiting particles
        const userData = obj.userData as { orbit: number; angle: number; radius: number };
        const orbitSpeed = (userData.orbit + 1) * params.speed * 0.0005;
        const newAngle = userData.angle + time * orbitSpeed;
        
        const dataIndex = Math.floor((i / visualizerObjectsRef.current.length) * frequencyData.length);
        const frequencyValue = frequencyData[dataIndex] / 255;
        
        const radius = userData.radius + frequencyValue * 2;
        
        obj.position.x = Math.cos(newAngle) * radius;
        obj.position.z = Math.sin(newAngle) * radius;
        obj.position.y = Math.sin(time * 2 + userData.orbit) * 0.5;
        
        obj.userData.angle = newAngle;
      }
    });
  };

  const animateTunnel = (frequencyData: Uint8Array, time: number): void => {
    visualizerObjectsRef.current.forEach((particle, i) => {
      const userData = particle.userData as { ring: number; angle: number; radius: number };
      
      // Move particles through tunnel
      particle.position.z += params.speed * 0.01;
      
      if (particle.position.z > 10) {
        particle.position.z = -30;
      }
      
      // Pulsate based on frequency
      const dataIndex = Math.floor((i / visualizerObjectsRef.current.length) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;
      
      const pulse = 1 + frequencyValue * 0.5;
      particle.scale.set(pulse, pulse, pulse);
      
      // Rotate around tunnel axis
      const newAngle = userData.angle + time * params.speed * 0.001;
      particle.position.x = Math.cos(newAngle) * userData.radius;
      particle.position.y = Math.sin(newAngle) * userData.radius;
      particle.userData.angle = newAngle;
    });
  };

  const animateNebula = (frequencyData: Uint8Array, time: number): void => {
    const average = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;
    
    visualizerObjectsRef.current.forEach((particle, i) => {
      // Gentle floating motion
      particle.position.x += Math.sin(time + i) * 0.001 * params.speed;
      particle.position.y += Math.cos(time + i * 0.5) * 0.001 * params.speed;
      particle.position.z += Math.sin(time + i * 0.3) * 0.001 * params.speed;
      
      // Pulsate with music
      const scale = 0.2 + average * 0.3;
      particle.scale.set(scale, scale, scale);
      
      // Color shift with beat
      if (particle instanceof THREE.Mesh && particle.material instanceof THREE.MeshPhongMaterial) {
        const hue = (time * 0.05 + i * 0.0001) % 1;
        particle.material.color.setHSL(hue, 0.7, 0.6);
        particle.material.opacity = 0.2 + average * 0.3;
      }
    });
  };

  const animateCrystal = (frequencyData: Uint8Array, time: number): void => {
    visualizerObjectsRef.current.forEach((crystal, i) => {
      const dataIndex = Math.floor((i / visualizerObjectsRef.current.length) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;
      
      // Rotate crystals
      crystal.rotation.x += params.speed * 0.0002;
      crystal.rotation.y += params.speed * 0.0003;
      crystal.rotation.z += params.speed * 0.0001;
      
      // Scale with frequency
      const scale = 0.5 + frequencyValue * params.intensity * 0.01;
      crystal.scale.set(scale, scale, scale);
      
      // Beat-responsive highlights
      if (beatDetected && crystal instanceof THREE.Mesh && crystal.material instanceof THREE.MeshPhongMaterial) {
        crystal.material.emissive.set(0x333333);
      }
    });
  };

  // Advanced Animation Loop
  useEffect(() => {
    if (!isPlaying || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const animate = (): void => {
      animationIdRef.current = requestAnimationFrame(animate);

      const frequencyData = frequencyDataRef.current;
      const time = Date.now() * 0.001;

      // Animate based on visualizer type
      switch (params.visualizerType) {
        case "spectrum":
          animateSpectrum(frequencyData, time);
          break;
        case "particleWave":
          animateParticleWave(frequencyData, time);
          break;
        case "orbital":
          animateOrbital(frequencyData, time);
          break;
        case "tunnel":
          animateTunnel(frequencyData, time);
          break;
        case "nebula":
          animateNebula(frequencyData, time);
          break;
        case "crystal":
          animateCrystal(frequencyData, time);
          break;
      }

      // Advanced camera animation
      if (cameraRef.current) {
        if (params.rotationSpeed > 0) {
          cameraRef.current.position.x = Math.sin(time * params.rotationSpeed * 0.005) * 25;
          cameraRef.current.position.z = Math.cos(time * params.rotationSpeed * 0.005) * 25;
          cameraRef.current.lookAt(0, 0, 0);
        }
        
        // Subtle camera movement based on audio
        cameraRef.current.position.y = Math.sin(time * 0.5) * 2;
      }

      // Render scene
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying, params, beatDetected]);

  // AI Configuration Generation
  const generateAIConfig = (): void => {
    if (!aiPrompt.trim()) return;

    const newConfig = AdvancedAIVisualizerGenerator.generateFromPrompt(aiPrompt);
    setCustomConfigs((prev) => [...prev, newConfig]);
    setActiveConfig(newConfig.name);
    setParams((prev) => ({ ...prev, ...newConfig }));
    setAiPrompt("");
  };

  const loadConfig = (configName: string): void => {
    const config = customConfigs.find((c) => c.name === configName);
    if (config) {
      setParams((prev) => ({ ...prev, ...config }));
      setActiveConfig(configName);
    }
  };

  const deleteConfig = (configName: string): void => {
    setCustomConfigs((prev) => prev.filter((c) => c.name !== configName));
    if (activeConfig === configName) {
      setActiveConfig("default");
    }
  };

  // Update visualizer when params change
  useEffect(() => {
    createAdvancedVisualizer();
  }, [
    params.visualizerType,
    params.particleCount,
    params.wireframe,
    params.colorScheme,
    params.complexity,
  ]);

  // Progress simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.3));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = (): void => {
    if (isPlaying && audioContextRef.current) {
      audioContextRef.current.suspend();
    } else if (!isPlaying && audioContextRef.current) {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      <div className="flex-1 relative group">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800"
        />

        {/* Beat Detection Indicator */}
        {beatDetected && (
          <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Enhanced AI Configuration Panel */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe your visualizer (e.g., 'cosmic nebula journey')"
              className="flex-1 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400"
              onKeyPress={(e) => e.key === "Enter" && generateAIConfig()}
            />
            <Button
              variant="primary"
              size="lg"
              icon={<Wand2 size={18} />}
              onClick={generateAIConfig}
              className="px-6"
            >
              Generate
            </Button>
          </div>

          <select
            value={params.visualizerType}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                visualizerType: e.target.value as VisualizerParams["visualizerType"],
              }))
            }
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="spectrum">Frequency Spectrum</option>
            <option value="particleWave">Particle Wave</option>
            <option value="orbital">Orbital System</option>
            <option value="tunnel">Infinite Tunnel</option>
            <option value="nebula">Nebula Cloud</option>
            <option value="crystal">Crystal Field</option>
          </select>

          <select
            value={params.colorScheme}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                colorScheme: e.target.value as VisualizerParams["colorScheme"],
              }))
            }
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="cyberpunk">Cyberpunk</option>
            <option value="ocean">Ocean</option>
            <option value="sunset">Sunset</option>
            <option value="forest">Forest</option>
            <option value="neon">Neon</option>
            <option value="monochrome">Monochrome</option>
            <option value="rainbow">Rainbow</option>
          </select>
        </div>

        {/* Audio Level Meter */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-3 py-2">
            <Volume2 size={16} className="text-slate-300" />
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Custom Configs */}
        {customConfigs.length > 0 && (
          <div className="absolute top-20 left-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {customConfigs.map((config) => (
              <div
                key={config.name}
                className="flex items-center gap-1 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-lg px-3 py-2"
              >
                <button
                  onClick={() => loadConfig(config.name)}
                  className={`text-xs px-2 py-1 rounded transition-all ${
                    activeConfig === config.name
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {config.name}
                </button>
                <button
                  onClick={() => deleteConfig(config.name)}
                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Control Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl px-6 py-3">
          <Button
            variant="secondary"
            size="lg"
            icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
            onClick={handlePlayPause}
            className="px-6"
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>

          <Button
            variant={isRecording ? "danger" : "secondary"}
            size="lg"
            icon={<Square size={20} />}
            onClick={() => setIsRecording(!isRecording)}
            className="px-6"
          >
            {isRecording ? "Stop" : "Record"}
          </Button>

          <Button variant="ghost" size="lg" icon={<Maximize2 size={20} />}>
            Fullscreen
          </Button>

          <Button variant="ghost" size="lg" icon={<Settings size={20} />}>
            Settings
          </Button>
        </div>

        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-sm text-rose-400 font-medium">Recording</span>
          </div>
        )}

        {/* Visualizer Type Badge */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-3 py-2">
            <span className="text-sm text-slate-300 capitalize">
              {params.visualizerType} Visualizer
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Control Panel */}
      <div className="border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl p-6 space-y-6">
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>0:00</span>
            <span>3:54</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Slider
            label="Intensity"
            value={params.intensity}
            onChange={(v) => setParams((p) => ({ ...p, intensity: v }))}
          />
          <Slider
            label="Speed"
            value={params.speed}
            onChange={(v) => setParams((p) => ({ ...p, speed: v }))}
          />
          <Slider
            label="Rotation"
            value={params.rotationSpeed}
            onChange={(v) => setParams((p) => ({ ...p, rotationSpeed: v }))}
          />
          <Slider
            label="Particles"
            value={params.particleCount}
            min={100}
            max={10000}
            onChange={(v) => setParams((p) => ({ ...p, particleCount: v }))}
          />
          <Slider
            label="Complexity"
            value={params.complexity}
            onChange={(v) => setParams((p) => ({ ...p, complexity: v }))}
          />
          <Slider
            label="Scale"
            value={params.scale * 100}
            onChange={(v) => setParams((p) => ({ ...p, scale: v / 100 }))}
          />
          <Slider
            label="Smoothing"
            value={params.smoothing * 100}
            onChange={(v) => setParams((p) => ({ ...p, smoothing: v / 100 }))}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.wireframe}
                onChange={(e) =>
                  setParams((p) => ({ ...p, wireframe: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Wireframe</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.bloom}
                onChange={(e) =>
                  setParams((p) => ({ ...p, bloom: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Bloom Effect</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.mirrorEffect}
                onChange={(e) =>
                  setParams((p) => ({ ...p, mirrorEffect: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Mirror Effect</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.bassBoost}
                onChange={(e) =>
                  setParams((p) => ({ ...p, bassBoost: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Bass Boost</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.beatDetection}
                onChange={(e) =>
                  setParams((p) => ({ ...p, beatDetection: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Beat Detection</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" icon={<Sparkles size={16} />}>
              Presets
            </Button>
            <Button variant="primary" size="sm" icon={<Download size={16} />}>
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};