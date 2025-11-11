// contexts/VisualizerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  VisualizerParams, 
  BeatInfo, 
  VisualElement, 
  Customization,
  AudioData 
} from "../../studio/types/visualizer";

interface Visualizer {
  id: string;
  name: string;
  type: "bars" | "particles" | "waveform" | "3d" | "morphing" | "liquid" | "cyber" | "geometric";
  thumbnail: string;
  rating: number;
  favorite: boolean;
  visualizerType: string;
}

interface VisualizerContextType {
  params: VisualizerParams;
  setParams: (params: VisualizerParams | ((prev: VisualizerParams) => VisualizerParams)) => void;
  visualElements: VisualElement[];
  setVisualElements: (elements: VisualElement[] | ((prev: VisualElement[]) => VisualElement[])) => void;
  updateElement: (id: string, updates: Partial<VisualElement>) => void;
  updateElementCustomization: (id: string, updates: Partial<Customization>) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  audioData: AudioData;
  setAudioData: (data: AudioData) => void;

  // New state for visualizer library
  showVisualizerLibrary: boolean;
  setShowVisualizerLibrary: (show: boolean) => void;
  visualizers: Visualizer[];
  currentVisualizer: string;
  setCurrentVisualizer: (visualizerType: string) => void;
}

const VisualizerContext = createContext<VisualizerContextType | undefined>(undefined);

// Default configurations for each element type
export const defaultCustomizations = {
  ambient: {
    elementType: "bouncing-ball" as const,
    color: "#ffffff", // Use hex instead of HSL
    size: 1,
    speed: 1,
    amplitude: 2,
    frequency: 1,
    bounceHeight: 3,
    movementType: "bounce" as const,
    responsive: true,
    responseTo: "overall" as const,
    intensity: 1,
    opacity: 0.8,
  },
  background: {
    color: "#0a0a0a",
    gradient: true,
    gradientStart: "#0a0a0a",
    gradientEnd: "#1a1a2e",
    opacity: 1,
  },
  particle: {
    color: "#00ff88",
    size: 0.1,
    opacity: 0.8,
    speed: 1.0,
    intensity: 1,
    count: 3000,
    responseTo: "bass" as const,
  },
  light: {
    color: "#ffffff",
    opacity: 1,
    intensity: 1.0,
    position: [5, 5, 5] as [number, number, number],
    responseTo: "beat" as const,
  },
  grid: {
    color: "#00ff88",
    opacity: 0.6,
    intensity: 1,
    size: 20,
    divisions: 30,
    responseTo: "mid" as const,
  },
  shape: {
    color: "#ff0088",
    opacity: 0.8,
    intensity: 1,
    geometry: "cube" as const,
    size: 1,
    rotationSpeed: 1,
    responseTo: "treble" as const,
  },
  wave: {
    color: "#0088ff",
    opacity: 0.7,
    intensity: 1,
    amplitude: 2,
    frequency: 1,
    speed: 1,
    points: 50,
    responseTo: "overall" as const,
  },
};

// Default visual elements with proper typing
const defaultVisualElements: VisualElement[] = [
  {
    id: "background",
    type: "background",
    name: "Background",
    visible: true,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    customization: defaultCustomizations.background,
  },
  {
    id: "main-particles",
    type: "particle",
    name: "Main Particles",
    visible: true,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    customization: defaultCustomizations.particle,
  },
  {
    id: "grid-lines",
    type: "grid",
    name: "Grid Lines",
    visible: true,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    customization: defaultCustomizations.grid,
  },
  {
    id: "ambient-light",
    type: "light",
    name: "Ambient Light",
    visible: true,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    customization: defaultCustomizations.light,
  },
  {
    id: "directional-light",
    type: "light",
    name: "Directional Light",
    visible: true,
    position: [5, 5, 5],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    customization: {
      ...defaultCustomizations.light,
      position: [5, 5, 5],
    },
  },
];

// Default visualizers data
const defaultVisualizers: Visualizer[] = [
  {
    id: "1",
    name: "Frequency Bars",
    type: "bars",
    thumbnail: "🎵",
    rating: 4.8,
    favorite: true,
    visualizerType: "audioReactive",
  },
  {
    id: "2",
    name: "Particle Flow",
    type: "particles",
    thumbnail: "✨",
    rating: 4.9,
    favorite: false,
    visualizerType: "particleWave",
  },
  {
    id: "3",
    name: "Wave Ripple",
    type: "waveform",
    thumbnail: "🌊",
    rating: 4.7,
    favorite: true,
    visualizerType: "waveform3D",
  },
  {
    id: "4",
    name: "Spiral Galaxy",
    type: "3d",
    thumbnail: "🌌",
    rating: 4.6,
    favorite: false,
    visualizerType: "morphing",
  },
  {
    id: "5",
    name: "Neon Grid",
    type: "cyber",
    thumbnail: "⚡",
    rating: 4.5,
    favorite: false,
    visualizerType: "cyberGrid",
  },
  {
    id: "6",
    name: "Audio Sphere",
    type: "3d",
    thumbnail: "🔮",
    rating: 4.8,
    favorite: true,
    visualizerType: "biomorphic",
  },
  {
    id: "7",
    name: "Liquid Motion",
    type: "liquid",
    thumbnail: "💧",
    rating: 4.7,
    favorite: false,
    visualizerType: "liquid",
  },
  {
    id: "8",
    name: "Geometric Patterns",
    type: "geometric",
    thumbnail: "🔷",
    rating: 4.6,
    favorite: true,
    visualizerType: "geometric",
  },
  {
    id: "9",
    name: "Spectrum Analyzer",
    type: "bars",
    thumbnail: "📊",
    rating: 4.9,
    favorite: false,
    visualizerType: "spectrum",
  },
];

// Default audio data
const defaultAudioData: AudioData = {
  frequencyData: new Uint8Array(1024),
  timeData: new Float32Array(2048),
  beatInfo: { 
    isBeat: false, 
    strength: 0, 
    bandStrengths: { bass: 0, mid: 0, treble: 0 } 
  },
  audioLevel: 0,
};

export const VisualizerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [params, setParams] = useState<VisualizerParams>({
    visualizerType: "audioReactive",
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
    beatDetection: true,
    patternDensity: 5,
    objectSize: 1.0,
    morphSpeed: 50,
    fluidity: 50,
    glowIntensity: 50,
    reactionSpeed: 50,
  });

  const [visualElements, setVisualElements] = useState<VisualElement[]>(defaultVisualElements);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<AudioData>(defaultAudioData);
  const [showVisualizerLibrary, setShowVisualizerLibrary] = useState(false);
  const [currentVisualizer, setCurrentVisualizer] = useState("audioReactive");

  const updateElement = (id: string, updates: Partial<VisualElement>) => {
    setVisualElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const updateElementCustomization = (id: string, updates: Partial<Customization>) => {
    setVisualElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              customization: { ...el.customization, ...updates },
            }
          : el
      )
    );
  };

  // Handle visualizer selection - updates both params and currentVisualizer
  const handleSetParams = (
    newParams: VisualizerParams | ((prev: VisualizerParams) => VisualizerParams)
  ) => {
    setParams((prev) => {
      const updatedParams = typeof newParams === "function" ? newParams(prev) : newParams;
      // Sync currentVisualizer with visualizerType
      if (updatedParams.visualizerType !== prev.visualizerType) {
        setCurrentVisualizer(updatedParams.visualizerType);
      }
      return updatedParams;
    });
  };

  const handleSetCurrentVisualizer = (visualizerType: string) => {
    setCurrentVisualizer(visualizerType);
    setParams((prev) => ({
      ...prev,
      visualizerType: visualizerType as VisualizerParams["visualizerType"],
    }));
  };

  const value: VisualizerContextType = {
    params,
    setParams: handleSetParams,
    visualElements,
    setVisualElements,
    updateElement,
    updateElementCustomization,
    selectedElement,
    setSelectedElement,
    audioData,
    setAudioData,
    showVisualizerLibrary,
    setShowVisualizerLibrary,
    visualizers: defaultVisualizers,
    currentVisualizer,
    setCurrentVisualizer: handleSetCurrentVisualizer,
  };

  return (
    <VisualizerContext.Provider value={value}>
      {children}
    </VisualizerContext.Provider>
  );
};

export const useVisualizer = () => {
  const context = useContext(VisualizerContext);
  if (context === undefined) {
    throw new Error("useVisualizer must be used within a VisualizerProvider");
  }
  return context;
};