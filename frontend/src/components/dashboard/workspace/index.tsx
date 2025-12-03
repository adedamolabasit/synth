import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { VisualizerManager } from "../../../studio/visualizers/manager/VisualizerManager";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { ElementCustomizationPanel } from "../../../studio/visualizers/Elements/ElementCustomizationPanel";
import { VisualElementSelector } from "../../../studio/visualizers/Elements/VisualElementSelector";
import { LyricsManager } from "../../../studio/visualizers/manager/LyricsManager";
import { useAudio } from "../../../provider/AudioContext";
import { LyricsRenderer } from "../../../studio/visualizers/manager/LyricsRenderer";
import { decodeLyricsData } from "../../../shared/utils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { CanvasControls } from "./components/CanvasControls";
import { useToastContext } from "../../ui/Toast.tsx/ToastProvider";
import { ElementRendererManager } from "../../../studio/visualizers/manager/ElementRendererManager";

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
    sceneBackground,
  } = useVisualizer();

  const { user, primaryWallet } = useDynamicContext();
  const toast = useToastContext(); // Initialize toast

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [forceRefresh, setForceRefresh] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const visualizerManagerRef = useRef<VisualizerManager>(
    new VisualizerManager()
  );

  const elementRendererRef = useRef<ElementRendererManager | null>(null);
  const lyricsRendererRef = useRef<LyricsRenderer | null>(null);
  const lyricsManagerRef = useRef<LyricsManager>(new LyricsManager());
  const animationIdRef = useRef<number>(0);
  const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
  const isAnimatingRef = useRef(false);
  const lastAnimationTimeRef = useRef(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(
    null
  );
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const wasPlayingRef = useRef(false);

  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

  const audioSyncCountRef = useRef(0);
  const animationFrameCountRef = useRef(0);

  useEffect(() => {
    if (params.showLyrics === undefined) {
      setParams((prev) => ({
        ...prev,
        showLyrics: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (isRecording && duration > 0 && currentTime >= duration - 0.5) {
      console.log("Audio finished, stopping recording...");
      handleRecordVideo();
    }
  }, [currentTime, duration, isRecording]);

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
    if (!frequencyData || !timeData) return;

    const convertedTimeData =
      timeData instanceof Uint8Array
        ? Float32Array.from(timeData, (v) => (v - 128) / 128)
        : timeData;

    setAudioData((prev: any) => {
      if (!prev) {
        return {
          frequencyData,
          timeData: convertedTimeData,
          beatInfo,
          audioLevel,
        };
      }

      const same =
        prev.frequencyData?.length === frequencyData.length &&
        prev.timeData?.length === convertedTimeData.length &&
        prev.beatInfo?.strength === beatInfo.strength &&
        prev.audioLevel === audioLevel;

      if (same) return prev;

      return {
        frequencyData,
        timeData: convertedTimeData,
        beatInfo,
        audioLevel,
      };
    });
  }, [frequencyData, timeData, beatInfo.strength, audioLevel]);

  useEffect(() => {
    const loadLyrics = async () => {
      if (currentAudio?.lyrics) {
        try {
          console.log("Loading lyrics for audio:", currentAudio.name);
          let lyricsData = {
            text: await decodeLyricsData(currentAudio.lyrics),
            timestamps: await decodeLyricsData(currentAudio.words as string),
            segments: await decodeLyricsData(currentAudio.segments as string),
          };

          if (lyricsData) {
            lyricsManagerRef.current.loadLyrics(lyricsData);
            console.log("Lyrics loaded successfully");
          } else {
            console.log("No lyrics data found");
          }
        } catch (error) {
          console.error("Error loading lyrics:", error);
        }
      } else {
        lyricsManagerRef.current.reset();
        console.log("No lyrics available for current audio");
      }
    };

    loadLyrics();
  }, [currentAudio]);

  useEffect(() => {
    if (isPlaying && currentTime > 0 && params.showLyrics) {
      lyricsManagerRef.current.update(currentTime);
    }
  }, [currentTime, isPlaying, params.showLyrics]);

  useEffect(() => {
    if (!lyricsRendererRef.current || !sceneReady) {
      console.log("Lyrics renderer not ready yet");
      return;
    }

    console.log("Lyrics visibility changed:", params.showLyrics);
    if (params.showLyrics) {
      lyricsRendererRef.current.show();
      console.log("Lyrics shown");
    } else {
      lyricsRendererRef.current.hide();
      console.log("Lyrics hidden");
    }
  }, [params.showLyrics, sceneReady]);

  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

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

    elementRendererRef.current = new ElementRendererManager(scene);

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

    scene.background = new THREE.Color(
      sceneBackground.type === "color"
        ? sceneBackground.color || "#0a0a0a"
        : "#0a0a0a"
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    lyricsRendererRef.current = new LyricsRenderer(
      scene,
      lyricsManagerRef.current
    );

    console.log("Initializing lyrics renderer - starting with lyrics hidden");
    lyricsRendererRef.current.hide();

    setSceneReady(true);

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
      lyricsRendererRef.current?.dispose();

      // Clean up element renderer
      elementRendererRef.current?.dispose();

      sceneRef.current?.clear();
      rendererRef.current?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      elementRendererRef.current = null;
      setSceneReady(false);

      audioSyncCountRef.current = 0;
      animationFrameCountRef.current = 0;
    };
  }, []);

  useEffect(() => {
  if (!elementRendererRef.current || !sceneReady) return;

  console.log('Updating elements:', visualElements.length);

  // Get current element IDs
  const currentElementIds = new Set(visualElements.map(el => el.id));
  
  // Get existing object IDs from the renderer
  const existingObjects = elementRendererRef.current.getObjectIds();
  
  // Remove elements that no longer exist
  existingObjects.forEach(id => {
    if (!currentElementIds.has(id)) {
      console.log('Removing element:', id);
      elementRendererRef.current?.removeElement(id);
    }
  });
  
  // Add/update elements
  visualElements.forEach(element => {
    // Skip light and background elements (they're handled differently)
    if (element.type === 'light' || element.type === 'background') return;
    
    // Check if element already exists
    if (existingObjects.includes(element.id)) {
      // Update existing element
      elementRendererRef.current?.updateElement(element);
    } else {
      // Create new element
      console.log('Creating new element:', element.id, element.type);
      elementRendererRef.current?.createElementObject(element);
    }
  });

  setForceRefresh(prev => prev + 1)
  
  // Force a re-render if we're animating
  if (isAnimatingRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }
}, [visualElements, sceneReady]);

  // Add this useEffect to handle custom elements
  useEffect(() => {
    if (!elementRendererRef.current || !sceneReady) return;

    // Get current element IDs
    const currentElementIds = new Set(visualElements.map((el) => el.id));

    // Get existing object IDs from the renderer (you'll need to expose this)
    const existingObjects = elementRendererRef.current.getObjectIds();

    // Remove elements that no longer exist
    existingObjects.forEach((id) => {
      if (!currentElementIds.has(id)) {
        elementRendererRef.current?.removeElement(id);
      }
    });

    // Add/update elements
    visualElements.forEach((element) => {
      if (element.type !== "light" && element.type !== "background") {
        // Check if element already exists
        if (!existingObjects.includes(element.id)) {
          // Create new element
          elementRendererRef.current?.createElementObject(element);
        } else {
          // Update existing element
          elementRendererRef.current?.updateElement(element);
        }
      }
    });
  }, [visualElements, sceneReady]);

// In LivePreviewCanvas.tsx, update the background useEffect:

useEffect(() => {
  if (!sceneRef.current) return;

  console.log("Applying scene background:", sceneBackground);

  const applyBackground = () => {
    if (!sceneRef.current) return;

    const background = sceneBackground || { type: "color", color: "#0a0a0a" };

    switch (background.type) {
      case "color":
        console.log("Setting color background:", background.color);
        sceneRef.current.background = new THREE.Color(
          background.color || "#0a0a0a"
        );
        break;

      case "image":
        if (background.image) {
          console.log("Setting image background:", background.image);
          // Dispose of previous texture if it exists
          if (sceneRef.current.background instanceof THREE.Texture) {
            sceneRef.current.background.dispose();
          }
          
          const loader = new THREE.TextureLoader();
          loader.load(
            background.image,
            (texture) => {
              sceneRef.current!.background = texture;
              // Set opacity if provided (for image backgrounds, we need a different approach)
              if (background.imageOpacity !== undefined) {
                // For image opacity, we might need to use a different approach
                // as THREE.js doesn't directly support background opacity
                console.log("Image opacity set to:", background.imageOpacity);
              }
              
              // Force a re-render immediately
              if (
                rendererRef.current &&
                cameraRef.current &&
                sceneRef.current
              ) {
                rendererRef.current.render(
                  sceneRef.current,
                  cameraRef.current
                );
              }
            },
            undefined,
            (error) => {
              console.error("Error loading background image:", error);
              sceneRef.current!.background = new THREE.Color("#0a0a0a");
            }
          );
        } else {
          sceneRef.current.background = new THREE.Color("#0a0a0a");
        }
        break;

      case "gradient":
        console.log("Setting gradient background:", background.gradient);
        // Create gradient texture
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        if (
          ctx &&
          background.gradient?.colors &&
          background.gradient.colors.length > 0
        ) {
          let gradient;
          const colors = background.gradient.colors;

          if (background.gradient.type === "radial") {
            gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
          } else {
            gradient = ctx.createLinearGradient(0, 0, 512, 512);
          }

          // Add color stops
          colors.forEach((color: string, index: number) => {
            gradient.addColorStop(index / (colors.length - 1), color);
          });

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 512, 512);

          const texture = new THREE.CanvasTexture(canvas);
          sceneRef.current.background = texture;
          
          // Force a re-render immediately
          if (
            rendererRef.current &&
            cameraRef.current &&
            sceneRef.current
          ) {
            rendererRef.current.render(
              sceneRef.current,
              cameraRef.current
            );
          }
        } else {
          sceneRef.current.background = new THREE.Color("#0a0a0a");
        }
        break;

      default:
        sceneRef.current.background = new THREE.Color("#0a0a0a");
    }
  };

  applyBackground();
}, [sceneBackground]); // This effect runs when sceneBackground changes

    useEffect(() => {
    if (sceneReady && rendererRef.current && sceneRef.current && cameraRef.current && !isAnimatingRef.current) {
      // Only render if not currently animating
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [forceRefresh, sceneReady]);


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

  // const animateScene = useCallback(
  //   (time: number) => {
  //     if (
  //       !isAnimatingRef.current ||
  //       !sceneRef.current ||
  //       !cameraRef.current ||
  //       !rendererRef.current
  //     )
  //       return;

  //     animationFrameCountRef.current++;

  //     animationIdRef.current = requestAnimationFrame(animateScene);

  //     const currentTime = time * 0.001;

  //     const bass = beatInfo.bandStrengths.bass || 0;
  //     const mid = beatInfo.bandStrengths.mid || 0;
  //     const treble = beatInfo.bandStrengths.treble || 0;
  //     const overall = beatInfo.strength || 0;

  //     elementRendererRef.current?.animateElements(currentTime, beatInfo);

  //     visualElements.forEach((element) => {
  //       if (!element.visible) return;

  //       // Handle light elements
  //       if (element.type === "light") {
  //         const responseTo =
  //           (element.customization as any).responseTo || "overall";
  //         let intensity = 1;

  //         switch (responseTo) {
  //           case "bass":
  //             intensity = 1 + bass * 2;
  //             break;
  //           case "mid":
  //             intensity = 1 + mid * 2;
  //             break;
  //           case "treble":
  //             intensity = 1 + treble * 2;
  //             break;
  //           case "beat":
  //             intensity = beatInfo.isBeat ? 2 : 1;
  //             break;
  //           case "overall":
  //             intensity = 1 + overall * 2;
  //             break;
  //         }

  //         if (element.id === "ambient-light" && ambientLightRef.current) {
  //           ambientLightRef.current.intensity =
  //             (element.customization as any).intensity * intensity;
  //           ambientLightRef.current.color.set(
  //             (element.customization as any).color
  //           );
  //         }

  //         if (
  //           element.id === "directional-light" &&
  //           directionalLightRef.current
  //         ) {
  //           directionalLightRef.current.intensity =
  //             (element.customization as any).intensity * intensity;
  //           directionalLightRef.current.color.set(
  //             (element.customization as any).color
  //           );
  //         }
  //       }

  //       // Handle text elements
  //       if (element.type === "text") {
  //         const customization = element.customization as any;
  //         // Update text position, rotation, scale based on element properties
  //         // You'll need to get the THREE.js object for this element
  //         // and update its properties
  //       }

  //       // Handle image/GIF elements
  //       if (element.type === "image" || element.type === "gif") {
  //         const customization = element.customization as any;
  //         // Update image/GIF position, rotation, scale
  //       }

  //       // Handle particle systems
  //       if (element.type === "particleSystem") {
  //         const customization = element.customization as any;
  //         // Update particle system animation
  //       }

  //       // Handle overlays
  //       if (element.type === "overlay") {
  //         const customization = element.customization as any;
  //         // Update overlay effects
  //       }

  //       // Handle ambient elements
  //       if (element.type === "ambient") {
  //         const customization = element.customization as any;
  //         // Update ambient element animation based on movementType
  //       }
  //     });

  //     if (params.beatDetection && beatInfo.isBeat) {
  //       setBeatDetected(true);
  //       setTimeout(() => setBeatDetected(false), 100);
  //     }

  //     visualizerManagerRef.current.animateVisualizer(
  //       visualizerObjectsRef.current,
  //       frequencyData,
  //       currentTime,
  //       params,
  //       beatInfo
  //     );

  //     if (cameraRef.current && params.rotationSpeed > 0) {
  //       const cameraDistance = 15 + bass * 5;
  //       const cameraSpeed = params.rotationSpeed * 0.005 + bass * 0.01;

  //       cameraRef.current.position.x =
  //         Math.sin(currentTime * cameraSpeed) * cameraDistance;
  //       cameraRef.current.position.z =
  //         Math.cos(currentTime * cameraSpeed) * cameraDistance;
  //       cameraRef.current.position.y =
  //         Math.sin(currentTime * cameraSpeed * 0.7) * 3;
  //       cameraRef.current.lookAt(0, 0, 0);
  //     }

  //     rendererRef.current.render(sceneRef.current, cameraRef.current);
  //   },
  //   [params, visualElements, frequencyData, beatInfo]
  // );

  const animateScene = useCallback(
    (time: number) => {
      if (
        !isAnimatingRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !rendererRef.current
      )
        return;

      animationFrameCountRef.current++;

      animationIdRef.current = requestAnimationFrame(animateScene);

      const currentTime = time * 0.001;

      const bass = beatInfo.bandStrengths.bass || 0;
      const mid = beatInfo.bandStrengths.mid || 0;
      const treble = beatInfo.bandStrengths.treble || 0;
      const overall = beatInfo.strength || 0;

      // Update element animations
    if (elementRendererRef.current) {
      elementRendererRef.current.animateElements(currentTime, {
        bass,
        mid,
        treble,
        overall,
        ...beatInfo
      });
    }

      visualElements.forEach((element) => {
        if (!element.visible) return;

         const customization = element.customization as any;
      if (customization.responsive && customization.responseTo) {
        let intensity = 1;
        const object = elementRendererRef.current?.getObject(element.id);
        
        if (object) {
          switch (customization.responseTo) {
            case 'bass':
              intensity = 1 + bass * 2;
              break;
            case 'mid':
              intensity = 1 + mid * 2;
              break;
            case 'treble':
              intensity = 1 + treble * 2;
              break;
            case 'beat':
              intensity = beatInfo.isBeat ? 2 : 1;
              break;
            case 'overall':
              intensity = 1 + overall * 2;
              break;
          }
          
          // Apply intensity to element
          if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
            object.material.opacity = (customization.opacity || 1) * intensity;
          }
        }
      }
        // Handle light elements
        if (element.type === "light") {
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

          if (
            element.id === "directional-light" &&
            directionalLightRef.current
          ) {
            directionalLightRef.current.intensity =
              (element.customization as any).intensity * intensity;
            directionalLightRef.current.color.set(
              (element.customization as any).color
            );
          }
        }
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
    [params, visualElements, frequencyData, beatInfo]
  );
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const startAnimation = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      lastAnimationTimeRef.current = 0;
      animationFrameCountRef.current = 0;
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

  const captureSystemAudio = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      console.log("System audio capture successful");
      return stream;
    } catch (error) {
      console.error("Failed to capture system audio:", error);
      return null;
    }
  };

  const handleRecordVideo = async () => {
    if (isRecording && mediaRecorder) {
      console.log("Stopping recording...");
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (wasPlayingRef.current && currentAudio) {
        await resumeAudio();
        wasPlayingRef.current = false;
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }

      if (audioDestinationRef.current) {
        audioDestinationRef.current = null;
      }

      audioTrackRef.current = null;

      return;
    }

    if (!canvasRef.current) {
      toast.error("Recording Error", "Canvas not available for recording");
      return;
    }

    try {
      wasPlayingRef.current = isPlaying;

      const canvasStream = canvasRef.current.captureStream(30);

      let audioStream: MediaStream | null = null;

      if (!audioStream) {
        console.log("Trying system audio capture...");
        audioStream = await captureSystemAudio();
      }

      let combinedStream: MediaStream;
      let hasAudio = false;

      if (audioStream && audioStream.getAudioTracks().length > 0) {
        const videoTrack = canvasStream.getVideoTracks()[0];
        const audioTrack = audioStream.getAudioTracks()[0];
        audioTrackRef.current = audioTrack;

        combinedStream = new MediaStream([videoTrack, audioTrack]);
        audioStreamRef.current = audioStream;
        hasAudio = true;
        console.log("Recording with audio");
      } else {
        combinedStream = canvasStream;
        console.log("Recording without audio - could not capture audio");

        // Show warning toast for no audio
        toast.warning(
          "Recording Started",
          "Recording without audio. Make sure to allow microphone access for full recording.",
          { duration: 5000 }
        );
      }

      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=h264,opus",
        "video/webm",
      ];

      let selectedMimeType = "";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        selectedMimeType = "video/webm";
        console.warn("Using default MIME type");
      }

      const options = {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: hasAudio ? 128000 : 0,
      };

      const recorder = new MediaRecorder(combinedStream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        pauseAudio();

        console.log("Recording stopped, creating blob...");
        const blob = new Blob(chunks, {
          type: selectedMimeType.includes("webm") ? "video/webm" : "video/mp4",
        });

        setVideoBlob(blob);
        setShowDownloadModal(true);
      };

      recorder.onerror = (e) => {
        console.error("Recording error:", e);
        toast.error("Recording Failed", "An error occurred during recording");
        setIsRecording(false);
        setRecordingTime(0);

        if (wasPlayingRef.current && currentAudio) {
          resumeAudio();
          wasPlayingRef.current = false;
        }
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setIsRecording(true);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      console.log(`Recording started ${hasAudio ? "with" : "without"} audio`);

      // Show recording started toast
      toast.info(
        "Recording Started",
        hasAudio
          ? "Recording with audio. Click the record button again to stop."
          : "Recording without audio. Click the record button again to stop.",
        { duration: 3000 }
      );
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Recording Failed",
        error instanceof Error ? error.message : "Failed to start recording"
      );

      if (wasPlayingRef.current && currentAudio) {
        resumeAudio();
        wasPlayingRef.current = false;
      }
    }
  };

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
        // Show success toast with action to register IP
        toast.success(
          "Video Saved Successfully!",
          `"${videoName || fileName}" has been saved to your library.`,
          {
            duration: 7000, // Longer duration for important action
            action: {
              label: "Register as IP Asset",
              onClick: () => {
                // Navigate to IP Assets page
                // navigate('/ip-assets');

                // You could also pass the video ID if you have it
                // navigate(`/ip-assets?video=${result.videoId}`);

                // Optional: Show another toast about registration
                setTimeout(() => {
                  toast.info(
                    "IP Asset Registration",
                    "Register your video as an IP Asset to protect and monetize your content.",
                    { duration: 5000 }
                  );
                }, 1000);
              },
            },
          }
        );

        setShowDownloadModal(false);
        setVideoBlob(null);
        setVideoName(`visualizer-${Date.now()}`);

        if (wasPlayingRef.current && currentAudio) {
          resumeAudio();
          wasPlayingRef.current = false;
        }
      } else {
        toast.error(
          "Upload Failed",
          result.error || "Failed to save video. Please try again.",
          {
            duration: 5000,
            isPersistent: true,
            action: {
              label: "Retry",
              onClick: handleSaveVideo,
            },
          }
        );
      }
    } catch (error) {
      toast.error(
        "Network Error",
        "Failed to connect to server. Please check your connection and try again.",
        {
          duration: 5000,
          isPersistent: true,
          action: {
            label: "Retry",
            onClick: handleSaveVideo,
          },
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-3 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full animate-ping" />
              <span className="font-semibold">REC</span>
              <span className="font-mono text-sm">
                {formatRecordingTime(recordingTime)}
              </span>
              <span className="text-sm opacity-80">
                {audioTrackRef.current
                  ? "Recording with audio"
                  : "Recording video only"}
              </span>
            </div>
          </div>
        )}

        {isConnected && (
          <CanvasControls
            isConnected={isConnected}
            audioName={audioName}
            canPlayAudio={canPlayAudio as boolean}
            isPlaying={isPlaying}
            isLoading={isLoading}
            togglePlayback={togglePlayback}
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            handleSeek={handleSeek}
            params={params}
            setParams={setParams}
            canvasRef={canvasRef}
            onDemoAudio={handleDemoAudio}
            onRecordVideo={handleRecordVideo}
            isRecording={isRecording}
          />
        )}

        {audioError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {audioError}
          </div>
        )}

        {!currentAudio && !hasDefaultAudio && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-8 max-w-md">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">♪</span>
              </div>
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
                onClick={() => {
                  setShowDownloadModal(false);
                  if (wasPlayingRef.current && currentAudio) {
                    resumeAudio();
                    wasPlayingRef.current = false;
                  }
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>

              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">▶</span>
              </div>

              <h3 className="text-xl font-semibold text-white text-center mb-2">
                Recording Complete!
              </h3>

              <p className="text-slate-300 text-center mb-4">
                {audioTrackRef.current
                  ? "Your recording with audio has been saved."
                  : "Your video recording has been saved (no audio was captured)."}
              </p>

              <input
                type="text"
                className="w-full rounded-lg p-3 mb-6 bg-slate-800 border border-slate-600 text-white"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Enter video name"
              />

              <div className="space-y-3">
                <button
                  onClick={handleSaveVideo}
                  disabled={isUploading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isUploading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    "Save to Library"
                  )}
                </button>

                <button
                  onClick={() => {
                    if (videoBlob) {
                      const url = URL.createObjectURL(videoBlob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${
                        videoName || `visualizer-${Date.now()}`
                      }.webm`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                >
                  Download Recording
                </button>

                <button
                  onClick={() => {
                    setShowDownloadModal(false);
                    setVideoBlob(null);
                    if (wasPlayingRef.current && currentAudio) {
                      resumeAudio();
                      wasPlayingRef.current = false;
                    }
                  }}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all duration-200"
                >
                  {wasPlayingRef.current ? "Cancel & Resume Audio" : "Cancel"}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 text-center">
                  Tip: After saving, register your video as an IP Asset to
                  protect and monetize your creation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
