import gsap from "gsap";
import * as THREE from "three";
import { VisualizerParams } from "../../shared/types/visualizer.types";

export const animateCamera = (
  camera: THREE.Camera,
  params: VisualizerParams
) => {
  gsap.to(camera.position, {
    z: 5 + params.intensity * 0.05,
    duration: 4,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
};

export const beatPulse = (obj: THREE.Object3D, strength = 1.4) => {
  gsap.to(obj.scale, {
    x: strength,
    y: strength,
    z: strength,
    duration: 0.12,
    ease: "expo.out",
    yoyo: true,
  });
};

export const rotateScene = (scene: THREE.Scene, params: VisualizerParams) => {
  gsap.to(scene.rotation, {
    y: `+=${params.rotationSpeed * 0.02}`,
    duration: 1,
    repeat: -1,
    ease: "none",
  });
};
