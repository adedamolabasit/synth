import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";
import * as creators from "../creators";
import * as animators from "../animators";

export class VisualizerManager {
  createVisualizer(
    scene: THREE.Scene,
    params: VisualizerParams
  ): THREE.Object3D[] {
    switch (params.visualizerType) {
      case "spectrum":
        return creators.createSpectrumVisualizer(scene, params);
      case "particleWave":
        return creators.createParticleWaveVisualizer(scene, params);
        case "geometric":
          return creators.createGeometricVisualizer(scene, params);
        case "waveform3D":
          return creators.createWaveform3DVisualizer(scene, params);
        case "audioReactive":
          return creators.createAudioReactiveVisualizer(scene, params);
        case "morphing":
          return creators.createMorphingVisualizer(scene, params);
        case "liquid":
          return creators.createLiquidVisualizer(scene, params);
        case "cyberGrid":
          return creators.createCyberGridVisualizer(scene, params);
        case "biomorphic":
          return creators.createBiomorphicVisualizer(scene, params);
        default:
          return creators.createGeometricVisualizer(scene, params);
    }
  }

  animateVisualizer(
    objects: THREE.Object3D[],
    frequencyData: Uint8Array,
    time: number,
    params: VisualizerParams,
    beatInfo: BeatInfo
  ) {
    switch (params.visualizerType) {
      case "spectrum":
        animators.animateSpectrum(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "particleWave":
        animators.animateParticleWave(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "geometric":
        animators.animateGeometric(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "waveform3D":
        animators.animateWaveform3D(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "audioReactive":
        animators.animateAudioReactive(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "morphing":
        animators.animateMorphing(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "liquid":
        animators.animateLiquid(objects, frequencyData, time, params, beatInfo);
        break;
      case "cyberGrid":
        animators.animateCyberGrid(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "biomorphic":
        animators.animateBiomorphic(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      default:
        animators.animateGeometric(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
    }
  }

  // Helper method to get all available visualizer types
  getAvailableVisualizers(): string[] {
    return [
      "spectrum",
      "particleWave",
      "geometric",
      "waveform3D",
      "audioReactive",
      "morphing",
      "liquid",
      "cyberGrid",
      "biomorphic",
    ];
  }
}
