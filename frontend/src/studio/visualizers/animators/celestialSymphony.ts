// animations/celestialSymphony.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCelestialSymphony = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo,
  camera?: THREE.Camera
): void => {
  const bass = frequencyData[0] / 255;
  const mid = frequencyData[64] / 255;
  const treble = frequencyData[127] / 255;

  // Epic space camera - cinematic movement
  if (camera) {
    const orbitRadius = 30 + Math.sin(time * 0.05) * 10;
    camera.position.x = Math.sin(time * 0.08) * orbitRadius;
    camera.position.y = Math.sin(time * 0.03) * 8;
    camera.position.z = Math.cos(time * 0.08) * orbitRadius;
    camera.lookAt(0, 0, 0);
  }

  objects.forEach((obj) => {
    if (!obj.userData || obj.userData.type !== "celestialSymphony") return;

    const planets = obj.userData.planets as THREE.Mesh[];
    const orbitalPaths = obj.userData.orbitalPaths as THREE.Mesh[];
    const starField = obj.userData.starField as THREE.Points[];
    const sun = obj.userData.sun as THREE.Mesh;
    const orbitalSpeeds = obj.userData.orbitalSpeeds as number[];
    const planetaryPhases = obj.userData.planetaryPhases as number[];

    const cosmicIntensity = params.intensity * 0.02;
    const celestialSpeed = params.speed * 0.001;

    // Animate planets
    planets.forEach((planet, index) => {
      const speed = orbitalSpeeds[index];
      const phase = planetaryPhases[index];
      const freqIndex = Math.floor((index / planets.length) * frequencyData.length);
      const energy = frequencyData[freqIndex] / 255;

      // Orbital motion
      const orbitRadius = 8 + index * 3;
      const angle = time * speed + phase;
      
      planet.position.x = Math.cos(angle) * orbitRadius;
      planet.position.z = Math.sin(angle) * orbitRadius;
      
      // Planetary wobble
      planet.position.y = Math.sin(time * 2 + index) * 2 * bass;
      
      // Rotation
      planet.rotation.y += speed * 2;
      planet.rotation.x += Math.sin(time + index) * 0.01;

      // Scale pulsation
      const pulse = Math.sin(time * 3 + index) * 0.1 + 1;
      planet.scale.setScalar(pulse + energy * 0.3);

      // Atmospheric effects
      const material = planet.material as THREE.MeshPhysicalMaterial;
      const hueShift = (time * 0.01 + index * 0.1) % 1;
      material.emissive = new THREE.Color().setHSL(hueShift, 0.5, 0.2);
      material.emissiveIntensity = 0.1 + energy * 0.2;
    });

    // Animate sun
    sun.rotation.y += celestialSpeed * 2;
    const sunMaterial = sun.material as THREE.MeshBasicMaterial;
    sunMaterial.emissiveIntensity = 0.3 + bass * 0.4;
    sun.scale.setScalar(1 + Math.sin(time * 2) * 0.1 + bass * 0.2);

    // Animate orbital paths
    orbitalPaths.forEach((orbit, index) => {
      const material = orbit.material as THREE.MeshBasicMaterial;
      const glow = Math.sin(time * 1.5 + index) * 0.3 + 0.7;
      material.opacity = 0.1 + mid * 0.2 * glow;
    });

    // Animate star field
    starField.forEach(stars => {
      const geometry = stars.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      // Subtle star twinkling
      for (let i = 0; i < positions.length; i += 3) {
        const twinkle = Math.sin(time * 5 + i) * 0.1;
        positions[i] *= 1 + twinkle * 0.001;
        positions[i + 1] *= 1 + twinkle * 0.001;
        positions[i + 2] *= 1 + twinkle * 0.001;
      }
      
      geometry.attributes.position.needsUpdate = true;
    });

    // Global celestial rotation
    obj.rotation.y += celestialSpeed * bass;
    obj.rotation.x += celestialSpeed * mid * 0.5;

    // Cosmic event on beat
    if (beatInfo?.isBeat) {
      // Solar flare
      sunMaterial.emissiveIntensity = 2;
      sun.scale.setScalar(1.5);
      
      // Planetary alignment flash
      planets.forEach(planet => {
        const material = planet.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = 1;
        setTimeout(() => {
          material.emissiveIntensity = 0.1;
        }, 200);
      });

      // Star field intensification
      const starMaterial = starField[0].material as THREE.PointsMaterial;
      starMaterial.size = 1;
      starMaterial.opacity = 1;
      setTimeout(() => {
        starMaterial.size = 0.5;
        starMaterial.opacity = 0.8;
      }, 150);
    }
  });
};