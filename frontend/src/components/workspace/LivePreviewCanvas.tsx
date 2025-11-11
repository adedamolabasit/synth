import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Download,
  Wand2,
  Trash2,
  Volume2,
  Upload,
  Music,
  Zap,
  Sparkles,
} from "lucide-react";
import { BeatInfo } from "../../studio/types/visualizer";
import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";
import * as THREE from "three";
import { VisualizerParams } from "../../studio/types/visualizer";
import { AudioManager } from "../../studio/audio/AudioManager";
import { VisualizerManager } from "../../studio/visualizers/manager/VisualizerManager";
import { useVisualizer } from "../contexts/VisualizerContext";
import { ElementCustomizationPanel } from "../../studio/visualizers/Elements/ElementCustomizationPanel";
import { VisualElementSelector } from "../../studio/visualizers/Elements/VisualElementSelector";
import { SlidersPanel } from "../ui/SlidersPanel";
import { ControlsPanel } from "../ui/ControlsPanel";
import { LyricsManager } from "../../studio/audio/LyricsManager";
import { LyricsDisplay } from "../ui/LyricsDisplay";

export const LivePreviewCanvas: React.FC = () => {
  const {
    params,
    setParams,
    visualElements,
    selectedElement,
    setSelectedElement,
    audioData,
    setAudioData,
    showVisualizerLibrary,
    setShowVisualizerLibrary,
  } = useVisualizer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string>("");
  const [hasDefaultAudio, setHasDefaultAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);
  const [lyricsData, setLyricsData] = useState<any>(null);

  const audioElementRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const visualizerManagerRef = useRef<VisualizerManager>(
    new VisualizerManager()
  );

  const lyricsManagerRef = useRef<LyricsManager>(new LyricsManager());
  const audioManagerRef = useRef<AudioManager>(new AudioManager());
  const animationIdRef = useRef<number>(0);
  const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
  const ambientObjectsRef = useRef<THREE.Object3D[]>([]);
  const beatInfoRef = useRef<BeatInfo>({
    isBeat: false,
    strength: 0,
    bandStrengths: {},
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isAnimatingRef = useRef(false);
  const lastAnimationTimeRef = useRef(0);

  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);
  const backgroundRef = useRef<THREE.Color | THREE.Texture | null>(null);

  // Create ambient elements function
  const createAmbientElements = useCallback(
    (scene: THREE.Scene) => {
      if (!sceneRef.current) return;

      // Remove existing ambient objects
      ambientObjectsRef.current.forEach((obj) => {
        scene.remove(obj);
      });
      ambientObjectsRef.current = [];

      const ambientElements = visualElements.filter(
        (el) => el.type === "ambient" && el.visible
      );

      ambientElements.forEach((element) => {
        const customization = element.customization as any;
        let object: THREE.Object3D;

        switch (customization.elementType) {
          case "bouncing-ball":
            const ballGeometry = new THREE.SphereGeometry(
              customization.size || 1,
              16,
              16
            );
            const ballMaterial = new THREE.MeshBasicMaterial({
              color: customization.color || "#ffffff",
              transparent: true,
              opacity: customization.opacity || 0.8,
            });
            object = new THREE.Mesh(ballGeometry, ballMaterial);
            break;

          case "floating-particle":
            const particleGeometry = new THREE.SphereGeometry(
              customization.size || 0.3,
              8,
              8
            );
            const particleMaterial = new THREE.MeshBasicMaterial({
              color: customization.color || "#ffffff",
              transparent: true,
              opacity: customization.opacity || 0.6,
            });
            object = new THREE.Mesh(particleGeometry, particleMaterial);
            break;

          case "flying-bird":
            const birdBody = new THREE.SphereGeometry(
              customization.size || 0.5,
              8,
              8
            );
            const birdWing = new THREE.ConeGeometry(
              (customization.size || 0.5) * 0.7,
              1,
              4
            );
            const birdMaterial = new THREE.MeshBasicMaterial({
              color: customization.color || "#ffffff",
              transparent: true,
              opacity: customization.opacity || 0.8,
            });

            object = new THREE.Group();
            const body = new THREE.Mesh(birdBody, birdMaterial);
            const wing1 = new THREE.Mesh(birdWing, birdMaterial);
            const wing2 = new THREE.Mesh(birdWing, birdMaterial);

            wing1.rotation.z = Math.PI / 4;
            wing2.rotation.z = -Math.PI / 4;
            wing1.position.set(0.3, 0, 0);
            wing2.position.set(-0.3, 0, 0);

            object.add(body);
            object.add(wing1);
            object.add(wing2);
            break;

          case "floating-text":
            const textGeometry = new THREE.PlaneGeometry(
              (customization.size || 1) * 2,
              customization.size || 1
            );
            const textMaterial = new THREE.MeshBasicMaterial({
              color: customization.color || "#ffffff",
              transparent: true,
              opacity: customization.opacity || 0.7,
              side: THREE.DoubleSide,
            });
            object = new THREE.Mesh(textGeometry, textMaterial);
            break;

          case "rotating-cube":
            const cubeGeometry = new THREE.BoxGeometry(
              customization.size || 1,
              customization.size || 1,
              customization.size || 1
            );
            const cubeMaterial = new THREE.MeshBasicMaterial({
              color: customization.color || "#ffffff",
              transparent: true,
              opacity: customization.opacity || 0.8,
              wireframe: true,
            });
            object = new THREE.Mesh(cubeGeometry, cubeMaterial);
            break;

          case "pulsing-sphere":
            const sphereGeometry = new THREE.SphereGeometry(
              customization.size || 1,
              16,
              16
            );
            const sphereMaterial = new THREE.MeshBasicMaterial({
              color: customization.color || "#ffffff",
              transparent: true,
              opacity: customization.opacity || 0.7,
            });
            object = new THREE.Mesh(sphereGeometry, sphereMaterial);
            break;

          default:
            const defaultGeometry = new THREE.SphereGeometry(1, 8, 8);
            const defaultMaterial = new THREE.MeshBasicMaterial({
              color: "#ffffff",
              transparent: true,
              opacity: 0.8,
            });
            object = new THREE.Mesh(defaultGeometry, defaultMaterial);
        }

        object.position.set(...element.position);
        object.rotation.set(...element.rotation);
        object.scale.set(...element.scale);

        // Store data in userData without React state
        object.userData = {
          elementId: element.id,
          type: "ambient",
          movementType: customization.movementType || "float",
          speed: customization.speed || 1,
          amplitude: customization.amplitude || 2,
          frequency: customization.frequency || 1,
          bounceHeight: customization.bounceHeight || 3,
          startTime: Date.now() * 0.001,
          startPosition: {
            x: element.position[0],
            y: element.position[1],
            z: element.position[2],
          },
          responsive: customization.responsive !== false,
          responseTo: customization.responseTo || "overall",
          intensity: customization.intensity || 1,
        };

        scene.add(object);
        ambientObjectsRef.current.push(object);
      });
    },
    [visualElements]
  );

  // Animation function for ambient elements
  const animateAmbientElements = useCallback(
    (time: number, beatInfo: BeatInfo) => {
      const bass = beatInfo.bandStrengths.bass || 0;
      const mid = beatInfo.bandStrengths.mid || 0;
      const treble = beatInfo.bandStrengths.treble || 0;
      const overall = beatInfo.strength || 0;

      ambientObjectsRef.current.forEach((object) => {
        const data = object.userData;
        if (!data || !data.startPosition) return;

        // Calculate audio intensity
        let audioIntensity = 1;
        if (data.responsive) {
          switch (data.responseTo) {
            case "bass":
              audioIntensity = 1 + bass * 2 * (data.intensity || 1);
              break;
            case "mid":
              audioIntensity = 1 + mid * 2 * (data.intensity || 1);
              break;
            case "treble":
              audioIntensity = 1 + treble * 2 * (data.intensity || 1);
              break;
            case "beat":
              audioIntensity = beatInfo.isBeat ? 2 * (data.intensity || 1) : 1;
              break;
            case "overall":
              audioIntensity = 1 + overall * 2 * (data.intensity || 1);
              break;
            default:
              audioIntensity = 1;
          }
        }

        const elapsedTime = time - (data.startTime || 0);
        const speed = (data.speed || 1) * audioIntensity;

        // Store current transformations
        const newPosition = { x: 0, y: 0, z: 0 };
        const newRotation = {
          x: object.rotation.x,
          y: object.rotation.y,
          z: object.rotation.z,
        };
        const newScale = {
          x: object.scale.x,
          y: object.scale.y,
          z: object.scale.z,
        };

        // Reset to start position first
        newPosition.x = data.startPosition.x;
        newPosition.y = data.startPosition.y;
        newPosition.z = data.startPosition.z;

        switch (data.movementType) {
          case "bounce":
            const bounceY =
              Math.abs(Math.sin(elapsedTime * speed * 2)) *
              (data.bounceHeight || 3) *
              audioIntensity;
            newPosition.y = data.startPosition.y + bounceY;
            newPosition.x =
              data.startPosition.x +
              Math.sin(elapsedTime * speed * 0.5) * (data.amplitude || 2);
            break;

          case "float":
            newPosition.y =
              data.startPosition.y +
              Math.sin(elapsedTime * speed) *
                (data.amplitude || 2) *
                audioIntensity;
            newPosition.x =
              data.startPosition.x +
              Math.cos(elapsedTime * speed * 0.7) * (data.amplitude || 2);
            break;

          case "fly":
            const radius = (data.amplitude || 2) * 3;
            const angle = elapsedTime * speed;
            newPosition.x = data.startPosition.x + Math.cos(angle) * radius;
            newPosition.z = data.startPosition.z + Math.sin(angle) * radius;
            newPosition.y =
              data.startPosition.y +
              Math.sin(elapsedTime * speed * 3) * 2 * audioIntensity;

            // Wing flapping for birds
            if (object.children.length > 0) {
              object.children.forEach((child, index) => {
                if (index > 0) {
                  child.rotation.z =
                    Math.PI / 4 +
                    Math.sin(elapsedTime * speed * 8) * 0.5 * audioIntensity;
                }
              });
            }
            break;

          case "rotate":
            newRotation.x = elapsedTime * speed;
            newRotation.y = elapsedTime * speed * 0.7;
            newPosition.y =
              data.startPosition.y +
              Math.sin(elapsedTime * speed) * (data.amplitude || 2) * 0.5;
            break;

          case "pulse":
            const pulseScale =
              1 + Math.sin(elapsedTime * speed * 2) * 0.3 * audioIntensity;
            newScale.x = pulseScale;
            newScale.y = pulseScale;
            newScale.z = pulseScale;
            newPosition.y =
              data.startPosition.y +
              Math.sin(elapsedTime * speed) * (data.amplitude || 2);
            break;

          default:
            // Default floating motion
            newPosition.y =
              data.startPosition.y +
              Math.sin(elapsedTime * speed) * (data.amplitude || 2);
            break;
        }

        // Apply the new transformations directly to THREE.js objects
        object.position.set(newPosition.x, newPosition.y, newPosition.z);
        object.rotation.set(newRotation.x, newRotation.y, newRotation.z);
        object.scale.set(newScale.x, newScale.y, newScale.z);

        // Random slight rotation for all types
        object.rotation.z += 0.01 * speed;
      });
    },
    []
  );

  // Main animation loop
  const animateScene = useCallback(
    (time: number) => {
      if (
        !isAnimatingRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !rendererRef.current
      )
        return;

      animationIdRef.current = requestAnimationFrame(animateScene);

      const frequencyData = audioManagerRef.current.getFrequencyData();
      const timeData = audioManagerRef.current.getTimeDomainData();
      const currentTime = time * 0.001;

      const beatInfo = audioManagerRef.current.detectBeat(frequencyData);
      beatInfoRef.current = beatInfo;

      const convertedTimeData =
        timeData instanceof Uint8Array
          ? new Float32Array(timeData.length).map(
              (_, i) => (timeData[i] - 128) / 128
            )
          : timeData;

      // Throttle audio data updates
      if (currentTime - lastAnimationTimeRef.current > 0.016) {
        setAudioData({
          frequencyData,
          timeData: convertedTimeData,
          beatInfo,
          audioLevel: beatInfo.strength * 100,
        });
        lastAnimationTimeRef.current = currentTime;
      }

      const bass = beatInfo.bandStrengths.bass || 0;
      const mid = beatInfo.bandStrengths.mid || 0;
      const treble = beatInfo.bandStrengths.treble || 0;
      const overall = beatInfo.strength || 0;

      // Update lights based on audio
      visualElements.forEach((element) => {
        if (!element.visible || element.type !== "light") return;

        const responseTo =
          (element.customization as any).responseTo || "overall";
        let intensity = 1;

        switch (responseTo) {
          case "bass":
            intensity = 1 + bass * 2;
            break;
          case "mid":
            intensity = 1 + mid * 2;
            break;
          case "treble":
            intensity = 1 + treble * 2;
            break;
          case "beat":
            intensity = beatInfo.isBeat ? 2 : 1;
            break;
          case "overall":
            intensity = 1 + overall * 2;
            break;
        }

        if (element.id === "ambient-light" && ambientLightRef.current) {
          ambientLightRef.current.intensity =
            (element.customization as any).intensity * intensity;
          ambientLightRef.current.color.set(
            (element.customization as any).color
          );
        }

        if (element.id === "directional-light" && directionalLightRef.current) {
          directionalLightRef.current.intensity =
            (element.customization as any).intensity * intensity;
          directionalLightRef.current.color.set(
            (element.customization as any).color
          );
        }

        pointLightsRef.current.forEach((light) => {
          light.intensity =
            (element.customization as any).intensity * intensity;
          light.color.set((element.customization as any).color);
        });
      });

      if (params.beatDetection && beatInfo.isBeat) {
        setBeatDetected(true);
        setTimeout(() => setBeatDetected(false), 100);
      }

      // Animate main visualizer
      visualizerManagerRef.current.animateVisualizer(
        visualizerObjectsRef.current,
        frequencyData,
        currentTime,
        params,
        beatInfo
      );

      // Animate ambient elements
      animateAmbientElements(currentTime, beatInfo);

      // Camera movement
      if (cameraRef.current && params.rotationSpeed > 0) {
        const cameraDistance = 15 + bass * 5;
        const cameraSpeed = params.rotationSpeed * 0.005 + bass * 0.01;

        cameraRef.current.position.x =
          Math.sin(currentTime * cameraSpeed) * cameraDistance;
        cameraRef.current.position.z =
          Math.cos(currentTime * cameraSpeed) * cameraDistance;
        cameraRef.current.position.y =
          Math.sin(currentTime * cameraSpeed * 0.7) * 3;
        cameraRef.current.lookAt(0, 0, 0);
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    },
    [params, visualElements, animateAmbientElements]
  );

  // Setup useEffect
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    updateBackground(scene);
    createLightsFromElements(scene);
    createAmbientElements(scene);
    createVisualizer();

    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current)
        return;
      cameraRef.current.aspect =
        canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    const loadDefaultAudio = async () => {
      try {
        await audioManagerRef.current.initialize();
        const success = await audioManagerRef.current.loadDefaultAudio();
        if (success) {
          setHasDefaultAudio(true);
        }
      } catch (error) {
        console.error("Failed to load default audio:", error);
      }
    };

    loadDefaultAudio();

    return () => {
      window.removeEventListener("resize", handleResize);
      isAnimatingRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      audioManagerRef.current.cleanup();
    };
  }, []);

  // Animation control useEffect
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const startAnimation = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      lastAnimationTimeRef.current = 0;
      animationIdRef.current = requestAnimationFrame(animateScene);
    };

    const stopAnimation = () => {
      isAnimatingRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = 0;
      }
    };

    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [isPlaying, animateScene]);

  // Visual elements update useEffect
  useEffect(() => {
    if (sceneRef.current) {
      updateBackground(sceneRef.current);
      createLightsFromElements(sceneRef.current);
      createAmbientElements(sceneRef.current);
    }
  }, [visualElements, createAmbientElements]);

  // Audio progress useEffect
  useEffect(() => {
    const manager = audioManagerRef.current;
    const handleProgressUpdate = (
      currentTime: number,
      totalDuration: number
    ) => {
      setProgress((currentTime / totalDuration) * 100);
      setDuration(totalDuration);
      setIsPlaying(manager.isPlaying());
    };

    manager.onTimeUpdate(handleProgressUpdate);
    return () => {
      manager.offTimeUpdate(handleProgressUpdate);
    };
  }, []);

  // Visualizer params update useEffect
  useEffect(() => {
    createVisualizer();
  }, [
    params.visualizerType,
    params.complexity,
    params.wireframe,
    params.objectSize,
    params.particleCount,
  ]);

  const updateBackground = (scene: THREE.Scene) => {
    const backgroundElement = visualElements.find(
      (el) => el.id === "background"
    );
    if (!backgroundElement || !backgroundElement.visible) {
      scene.background = new THREE.Color(0x0a0a0a);
      return;
    }

    const customization = backgroundElement.customization as any;
    if (
      customization.gradient &&
      customization.gradientStart &&
      customization.gradientEnd
    ) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d")!;
      const gradient = context.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, customization.gradientStart);
      gradient.addColorStop(1, customization.gradientEnd);
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);

      const texture = new THREE.CanvasTexture(canvas);
      scene.background = texture;
      backgroundRef.current = texture;
    } else {
      scene.background = new THREE.Color(customization.color || 0x0a0a0a);
      backgroundRef.current = scene.background;
    }
  };

  const createLightsFromElements = (scene: THREE.Scene) => {
    if (ambientLightRef.current) scene.remove(ambientLightRef.current);
    if (directionalLightRef.current) scene.remove(directionalLightRef.current);
    pointLightsRef.current.forEach((light) => scene.remove(light));
    pointLightsRef.current = [];

    visualElements.forEach((element) => {
      if (element.type === "light" && element.visible) {
        const customization = element.customization as any;

        if (element.id === "ambient-light") {
          const light = new THREE.AmbientLight(
            customization.color || "#ffffff",
            customization.intensity || 1
          );
          ambientLightRef.current = light;
          scene.add(light);
        } else if (element.id === "directional-light") {
          const light = new THREE.DirectionalLight(
            customization.color || "#ffffff",
            customization.intensity || 1
          );

          // Alternative: Use type assertion
          const position = (customization.position || [5, 5, 5]) as [
            number,
            number,
            number
          ];
          light.position.set(...position);

          directionalLightRef.current = light;
          scene.add(light);
        } else {
          const light = new THREE.PointLight(
            customization.color || "#ffffff",
            customization.intensity || 1,
            customization.distance || 100,
            customization.decay || 2
          );
          light.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          );
          pointLightsRef.current.push(light);
          scene.add(light);
        }
      }
    });
  };

  const createVisualizer = () => {
    if (!sceneRef.current) return;

    visualizerObjectsRef.current.forEach((obj) => {
      sceneRef.current!.remove(obj);
    });
    visualizerObjectsRef.current = [];

    const objects = visualizerManagerRef.current.createVisualizer(
      sceneRef.current,
      params
    );
    visualizerObjectsRef.current = objects;
  };

  const togglePlayback = async () => {
    const manager = audioManagerRef.current;
    if (!manager) return;

    try {
      if (manager.isPlaying()) {
        manager.pause();
        setIsPlaying(false);
      } else {
        await manager.play();
        setIsPlaying(true);
        setAudioError("");
      }
    } catch (error) {
      console.error("Playback error:", error);
      setAudioError("Failed to play audio");
    }
  };

  const extractLyricsFromAudio = async (audioFile: File) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const response = await fetch("http://localhost:8000/api/lyrics/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setLyricsData(data);
        lyricsManagerRef.current.loadLyrics(data);

        // Also load into audio manager
        audioManagerRef.current.loadLyricsData(data);
      } else {
        console.error("Lyrics extraction failed:", data.error);
      }
    } catch (error) {
      console.error("Error extracting lyrics:", error);
    }
  };

  const handleAudioUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setAudioError("Please select a valid audio file");
      return;
    }

    setIsLoading(true);
    setAudioError("");

    try {
      await audioManagerRef.current.initialize();
      const success = await audioManagerRef.current.loadAudioFile(file);
      if (success) {
        setUploadedAudio(file);
        setAudioName(file.name);
        setHasDefaultAudio(false);

        await extractLyricsFromAudio(file);
      } else {
        throw new Error("Failed to load audio file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setAudioError("Error uploading audio file");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearAudio = () => {
    setUploadedAudio(null);
    setAudioName("");
    setAudioError("");
    audioManagerRef.current.cleanup();
    setIsPlaying(false);

    audioManagerRef.current = new AudioManager();
    const loadDefault = async () => {
      await audioManagerRef.current.initialize();
      await audioManagerRef.current.loadDefaultAudio();
      setHasDefaultAudio(true);
    };
    loadDefault();
  };

  const handleDemoAudio = async () => {
    try {
      if (!hasDefaultAudio) {
        await audioManagerRef.current.loadDefaultAudio();
        setHasDefaultAudio(true);
      }
      setUploadedAudio(null);
      setAudioName("Default Demo Audio");
      setAudioError("");
    } catch (error) {
      console.error("Demo audio failed:", error);
      setAudioError("Failed to load demo audio");
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioManagerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioManagerRef.current.seekTo(newTime);
  };

  useEffect(() => {
    // Connect lyrics manager to audio manager
    audioManagerRef.current.setLyricsManager(lyricsManagerRef.current);
  }, []);

  const canPlayAudio = uploadedAudio || hasDefaultAudio;

  return (
    <div className="h-full  w-full flex flex-col bg-slate-900/50">
      <audio
        ref={audioElementRef}
        style={{ display: "none" }}
        crossOrigin="anonymous"
      />
      <div className="flex-1 relative group">
        <canvas ref={canvasRef} className="w-full h-full" />

        <ElementCustomizationPanel />
        <VisualElementSelector />


          <div className="mt-92">
   <LyricsDisplay
          lyricsManager={lyricsManagerRef.current}
          className="pointer-events-none"
        />
          </div>
     

        {beatDetected && (
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl px-6 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="sm"
                icon={<Upload size={16} />}
                className="px-4"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Upload"}
              </Button>
            </label>
            {(audioName || hasDefaultAudio) && (
              <div className="flex items-center gap-2">
                <Music size={14} className="text-slate-300" />
                <span className="text-sm text-slate-300 max-w-32 truncate">
                  {audioName || "Default Audio"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={handleClearAudio}
                  className="p-1 hover:bg-slate-700/50"
                />
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="lg"
            icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
            onClick={togglePlayback}
            className="px-6"
            disabled={!canPlayAudio || isLoading}
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>

          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-slate-300" />
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-100"
                style={{ width: `${audioData.audioLevel}%` }}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-4 right-4">
          <div
            className="w-full h-2 bg-gray-700 rounded cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="bg-green-500 h-2 rounded transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{Math.floor((progress / 100) * duration)}s</span>
            <span>{Math.floor(duration)}s</span>
          </div>
        </div>

        {audioError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {audioError}
          </div>
        )}

        {!uploadedAudio && !hasDefaultAudio && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-8 max-w-md">
              <Upload size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Upload Audio to Visualize
              </h3>
              <p className="text-slate-300 mb-4">
                Upload an MP3, WAV, or other audio file to see it come to life
                with dynamic visualizations.
              </p>
              <label htmlFor="audio-upload">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Upload size={20} />}
                  className="w-full"
                >
                  Choose Audio File
                </Button>
              </label>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Wand2 size={16} />}
                  onClick={handleDemoAudio}
                  className="w-full"
                >
                  Try Demo Audio
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl p-6 space-y-6">
        <SlidersPanel params={params} onParamsChange={setParams} />
        <ControlsPanel
          params={params}
          onParamsChange={setParams}
          onDemoAudio={handleDemoAudio}
          canvasRef={canvasRef}
          audioManager={audioManagerRef.current} // Pass the AudioManager instance
        />
      </div>
    </div>
  );
};
