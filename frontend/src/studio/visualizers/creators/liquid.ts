import * as THREE from "three"
import type { VisualizerParams } from "../../types/visualizer"

export const createLiquidVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = []
  const resolution = 64 // increased resolution for more detail
  const geometry = new THREE.PlaneGeometry(10, 10, resolution - 1, resolution - 1)

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.6, 0.75, 0.45),
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    wireframe: params.wireframe,
    emissive: new THREE.Color().setHSL(0.6, 0.6, 0.2),
    emissiveIntensity: 0.2,
  })

  const liquidSurface = new THREE.Mesh(geometry, material)
  liquidSurface.rotation.x = -Math.PI / 2
  liquidSurface.userData = {
    type: "liquid",
    resolution,
    originalVertices: geometry.attributes.position.array.slice(),
    waveCenters: Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      time: Math.random() * Math.PI * 2,
      frequency: 0.5 + Math.random() * 2,
      amplitude: 0.3 + Math.random() * 0.4,
    })),
  }

  scene.add(liquidSurface)
  objects.push(liquidSurface)

  const particleCount = Math.min(params.particleCount, 1000)
  const particleGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  const velocities = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    positions[i3] = Math.random() * 10 - 5
    positions[i3 + 1] = Math.random() * 3
    positions[i3 + 2] = Math.random() * 10 - 5

    const hue = Math.random() * 0.15 + 0.55
    const saturation = 0.7 + Math.random() * 0.3
    const lightness = 0.4 + Math.random() * 0.3
    const color = new THREE.Color().setHSL(hue, saturation, lightness)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    sizes[i] = 0.05 + Math.random() * 0.15

    velocities[i3] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 1] = Math.random() * 0.01 + 0.005
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))
  particleGeometry.userData.velocities = velocities

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    sizeAttenuation: true,
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  particles.userData.type = "liquidParticles"
  scene.add(particles)
  objects.push(particles)

  const orbCount = 5
  for (let i = 0; i < orbCount; i++) {
    const orbGeometry = new THREE.IcosahedronGeometry(0.15 + Math.random() * 0.1, 16)
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.8, 0.55),
      metalness: 0.8,
      roughness: 0.1,
      emissive: new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.8, 0.4),
      emissiveIntensity: 0.6,
    })

    const orb = new THREE.Mesh(orbGeometry, orbMaterial)
    orb.position.set(Math.random() * 8 - 4, 1 + Math.random() * 2, Math.random() * 8 - 4)
    orb.userData = {
      type: "floatingOrb",
      speed: 0.3 + Math.random() * 0.5,
      orbitRadius: 2 + Math.random() * 3,
      orbitAngle: Math.random() * Math.PI * 2,
      bobOffset: Math.random() * Math.PI * 2,
    }

    scene.add(orb)
    objects.push(orb)
  }

  const lineGeometry = new THREE.BufferGeometry()
  const linePositions: number[] = []

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const radius = 5
    linePositions.push(Math.cos(angle) * radius, 0.01, Math.sin(angle) * radius, 0, 0, 0)
  }

  lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3))
  const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color().setHSL(0.6, 0.5, 0.4),
    transparent: true,
    opacity: 0.3,
  })

  for (let i = 0; i < linePositions.length / 6; i++) {
    const line = new THREE.Line(lineGeometry, lineMaterial)
    line.userData.type = "gridLine"
    scene.add(line)
    objects.push(line)
  }

  return objects
}
