import * as THREE from "three";
import {
  VisualizerParams,
  BeatInfo,
} from "../../../shared/types/visualizer.types";
import * as animators from "../animators";
import * as creators from "../creators";

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
        return creators.createWaveform3DVisualizer(scene);
      case "audioReactive":
        return creators.createAudioReactiveVisualizer(scene);
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
        return creators.createNeuralNetworkVisualizer(scene);
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
        return creators.createTesseractVisualizer(scene);
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
      case "crystalMatrix":
        return creators.createCrystalMatrixVisualizer(scene);
      case "liquidMercury":
        return creators.createLiquidMercuryVisualizer(scene);
      case "cyberGrid2":
        return creators.createCyberGrid2Visualizer(scene);
      case "plasmaStorm":
        return creators.createPlasmaStormVisualizer(scene);
      case "holographicGrid":
        return creators.createHolographicGridVisualizer(scene);
      case "morphingCrystals":
        return creators.createMorphingCrystalsVisualizer(scene);
      case "orbitalRings":
        return creators.createOrbitalRingsVisualizer(scene);
      case "fractalExpansion":
        return creators.createFractalExpansionVisualizer(scene);
      case "celestialSymphony":
        return creators.createCelestialSymphonyVisualizer(scene);
      case "neuralFireworks":
        return creators.createNeuralFireworksVisualizer(scene);
      case "quantumFlux":
        return creators.createQuantumFluxVisualizer(scene);
      case "crystalResonance":
        return creators.createCrystalResonanceVisualizer(scene);
      case "timeVortex":
        return creators.createTimeVortexVisualizer(scene);
      case "dimensionalGateway":
        return creators.createDimensionalGatewayVisualizer(scene);
      case "neuralCosmos":
        return creators.createNeuralCosmosVisualizer(scene);
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
      case "spectrum":
        animators.animateSpectrum(objects, frequencyData, time, params);
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
        animators.animateGeometric(objects, frequencyData, time);
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
        animators.animateMorphing(objects, frequencyData, time, beatInfo);
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
      case "dnaHelix":
        animators.animateDNAHelix(objects, frequencyData, time);
        break;
      case "crystalLattice":
        animators.animateCrystalLattice(objects, frequencyData, time);
        break;
      case "plasmaField":
        animators.animatePlasmaField(objects, frequencyData, time);
        break;
      case "fractalTree":
        animators.animateFractalTree(objects, frequencyData, time);
        break;
      case "kaleidoscope":
        animators.animateKaleidoscope(objects, frequencyData, time);
        break;
      case "neuralNetwork":
        animators.animateNeuralNetwork(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "quantumField":
        animators.animateQuantumField(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "solarFlare":
        animators.animateSolarFlare(objects, frequencyData, time);
        break;
      case "auroraWaves":
        animators.animateAuroraWaves(objects, frequencyData, time);
        break;
      case "sacredGeometry":
        animators.animateSacredGeometry(objects, frequencyData, time);
        break;
      case "nebulaCloud":
        animators.animateNebulaCloud(objects, frequencyData, time);
        break;
      case "mandala":
        animators.animateMandala(objects, frequencyData, time);
        break;
      case "spiralArms":
        animators.animateSpiralArms(objects, frequencyData, time);
        break;
      case "hexagonalGrid":
        animators.animateHexagonalGrid(objects, frequencyData, time);
        break;
      case "voronoiCells":
        animators.animateVoronoiCells(objects, frequencyData, time);
        break;
      case "toroidalField":
        animators.animateToroidalField(objects, frequencyData, time);
        break;
      case "cosmicWeb":
        animators.animateCosmicWeb(objects, frequencyData, time);
        break;
      case "crystalCave":
        animators.animateCrystalCave(objects, frequencyData);
        break;
      case "fireRings":
        animators.animateFireRings(objects, frequencyData);
        break;
      case "electromagneticField":
        animators.animateElectromagneticField(objects, frequencyData);
        break;
      case "mobiusStrip":
        animators.animateMobiusStrip(objects, frequencyData, time);
        break;
      case "fibonacciSpiral":
        animators.animateFibonacciSpiral(objects, frequencyData, time);
        break;
      case "tesseract":
        animators.animateTesseract(objects, frequencyData, time);
        break;
      case "dnaOrigami":
        animators.animateDNAOrigami(objects, frequencyData, time);
        break;
      case "supernova":
        animators.animateSupernova(objects, frequencyData);
        break;
      case "warpTunnel":
        animators.animateWarpTunnel(objects, frequencyData, time);
        break;
      case "moleculeBonds":
        animators.animateMoleculeBonds(objects, frequencyData, time);
        break;
      case "lightningStorm":
        animators.animateLightningStorm(objects, frequencyData);
        break;
      case "quantumFoam":
        animators.animateQuantumFoam(objects, frequencyData, time);
        break;
      case "celestialOrbit":
        animators.animateCelestialOrbit(objects, frequencyData, time);
        break;
      case "crystalMatrix":
        animators.animateCrystalMatrix(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "liquidMercury":
        animators.animateLiquidMercury(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "cyberGrid2":
        animators.animateCyberGrid2(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "plasmaStorm":
        animators.animatePlasmaStorm(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "holographicGrid":
        animators.animateHolographicGrid(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "morphingCrystals":
        animators.animateMorphingCrystals(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "orbitalRings":
        animators.animateOrbitalRings(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "fractalExpansion":
        animators.animateFractalExpansion(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "celestialSymphony":
        animators.animateCelestialSymphony(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "neuralFireworks":
        animators.animateNeuralFireworks(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "quantumFlux":
        animators.animateQuantumFlux(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "crystalResonance":
        animators.animateCrystalResonance(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "timeVortex":
        animators.animateTimeVortex(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "dimensionalGateway":
        animators.animateDimensionalGateway(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "neuralCosmos":
        animators.animateNeuralCosmos(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      default:
        animators.animateDNAHelix(objects, frequencyData, time);
    }
  }

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
      "crystalMatrix",
      "liquidMercury",
      "cyberGrid2",
      "plasmaStorm",
      "holographicGrid",
      "morphingCrystals",
      "orbitalRings",
      "fractalExpansion",
      "celestialSymphony",
      "neuralFireworks",
      "quantumFlux",
      "crystalResonance",
      "timeVortex",
      "dimensionalGateway",
      "neuralCosmos",
    ];
  }
}
