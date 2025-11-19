import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../../shared/types/visualizer.types";
import * as animators from "../animators";
import * as creators from "../creators"


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
      case "dnaHelix":
        return creators.createDNAHelixVisualizer(scene, params);
      case "crystalLattice":
        return creators.createCrystalLatticeVisualizer(scene, params);
      case "plasmaField":
        return creators.createPlasmaFieldVisualizer(scene, params);
      case "fractalTree":
        return creators.createFractalTreeVisualizer(scene, params);
      case "kaleidoscope":
        return creators.createKaleidoscopeVisualizer(scene, params);
      case "neuralNetwork":
        return creators.createNeuralNetworkVisualizer(scene, params);
      case "quantumField":
        return creators.createQuantumFieldVisualizer(scene, params);
      case "solarFlare":
        return creators.createSolarFlareVisualizer(scene, params);
      case "auroraWaves":
        return creators.createAuroraWavesVisualizer(scene, params);
      case "sacredGeometry":
        return creators.createSacredGeometryVisualizer(scene, params);
      case "nebulaCloud":
        return creators.createNebulaCloudVisualizer(scene, params);
      case "mandala":
        return creators.createMandalaVisualizer(scene, params);
      case "spiralArms":
        return creators.createSpiralArmsVisualizer(scene, params);
      case "hexagonalGrid":
        return creators.createHexagonalGridVisualizer(scene, params);
      case "voronoiCells":
        return creators.createVoronoiCellsVisualizer(scene, params);
      case "toroidalField":
        return creators.createToroidalFieldVisualizer(scene, params);
      case "cosmicWeb":
        return creators.createCosmicWebVisualizer(scene, params);
      case "crystalCave":
        return creators.createCrystalCaveVisualizer(scene, params);
      case "fireRings":
        return creators.createFireRingsVisualizer(scene, params);
      case "electromagneticField":
        return creators.createElectromagneticFieldVisualizer(scene, params);
      case "mobiusStrip":
        return creators.createMobiusStripVisualizer(scene, params);
      case "fibonacciSpiral":
        return creators.createFibonacciSpiralVisualizer(scene, params);
      case "tesseract":
        return creators.createTesseractVisualizer(scene, params);
      case "dnaOrigami":
        return creators.createDNAOrigamiVisualizer(scene, params);
      case "supernova":
        return creators.createSupernovaVisualizer(scene, params);
      case "warpTunnel":
        return creators.createWarpTunnelVisualizer(scene, params);
      case "moleculeBonds":
        return creators.createMoleculeBondsVisualizer(scene, params);
      case "lightningStorm":
        return creators.createLightningStormVisualizer(scene, params);
      case "quantumFoam":
        return creators.createQuantumFoamVisualizer(scene, params);
      case "celestialOrbit":
        return creators.createCelestialOrbitVisualizer(scene, params);
      default:
        return creators.createDNAHelixVisualizer(scene, params);
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
      // Original animators (placeholders - implement if needed)
      case "spectrum":
        animators.animateSpectrum(objects, frequencyData, time, params, beatInfo);
        break;
      case "particleWave":
        animators.animateParticleWave(objects, frequencyData, time, params, beatInfo);
        break;
      case "geometric":
        animators.animateGeometric(objects, frequencyData, time, params, beatInfo);
        break;
      case "waveform3D":
        animators.animateWaveform3D(objects, frequencyData, time, params, beatInfo);
        break;
      case "audioReactive":
        animators.animateAudioReactive(objects, frequencyData, time, params, beatInfo);
        break;
      case "morphing":
        animators.animateMorphing(objects, frequencyData, time, params, beatInfo);
        break;
      case "liquid":
        animators.animateLiquid(objects, frequencyData, time, params, beatInfo);
        break;
      case "cyberGrid":
        animators.animateCyberGrid(objects, frequencyData, time, params, beatInfo);
        break;
      case "biomorphic":
        animators.animateBiomorphic(objects, frequencyData, time, params, beatInfo);
        break;
      // New animators
      case "dnaHelix":
        animators.animateDNAHelix(objects, frequencyData, time, params, beatInfo);
        break;
      case "crystalLattice":
        animators.animateCrystalLattice(objects, frequencyData, time, params, beatInfo);
        break;
      case "plasmaField":
        animators.animatePlasmaField(objects, frequencyData, time, params, beatInfo);
        break;
      case "fractalTree":
        animators.animateFractalTree(objects, frequencyData, time, params, beatInfo);
        break;
      case "kaleidoscope":
        animators.animateKaleidoscope(objects, frequencyData, time, params, beatInfo);
        break;
      case "neuralNetwork":
        animators.animateNeuralNetwork(objects, frequencyData, time, params, beatInfo);
        break;
      case "quantumField":
        animators.animateQuantumField(objects, frequencyData, time, params, beatInfo);
        break;
      case "solarFlare":
        animators.animateSolarFlare(objects, frequencyData, time, params, beatInfo);
        break;
      case "auroraWaves":
        animators.animateAuroraWaves(objects, frequencyData, time, params, beatInfo);
        break;
      case "sacredGeometry":
        animators.animateSacredGeometry(objects, frequencyData, time, params, beatInfo);
        break;
      case "nebulaCloud":
        animators.animateNebulaCloud(objects, frequencyData, time, params, beatInfo);
        break;
      case "mandala":
        animators.animateMandala(objects, frequencyData, time, params, beatInfo);
        break;
      case "spiralArms":
        animators.animateSpiralArms(objects, frequencyData, time, params, beatInfo);
        break;
      case "hexagonalGrid":
        animators.animateHexagonalGrid(objects, frequencyData, time, params, beatInfo);
        break;
      case "voronoiCells":
        animators.animateVoronoiCells(objects, frequencyData, time, params, beatInfo);
        break;
      case "toroidalField":
        animators.animateToroidalField(objects, frequencyData, time, params, beatInfo);
        break;
      case "cosmicWeb":
        animators.animateCosmicWeb(objects, frequencyData, time, params, beatInfo);
        break;
      case "crystalCave":
        animators.animateCrystalCave(objects, frequencyData, time, params, beatInfo);
        break;
      case "fireRings":
        animators.animateFireRings(objects, frequencyData, time, params, beatInfo);
        break;
      case "electromagneticField":
        animators.animateElectromagneticField(objects, frequencyData, time, params, beatInfo);
        break;
      case "mobiusStrip":
        animators.animateMobiusStrip(objects, frequencyData, time, params, beatInfo);
        break;
      case "fibonacciSpiral":
        animators.animateFibonacciSpiral(objects, frequencyData, time, params, beatInfo);
        break;
      case "tesseract":
        animators.animateTesseract(objects, frequencyData, time, params, beatInfo);
        break;
      case "dnaOrigami":
        animators.animateDNAOrigami(objects, frequencyData, time, params, beatInfo);
        break;
      case "supernova":
        animators.animateSupernova(objects, frequencyData, time, params, beatInfo);
        break;
      case "warpTunnel":
        animators.animateWarpTunnel(objects, frequencyData, time, params, beatInfo);
        break;
      case "moleculeBonds":
        animators.animateMoleculeBonds(objects, frequencyData, time, params, beatInfo);
        break;
      case "lightningStorm":
        animators.animateLightningStorm(objects, frequencyData, time, params, beatInfo);
        break;
      case "quantumFoam":
        animators.animateQuantumFoam(objects, frequencyData, time, params, beatInfo);
        break;
      case "celestialOrbit":
        animators.animateCelestialOrbit(objects, frequencyData, time, params, beatInfo);
        break;
      default:
        animators.animateDNAHelix(objects, frequencyData, time, params, beatInfo);
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
      "dnaHelix",
      "crystalLattice",
      "plasmaField",
      "fractalTree",
      "kaleidoscope",
      "neuralNetwork",
      "quantumField",
      "solarFlare",
      "auroraWaves",
      "sacredGeometry",
      "nebulaCloud",
      "mandala",
      "spiralArms",
      "hexagonalGrid",
      "voronoiCells",
      "toroidalField",
      "cosmicWeb",
      "crystalCave",
      "fireRings",
      "electromagneticField",
      "mobiusStrip",
      "fibonacciSpiral",
      "tesseract",
      "dnaOrigami",
      "supernova",
      "warpTunnel",
      "moleculeBonds",
      "lightningStorm",
      "quantumFoam",
      "celestialOrbit",
    ];
  }
}
