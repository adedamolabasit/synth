import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Music, Video } from "lucide-react";
import { BeatInfo } from "../../../shared/types/visualizer.types";
import { Button } from "../../ui/Button";
import * as THREE from "three";
import { VisualizerManager } from "../../../studio/visualizers/manager/VisualizerManager";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { ElementCustomizationPanel } from "../../../studio/visualizers/Elements/ElementCustomizationPanel";
import { VisualElementSelector } from "../../../studio/visualizers/Elements/VisualElementSelector";
import { SlidersPanel } from "./SlidersPanel";
import { ControlsPanel } from "./ControlsPanel";
import { LyricsManager } from "../../../studio/visualizers/manager/LyricsManager";
import { useAudio } from "../../../provider/AudioContext";
import { decodeLyricsData } from "../../../shared/utils";
import { LyricsRenderer } from "../../../studio/visualizers/manager/LyricsRenderer";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export const LivePreviewCanvas: React.FC = () => {
  const {
    currentAudio,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    pauseAudio,
    resumeAudio,
    seekTo,
    frequencyData,
    timeData,
    beatInfo,
    audioLevel,
  } = useAudio();

  const {
    params,
    setParams,
    visualElements,
    setAudioData,
    setShowDownloadModal,
    showDownloadModal,
    setVideoBlob,
    videoBlob,
  } = useVisualizer();

  const { user, primaryWallet } = useDynamicContext();

  const walletAddress = primaryWallet?.address;
  const isConnected = !!user;

  const [audioName, setAudioName] = useState<string>("");
  const [audioError, setAudioError] = useState<string>("");
  const [hasDefaultAudio, setHasDefaultAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [videoName, setVideoName] = useState(`visualizer-${Date.now()}`);
  const [isUploading, setIsUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const visualizerManagerRef = useRef<VisualizerManager>(
    new VisualizerManager()
  );
  const lyricsRendererRef = useRef<LyricsRenderer | null>(null);
  const lyricsManagerRef = useRef<LyricsManager>(new LyricsManager());
  const animationIdRef = useRef<number>(0);
  const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
  const ambientObjectsRef = useRef<THREE.Object3D[]>([]);

  const isAnimatingRef = useRef(false);
  const lastAnimationTimeRef = useRef(0);

  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);
  const backgroundRef = useRef<THREE.Color | THREE.Texture | null>(null);

  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (currentAudio) {
      setAudioName(currentAudio.metadata?.name || currentAudio.name);
      setHasDefaultAudio(false);
    } else if (hasDefaultAudio) {
      setAudioName("Default Demo Audio");
    } else {
      setAudioName("");
    }
  }, [currentAudio, hasDefaultAudio]);

  useEffect(() => {
    const convertedTimeData =
      timeData instanceof Uint8Array
        ? new Float32Array(timeData.length).map(
            (_, i) => (timeData[i] - 128) / 128
          )
        : timeData;

    setAudioData({
      frequencyData,
      timeData: convertedTimeData,
      beatInfo,
      audioLevel,
    });
  }, [frequencyData, timeData, beatInfo, audioLevel, setAudioData]);

  const createAmbientElements = useCallback(
    (scene: THREE.Scene) => {
      if (!sceneRef.current) return;

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

        object.position.set(...(element.position as [number, number, number]));
        object.rotation.set(...(element.rotation as [number, number, number]));
        object.scale.set(...(element.scale as [number, number, number]));

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

  const animateAmbientElements = useCallback(
    (time: number, beatInfo: BeatInfo) => {
      const bass = beatInfo.bandStrengths.bass || 0;
      const mid = beatInfo.bandStrengths.mid || 0;
      const treble = beatInfo.bandStrengths.treble || 0;
      const overall = beatInfo.strength || 0;

      ambientObjectsRef.current.forEach((object) => {
        const data = object.userData;
        if (!data || !data.startPosition) return;

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
            newPosition.y =
              data.startPosition.y +
              Math.sin(elapsedTime * speed) * (data.amplitude || 2);
            break;
        }

        object.position.set(newPosition.x, newPosition.y, newPosition.z);
        object.rotation.set(newRotation.x, newRotation.y, newRotation.z);
        object.scale.set(newScale.x, newScale.y, newScale.z);

        object.rotation.z += 0.01 * speed;
      });
    },
    []
  );

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

      const currentTime = time * 0.001;

      const bass = beatInfo.bandStrengths.bass || 0;
      const mid = beatInfo.bandStrengths.mid || 0;
      const treble = beatInfo.bandStrengths.treble || 0;
      const overall = beatInfo.strength || 0;

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

      visualizerManagerRef.current.animateVisualizer(
        visualizerObjectsRef.current,
        frequencyData,
        currentTime,
        params,
        beatInfo
      );

      animateAmbientElements(currentTime, beatInfo);

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
    [params, visualElements, animateAmbientElements, frequencyData, beatInfo]
  );

  const updateBackground = useCallback(
    (scene: THREE.Scene) => {
      const backgroundElement = visualElements.find(
        (el) => el.id === "background"
      );
      if (!backgroundElement || !backgroundElement.visible) {
        scene.background = new THREE.Color(0x0a0a0a);
        return;
      }

      const customization = backgroundElement.customization as any;
      const backgroundType =
        customization.backgroundType ||
        (customization.image
          ? "image"
          : customization.gradient
          ? "gradient"
          : "color");

      switch (backgroundType) {
        case "image":
          if (customization.image) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(customization.image, (texture) => {
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              texture.repeat.set(
                customization.imageScale || 1,
                customization.imageScale || 1
              );
              texture.offset.set(
                customization.imageOffsetX || 0,
                customization.imageOffsetY || 0
              );

              scene.background = texture;
              backgroundRef.current = texture;
            });
          } else {
            scene.background = new THREE.Color(customization.color || 0x0a0a0a);
            backgroundRef.current = scene.background;
          }
          break;

        case "gradient":
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
          break;

        case "color":
        default:
          scene.background = new THREE.Color(customization.color || 0x0a0a0a);
          backgroundRef.current = scene.background;
          break;
      }
    },
    [visualElements]
  );

  const createLightsFromElements = useCallback(
    (scene: THREE.Scene) => {
      if (ambientLightRef.current) scene.remove(ambientLightRef.current);
      if (directionalLightRef.current)
        scene.remove(directionalLightRef.current);
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
    },
    [visualElements]
  );

  const createVisualizer = useCallback(() => {
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
  }, [params]);

  const handleSaveVideo = async () => {
    if (!videoBlob) return;

    setIsUploading(true);

    const formData = new FormData();
    const fileName = videoName.trim()
      ? `${videoName}.webm`
      : `visualizer-${Date.now()}.webm`;
    const file = new File([videoBlob], fileName, { type: "video/webm" });
    formData.append("video", file);

    try {
      const response = await fetch(
        `http://localhost:8000/api/video/upload/${walletAddress}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setShowDownloadModal(false);
        setVideoBlob(null);
        setVideoName(`visualizer-${Date.now()}`);
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

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
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    setSceneReady(true);

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

    return () => {
      window.removeEventListener("resize", handleResize);
      isAnimatingRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      sceneRef.current?.clear();
      rendererRef.current?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      setSceneReady(false);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    updateBackground(sceneRef.current);
    createLightsFromElements(sceneRef.current);
    createAmbientElements(sceneRef.current);
  }, [
    visualElements,
    updateBackground,
    createLightsFromElements,
    createAmbientElements,
  ]);

  useEffect(() => {
    if (!sceneRef.current) return;
    createVisualizer();
  }, [
    params.visualizerType,
    params.complexity,
    params.wireframe,
    params.objectSize,
    params.particleCount,
    createVisualizer,
  ]);

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

  useEffect(() => {
    if (sceneRef.current && lyricsManagerRef.current && rendererRef.current) {
      lyricsRendererRef.current = new LyricsRenderer(
        sceneRef.current,
        lyricsManagerRef.current
      );
    }

    return () => {
      lyricsRendererRef.current?.dispose();
    };
  }, []);

  const togglePlayback = async () => {
    if (!currentAudio && !hasDefaultAudio) {
      await handleDemoAudio();
      return;
    }

    if (isPlaying) {
      pauseAudio();
    } else {
      if (currentAudio) {
        await resumeAudio();
      }
    }
  };

  const handleDemoAudio = async () => {
    try {
      if (!hasDefaultAudio) {
        setHasDefaultAudio(true);
        setAudioName("Default Demo Audio");
      }
      setAudioError("");
    } catch (error) {
      setAudioError("Failed to load demo audio");
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  useEffect(() => {
    const loadLyrics = async () => {
      if (currentAudio?.lyrics) {
        try {
          let lyricsData = {
            text: await decodeLyricsData(currentAudio.lyrics),
            timestamps: await decodeLyricsData(currentAudio.words as string),
            segments: await decodeLyricsData(currentAudio.segments as string),
          };

          if (lyricsData) {
            lyricsManagerRef.current.loadLyrics(lyricsData);
          } else {
          }
        } catch (error) {}
      } else {
        lyricsManagerRef.current.reset();
      }
    };

    loadLyrics();
  }, [currentAudio]);

  useEffect(() => {
    if (isPlaying && currentTime > 0) {
      lyricsManagerRef.current.update(currentTime);
    }
  }, [currentTime, isPlaying]);

  const canPlayAudio = currentAudio || hasDefaultAudio;

  return (
    <div className="h-full w-full flex flex-col bg-slate-900/50">
      <div className="flex-1 relative group">
        <canvas ref={canvasRef} className="w-full h-full" />

        {sceneReady && (
          <>
            <div className="overflow-visible">
              <ElementCustomizationPanel />
            </div>
            <div className="overflow-visible">
              <VisualElementSelector />
            </div>
          </>
        )}

        {beatDetected && (
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {isConnected && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl px-8 py-4 shadow-2xl">
            {audioName && (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700/30">
                  <Music size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-200 font-medium truncate max-w-48">
                    {audioName}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center items-center">
              <Button
                variant="secondary"
                size="md"
                icon={isPlaying ? <Pause size={22} /> : <Play size={22} />}
                onClick={togglePlayback}
                disabled={!canPlayAudio || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 "
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : isPlaying ? (
                  "Pause"
                ) : (
                  "Play"
                )}
              </Button>
              <ControlsPanel
                params={params}
                onParamsChange={setParams}
                onDemoAudio={handleDemoAudio}
                canvasRef={canvasRef}
              />
            </div>
            <div className="flex items-center justify-end min-w-0 flex-1">
              <SlidersPanel params={params} onParamsChange={setParams} />
            </div>
          </div>
        )}

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
            <span>{Math.floor(currentTime)}s</span>
            <span>{Math.floor(duration)}s</span>
          </div>
        </div>

        {audioError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {audioError}
          </div>
        )}

        {!currentAudio && !hasDefaultAudio && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-8 max-w-md">
              <Music size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Select Audio to Visualize
              </h3>
              <p className="text-slate-300 mb-4">
                Upload a new audio or select one from the Audio Player on the
                left to see it come to life with dynamic visualizations.
              </p>
            </div>
          </div>
        )}

        {showDownloadModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-slate-900/90 border border-slate-700 shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>

              <Video size={48} className="mx-auto mb-4 text-slate-400" />

              <h3 className="text-xl font-semibold text-white text-center mb-2">
                Save Video
              </h3>

              <p className="text-slate-300 text-center mb-4">
                Save your video to watch later in your media.
              </p>

              <input
                type="text"
                className="w-full rounded-lg p-2 mb-6 text-black"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Enter video name"
              />

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveVideo}
                  disabled={isUploading}
                  className={`w-full ${
                    isUploading
                      ? "bg-gray-600 hover:bg-gray-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUploading ? "Saving..." : "Save Visualizer Output"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
