import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Music, Video } from "lucide-react";
import { Button } from "../../ui/Button";
import * as THREE from "three";
import { VisualizerManager } from "../../../studio/visualizers/manager/VisualizerManager";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { ElementCustomizationPanel } from "../../../studio/visualizers/Elements/ElementCustomizationPanel";
import { VisualElementSelector } from "../../../studio/visualizers/Elements/VisualElementSelector";
import { SlidersPanel } from "./components/SlidersPanel";
import { ControlsPanel } from "./components/ControlsPanel";
import { LyricsManager } from "../../../studio/visualizers/manager/LyricsManager";
import { useAudio } from "../../../provider/AudioContext";
import { LyricsRenderer } from "../../../studio/visualizers/manager/LyricsRenderer";
import { decodeLyricsData } from "../../../shared/utils";
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
  const isAnimatingRef = useRef(false);
  const lastAnimationTimeRef = useRef(0);

  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

  const audioSyncCountRef = useRef(0);
  const animationFrameCountRef = useRef(0);

  useEffect(() => {
    if (params.showLyrics !== false) {
      setParams((prev) => ({
        ...prev,
        showLyrics: false,
      }));
    }
  }, []);

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
  // Prevent running before data exists
  if (!frequencyData || !timeData) return;

  const convertedTimeData =
    timeData instanceof Uint8Array
      ? Float32Array.from(timeData, v => (v - 128) / 128)
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

    // Shallow compare array lengths + beat strength
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

    scene.background = new THREE.Color(0x0a0a0a);

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
      sceneRef.current?.clear();
      rendererRef.current?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      setSceneReady(false);

      audioSyncCountRef.current = 0;
      animationFrameCountRef.current = 0;
    };
  }, []);

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

      animationFrameCountRef.current++;

      if (animationFrameCountRef.current > 1000) {
        console.warn("Animation frame count very high, possible infinite loop");
      }

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
