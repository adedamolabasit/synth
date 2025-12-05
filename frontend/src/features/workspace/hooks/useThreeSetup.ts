import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { VisualizerManager } from "../../../studio/visualizers/manager/VisualizerManager";
import { useAudio } from "../../../provider/AudioContext";
import { useVisualizer } from "../../../provider/VisualizerContext";

export const useThreeSetup = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [beatDetected, setBeatDetected] = useState(false);

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const visualizerManagerRef = useRef<VisualizerManager>(new VisualizerManager());
  const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
  const ambientObjectsRef = useRef<THREE.Object3D[]>([]);
  const animationIdRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);

  // Light references
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);
  const backgroundRef = useRef<THREE.Color | THREE.Texture | null>(null);

  // Get audio data and visualizer params
  const { frequencyData, beatInfo, audioLevel } = useAudio();
  const { params, visualElements, setAudioData } = useVisualizer();

  // Convert time data like in original code
  useEffect(() => {
    const convertedTimeData = frequencyData instanceof Uint8Array
      ? new Float32Array(frequencyData.length).map(
          (_, i) => (frequencyData[i] - 128) / 128
        )
      : frequencyData;

    setAudioData({
      frequencyData,
      timeData: convertedTimeData,
      beatInfo,
      audioLevel,
    });
  }, [frequencyData, beatInfo, audioLevel, setAudioData]);

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
    (time: number, beatInfo: any) => {
      const bass = beatInfo?.bandStrengths?.bass || 0;
      const mid = beatInfo?.bandStrengths?.mid || 0;
      const treble = beatInfo?.bandStrengths?.treble || 0;
      const overall = beatInfo?.strength || 0;

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
              audioIntensity = beatInfo?.isBeat ? 2 * (data.intensity || 1) : 1;
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

      const bass = beatInfo?.bandStrengths?.bass || 0;
      const mid = beatInfo?.bandStrengths?.mid || 0;
      const treble = beatInfo?.bandStrengths?.treble || 0;
      const overall = beatInfo?.strength || 0;

      // Animate lights based on audio
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
            intensity = beatInfo?.isBeat ? 2 : 1;
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

      if (params.beatDetection && beatInfo?.isBeat) {
        setBeatDetected(true);
        setTimeout(() => setBeatDetected(false), 100);
      }

      // Animate visualizer with real audio data
      visualizerManagerRef.current.animateVisualizer(
        visualizerObjectsRef.current,
        frequencyData || new Uint8Array(128),
        currentTime,
        params,
        beatInfo || {
          isBeat: false,
          strength: 0,
          bandStrengths: { bass: 0, mid: 0, treble: 0 }
        }
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

  const setupScene = useCallback(() => {
    if (!canvasRef.current) return;

    // Clean up existing scene
    if (sceneRef.current) {
      sceneRef.current.clear();
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    // Create new scene
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

    updateBackground(scene);
    createLightsFromElements(scene);
    createAmbientElements(scene);
    createVisualizer();

    setSceneReady(true);
    console.log('Three.js scene setup complete with audio integration');
  }, [updateBackground, createLightsFromElements, createAmbientElements, createVisualizer]);

  // Start/stop animation
  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current || !sceneReady) return;
    isAnimatingRef.current = true;
    animationIdRef.current = requestAnimationFrame(animateScene);
    console.log('Animation started with audio data');
  }, [animateScene, sceneReady]);

  const stopAnimation = useCallback(() => {
    isAnimatingRef.current = false;
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = 0;
    }
    console.log('Animation stopped');
  }, []);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
    
    cameraRef.current.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
  }, []);

  // Setup scene on mount
  useEffect(() => {
    setupScene();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      stopAnimation();
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [setupScene, handleResize, stopAnimation]);

  // Update scene when visual elements change
  useEffect(() => {
    if (sceneRef.current) {
      updateBackground(sceneRef.current);
      createLightsFromElements(sceneRef.current);
      createAmbientElements(sceneRef.current);
    }
  }, [visualElements, updateBackground, createLightsFromElements, createAmbientElements]);

  // Update visualizer when params change
  useEffect(() => {
    if (sceneReady) {
      createVisualizer();
    }
  }, [params.visualizerType, params.complexity, sceneReady, createVisualizer]);

  return {
    canvasRef,
    sceneReady,
    beatDetected,
    setBeatDetected,
    startAnimation,
    stopAnimation,
  };
};