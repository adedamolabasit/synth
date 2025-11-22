import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  ChromaticAberrationEffect,
  GlitchEffect,
} from "postprocessing";
import * as THREE from "three";
import { VisualizerParams } from "../../shared/types/visualizer.types";

export const createPostFX = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, params: VisualizerParams) => {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloom = new BloomEffect({
    intensity: params.glowIntensity * 0.03,
    luminanceThreshold: 0.2,
    luminanceSmoothing: 0.1,
  });

  const chroma = new ChromaticAberrationEffect({
    offset: new THREE.Vector2(0.001 * params.intensity, 0.002),
    radialModulation: false,
    modulationOffset: 0.0
  });

const glitch = new GlitchEffect({
  delay: new THREE.Vector2(1, 2),
  duration: new THREE.Vector2(0.1, 0.3),
  strength: new THREE.Vector2(0.2, 0.2), 
});


  const effectPass = new EffectPass(camera, bloom, chroma, glitch);
  composer.addPass(effectPass);

  return { composer, effects: { bloom, chroma, glitch } };
};
