# Synth Documentation
                                                                                                                                                     
* `audio-visualizer.md` — Detailed technical documentation of the Three.js visualizer, audio analysis pipeline, animation system, and recording flow.

```md
# Audio Visualizer — Technical Reference

This document explains how the Synth audio visualizer works and points to the exact files in the codebase that implement each part.

## Goals

- Render immersive, real-time 3D visuals that react to audio.
- Provide a creator UI so users can customize visual elements and animation parameters.
- Produce a recorded video output of a visualizer session for registration/licensing.

## Key files (frontend)

- `src/provider/AudioContext.tsx` — audio provider and global audio state.
- `src/features/workspace/components/AudioVisualization.tsx` — the workspace visualizer entry component.
- `src/features/workspace/components/CanvasRenderer.tsx` — handles Three.js renderer and attach-to-DOM.
- `src/features/workspace/hooks/useThreeSetup.ts` — Three.js scene, camera, renderer setup.
- `src/features/workspace/hooks/useAudioSync.ts` — audio analyser + sync with animator pipeline.
- `src/studio/manager/AudioManager.ts` — higher-level audio manager (play/pause, FFT retrieval).
- `src/studio/visualizers/creators/*` — creator modules that define scene construction for templates.
- `src/studio/visualizers/animators/*` — animator modules that transform audio data into motion.
- `src/studio/utils/sceneRecorder.ts` — scene capture and MediaRecorder-based recording utility.
- `src/features/workspace/components/ControlsPanel.tsx` & `SlidersPanel.tsx` — UI controls for customization.

> Note: many template-specific creator & animator files live under `src/studio/visualizers/` (see `index.ts`).

## Architecture summary

The visualizer pipeline follows this flow:

```

Audio Source (file / player) → AudioManager / Web Audio API → AnalyserNode → AudioData
↓
useAudioSync / Animator Pipeline → Creator → Three.js Scene Objects
↓
Renderer (CanvasRenderer / Three.js) → Frame updates → Display
↓
Optional: sceneRecorder → MediaRecorder → Video Blob → Upload

````

### 1) Audio capture & analysis

- The Web Audio API is used via `AudioContext`, `MediaElementAudioSourceNode`, and `AnalyserNode`.
- `useAudioSync.ts` and `AudioManager.ts` are responsible for creating and exposing:
  - an `AnalyserNode` configured with `fftSize` (see `shared/config/audio.config.ts` for defaults),
  - methods `getByteFrequencyData()` or `getFloatFrequencyData()` that return frequency-domain arrays,
  - waveform data via `getByteTimeDomainData()` for time-domain effects.

Typical code pattern (simplified):

```ts
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048; // configurable
source.connect(analyser);
analyser.connect(audioCtx.destination);

// inside render/raf loop:
const freqArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(freqArray);
````

Frequency arrays are normalized and smoothed before being passed to animators (look for smoothing logic in `useAudioSync.ts` or `AudioManager.ts`).

### 2) Three.js scene & renderer

* `useThreeSetup.ts` initializes the `THREE.Scene`, `PerspectiveCamera`, and `WebGLRenderer` as well as postprocessing (see `src/studio/effects/postprocessing.ts`).
* `CanvasRenderer.tsx` mounts the canvas and ensures the renderer resizes with the viewport.
* Each visualizer template (in `creators/`) exports a factory function that creates meshes, materials, lights, and groups, then returns a scene object with an `update` hook for animators.

Example creator function signature (pattern used across creators):

```ts
export function createTemplate(scene: THREE.Scene, config: CreatorConfig) {
  const group = new THREE.Group();
  // create geometries & materials
  scene.add(group);

  return {
    group,
    dispose() { /* cleanup geometries / materials */ },
  };
}
```

### 3) Creator system (customization)

* Creator modules in `studio/visualizers/creators` implement how the scene objects are constructed from user-configurable parameters.
* The UI panels (`ElementCustomizationPanel.tsx`, `VisualizerLibrary.tsx`) write values to `VisualizerContext` (see `src/provider/VisualizerContext.tsx`) which holds the active `creatorState`.
* When the creator state changes, the workspace calls `applyCreatorSettings` (pattern) on the active template to update materials, colors, camera parameters, and effect strengths live.

### 4) Animator system (audio → motion)

* Animators live in `studio/visualizers/animators`. Each animator exports a function like:

```ts
export default function animate(params: AnimatorParams) {
  return function update(t: number, audioData: AudioFrameData) {
    // mutate mesh positions, rotations, material uniforms
  };
}
```

* The main render loop calls all active animator `update` functions every frame and passes the latest `audioData` (frequency bins, waveform, averaged levels, and beat events).
* Animators implement different mapping strategies:

  * frequency-bin -> scale (bars, rings)
  * low/mid/high band extraction -> color or emission
  * beat detection -> transient events (camera kick, flashes)

Look at files such as `audioReactive.ts`, `waveform3D.ts`, `orbitalRings.ts` for concrete mapping examples.

### 5) Render loop

Render loop is handled by `CanvasRenderer.tsx` or `useCanvasAnimation.ts` and follows:

1. call `analyser.getByteFrequencyData(freqArr)`
2. package `audioData` (bands, waveform, rms, isBeat)
3. call each animator `update` with `audioData`
4. call `renderer.render(scene, camera)`

This keeps visuals tightly coupled to audio data with minimal latency (only the analyser frame delay).

### 6) Recording the scene

* `src/studio/utils/sceneRecorder.ts` uses `HTMLCanvasElement.captureStream()` to obtain a `MediaStream` from the WebGL canvas.
* The `MediaRecorder` API records the canvas stream into webm chunks which are combined into a single Blob.
* After recording finishes, the code creates a `File`/`Blob` and uploads it via the frontend mutation `src/api/mutations/uploadVideo.ts`.

Typical recording flow (pattern):

```ts
const stream = canvas.captureStream(60); // 60fps suggested
const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
const chunks: Blob[] = [];
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => upload(new Blob(chunks));
recorder.start();
// stop after duration or user action
```

The recorder may also capture audio by mixing the audio output into the captured stream (some implementations route the audio to an `AudioContext` and attach to canvas `MediaStream` or mix server-side during composition).

### 7) Upload & Backend

* Uploads are handled by `src/shared/api/mutations/uploadVideo.ts` which sends the recorded blob to the backend (`backend/src/controllers/videoController.ts`).
* Backend stores the file (and pins to IPFS via `utils/pinata.ts`) and returns metadata (CID, url) that is later used for Story registration.

### 8) Tips for extending & debugging

* To add a new visualizer template: create `creators/myTemplate.ts` and `animators/myTemplate.ts`, export from `studio/visualizers/index.ts`, then add a UI entry in `VisualizerLibrary.tsx`.
* Ensure any GPU-heavy geometry disposes properly (`geometry.dispose()`, `material.dispose()`) to avoid memory leaks.
* Visual artifacts often come from mismatched toneMapping or post-processing parameters — check `postprocessing.ts`.

