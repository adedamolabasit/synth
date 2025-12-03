export interface VisualizerContextType {
  params: VisualizerParams;
  setParams: (
    params: VisualizerParams | ((prev: VisualizerParams) => VisualizerParams)
  ) => void;
  visualElements: VisualElement[];
  setVisualElements: (
    elements: VisualElement[] | ((prev: VisualElement[]) => VisualElement[])
  ) => void;
  updateElement: (id: string, updates: Partial<VisualElement>) => void;
  // updateElementCustomization: (
  //   id: string,
  //   updates: Partial<Customization>
  // ) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  audioData: AudioData;
  setAudioData: (data: any) => void;
  showDownloadModal: boolean;

  showVisualizerLibrary: boolean;
  setShowDownloadModal: (show: boolean) => void;
  setShowVisualizerLibrary: (show: boolean) => void;
  visualizers: Visualizer[];
  currentVisualizer: string;
  setCurrentVisualizer: (visualizerType: string) => void;
  setVideoBlob: (visualizerType: Blob | null) => void;
  videoBlob: Blob | null;
   sceneBackground: any;
  setSceneBackground: (background: any) => void;
  updateElementCustomization: (elementId: string, updates: any) => void;
}

export interface VisualizerParams {
  visualizerType:
    | "spectrum"
    | "particleWave"
    | "orbital"
    | "tunnel"
    | "nebula"
    | "crystal"
    | "geometric"
    | "waveform3D"
    | "fractal"
    | "audioReactive"
    | "morphing"
    | "liquid"
    | "quantum"
    | "hologram"
    | "neural"
    | "cyberGrid"
    | "biomorphic"
    | string;
  colorScheme:
    | "cyberpunk"
    | "ocean"
    | "sunset"
    | "forest"
    | "neon"
    | "monochrome"
    | "rainbow"
    | "plasma"
    | "aurora"
    | "fire"
    | "ice";
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
  patternDensity: number;
  objectSize: number;
  morphSpeed: number;
  fluidity: number;
  glowIntensity: number;
  reactionSpeed: number;
  showLyrics?: boolean;
}

export interface Visualizer {
  id: string;
  name: string;
  type:
    | "bars"
    | "particles"
    | "waveform"
    | "3d"
    | "morphing"
    | "cyber"
    | "liquid"
    | "geometric"
    | "wave"
    | "biological"
    | "fractal"
    | "network"
    | "quantum"
    | "cosmic"
    | "field"
    | "4d"
    | "warp"
    | "molecular"
    | "energy";
  thumbnail: string;
  visualizerType: string;
}

export interface BeatInfo {
  isBeat: boolean;
  strength: number;
  bandStrengths: Record<string, number>;
}

export interface BaseCustomization {
  color: string;
  opacity: number;
  intensity: number;
  responseTo?: "bass" | "mid" | "treble" | "beat" | "overall";
  responsive?: boolean;
}

export interface ParticleCustomization extends BaseCustomization {
  size: number;
  speed: number;
  count: number;
  spawnRate?: number;
  lifetime?: number;
}

export interface LightCustomization extends BaseCustomization {
  position?: [number, number, number];
  distance?: number;
  decay?: number;
}

export interface GridCustomization extends BaseCustomization {
  size: number;
  divisions: number;
  lineWidth?: number;
}

export interface BackgroundCustomization {
  color: string;
  gradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  opacity?: number;
  backgroundType?: "color" | "gradient" | "image" | string;
  image?: string | null;
  imageFile?: string | null;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

export interface ShapeCustomization extends BaseCustomization {
  geometry: "cube" | "sphere" | "cone" | "torus";
  size: number;
  rotationSpeed: number;
  wireframe?: boolean;
}

export interface WaveCustomization extends BaseCustomization {
  amplitude: number;
  frequency: number;
  speed: number;
  points: number;
}

export interface AmbientElementCustomization extends BaseCustomization {
  elementType:
    | "bouncing-ball"
    | "floating-particle"
    | "flying-bird"
    | "floating-text"
    | "rotating-cube"
    | "pulsing-sphere"
    | string;
  movementType: "bounce" | "float" | "fly" | "rotate" | "pulse";
  size: number;
  speed: number;
  amplitude: number;
  frequency: number;
  bounceHeight: number;
}

export type Customization =
  | ParticleCustomization
  | LightCustomization
  | GridCustomization
  | BackgroundCustomization
  | ShapeCustomization
  | WaveCustomization
  | AmbientElementCustomization;

export interface VisualElement {
  id: string;
  type:
    | "particle"
    | "shape"
    | "light"
    | "grid"
    | "wave"
    | "background"
    | "ambient";
  name: string;
  visible: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  customization: Customization;
}

export interface AudioData {
  frequencyData: Uint8Array;
  timeData: Float32Array;
  beatInfo: BeatInfo;
  audioLevel: number;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface SegmentTimestamp {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WordTimestamp[];
}

export interface LyricsData {
  text: string;
  timestamps?: WordTimestamp[];
  segments?: SegmentTimestamp[];
}

export interface LyricsState {
  currentLineIndex: number;
  currentWordIndex: number;
  currentLine: string;
  currentWord: string;
  progress: number;
  isActive: boolean;
}

export interface LyricsDisplayConfig {
  fontSize: number;
  color: string;
  highlightColor: string;
  backgroundColor: string;
  textAlign: "left" | "center" | "right";
  position: { x: number; y: number };
  animation: "fade" | "slide" | "bounce" | "typewriter";
  showWordHighlight: boolean;
  showLineHighlight: boolean;
}

export interface CustomizationField {
  key: string;
  label: string;
  type: "color" | "slider" | "select" | "checkbox" | "image" | "position";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export interface PositionAxis {
  axis: "x" | "y" | "z";
  label: string;
  min: number;
  max: number;
  step: number;
}
