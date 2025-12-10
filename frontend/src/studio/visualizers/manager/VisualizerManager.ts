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
      case "geometric":
        return creators.createGeometricVisualizer(scene, params);
      case "waveform3D":
        return creators.createWaveform3DVisualizer(scene);
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
      case "quantumField":
        return creators.createQuantumFieldVisualizer(scene, params);
      case "solarFlare":
        return creators.createSolarFlareVisualizer(scene, params);
      case "auroraWaves":
        return creators.createAuroraWavesVisualizer(scene, params);
      case "voronoiCells":
        return creators.createVoronoiCellsVisualizer(scene, params);
      case "crystalCave":
        return creators.createCrystalCaveVisualizer(scene, params);
      case "supernova":
        return creators.createSupernovaVisualizer(scene, params);
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
      // New visualizers
      case "waveform3Dmini":
        return creators.createWaveform3DVisualizermini(scene);
      case "particleSphere":
        return creators.createParticleSphereVisualizer(scene);
      case "cubeGrid":
        return creators.createCubeGridVisualizer(scene);
      case "spiralHelix":
        return creators.createSpiralHelixVisualizer(scene);
      case "pulsingRings":
        return creators.createPulsingRingsVisualizer(scene);
      case "crystalFormation":
        return creators.createCrystalFormationVisualizer(scene);
      case "galaxyNebula":
        return creators.createGalaxyNebulaVisualizer(scene);
      case "audioTunnel":
        return creators.createAudioTunnelVisualizer(scene);
      case "audioMesh":
        return creators.createAudioMeshVisualizer(scene);
      case "kaleidoscope2":
        return creators.createKaleidoscopeVisualizer2(scene);
      default:
        return creators.createAudioTunnelVisualizer(scene);
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
      case "voronoiCells":
        animators.animateVoronoiCells(objects, frequencyData, time);
        break;
      case "crystalCave":
        animators.animateCrystalCave(objects, frequencyData);
        break;

      case "supernova":
        animators.animateSupernova(objects, frequencyData);
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
      case "waveform3Dmini":
        animators.animateWaveform3DMini(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "particleSphere":
        animators.animateParticleSphere(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "cubeGrid":
        animators.animateCubeGrid(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "spiralHelix":
        animators.animateSpiralHelix(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "pulsingRings":
        animators.animatePulsingRings(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "crystalFormation":
        animators.animatecrys(objects, frequencyData, time, params, beatInfo);
        break;
      case "galaxyNebula":
        animators.animateGalaxyNebula(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "audioTunnel":
        animators.animateAudioTunnel(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "audioMesh":
        animators.animateAudioMesh(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      case "kaleidoscope2":
        animators.animateKaleidoscope2(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
        break;
      default:
        animators.animateAudioTunnel(
          objects,
          frequencyData,
          time,
          params,
          beatInfo
        );
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
      // New visualizers
      "waveform3Dmini",
      "particleSphere",
      "cubeGrid",
      "spiralHelix",
      "pulsingRings",
      "crystalFormation",
      "galaxyNebula",
      "audioTunnel",
      "audioMesh",
      "kaleidoscope2",
    ];
  }
}
