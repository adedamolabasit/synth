import * as THREE from "three";

import { VisualElement } from "../../../shared/types/visualizer.types";

export class ElementRendererManager {
  private scene: THREE.Scene;
  private elementObjects: Map<string, THREE.Object3D> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  getObjectIds(): string[] {
    return Array.from(this.elementObjects.keys());
  }

  getObject(elementId: string): THREE.Object3D | undefined {
    return this.elementObjects.get(elementId);
  }

  createElementObject(element: VisualElement): THREE.Object3D {
    let object: THREE.Object3D;

    switch (element.type) {
      case "text":
        object = this.createTextObject(element);
        break;
      case "image":
        object = this.createImageObject(element);
        break;
      case "gif":
        object = this.createGIFObject(element);
        break;
      case "icon":
        object = this.createIconObject(element);
        break;
      case "particleSystem":
        object = this.createParticleSystemObject(element);
        break;
      case "overlay":
        object = this.createOverlayObject(element);
        break;
      case "frame":
        object = this.createFrameObject(element);
        break;
      case "ambient":
        object = this.createAmbientObject(element);
        break;
      default:
        object = new THREE.Object3D();
    }

    object.position.set(...element.position);
    object.rotation.set(...element.rotation);
    object.scale.set(...element.scale);
    object.visible = element.visible;

    this.elementObjects.set(element.id, object);
    this.scene.add(object);

    return object;
  }

  private createTextObject(element: VisualElement): THREE.Object3D {
    const customization = element.customization as any;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.font = `${customization.fontWeight || "normal"} ${
        customization.fontSize || 24
      }px ${customization.fontFamily || "Arial"}`;
      context.fillStyle = customization.color || "#ffffff";
      context.textAlign = customization.textAlign || "center";
      context.textBaseline = "middle";

      if (customization.backgroundColor && customization.backgroundOpacity) {
        context.fillStyle = customization.backgroundColor;
        context.globalAlpha = customization.backgroundOpacity;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;
      }

      const text = customization.text || "";
      const lines = this.wrapText(context, text, canvas.width - 20);

      const lineHeight = (customization.fontSize || 24) * 1.2;
      const startY = (canvas.height - lines.length * lineHeight) / 2;

      lines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, startY + index * lineHeight);
      });

      if (customization.shadow) {
        context.shadowColor = customization.shadowColor || "#000000";
        context.shadowBlur = customization.shadowBlur || 10;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        lines.forEach((line, index) => {
          context.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });

        context.shadowColor = "transparent";
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.PlaneGeometry(10, 2.5);
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  private wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  private createImageObject(element: VisualElement): THREE.Object3D {
    const customization = element.customization as any;

    const textureLoader = new THREE.TextureLoader();
    let texture: THREE.Texture;

    if (customization.imageUrl) {
      texture = textureLoader.load(customization.imageUrl);
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#333333";
        context.fillRect(0, 0, 256, 256);
        context.fillStyle = "#666666";
        context.font = "20px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("No Image", 128, 128);
      }
      texture = new THREE.CanvasTexture(canvas);
    }

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: customization.opacity || 1,
      side: THREE.DoubleSide,
    });

    const width = customization.width || 100;
    const height = customization.height || 100;
    const geometry = new THREE.PlaneGeometry(width / 50, height / 50);
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  private createGIFObject(element: VisualElement): THREE.Object3D {
    return this.createImageObject(element);
  }

  private createIconObject(element: VisualElement): THREE.Object3D {
    const customization = element.customization as any;

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "80px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = customization.color || "#ffffff";
      context.fillText(customization.iconType || "🌟", 64, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const size = customization.size || 32;
    const geometry = new THREE.PlaneGeometry(size / 50, size / 50);
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  private createParticleSystemObject(element: VisualElement): THREE.Object3D {
    const customization = element.customization as any;
    const particleCount = customization.count || 100;
    const group = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
      let geometry: THREE.BufferGeometry;

      switch (customization.particleType) {
        case "square":
          geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
          break;
        case "star":
          const starShape = new THREE.Shape();
          const spikes = 5;
          const outerRadius = 0.05;
          const innerRadius = 0.025;

          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * j;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (j === 0) {
              starShape.moveTo(x, y);
            } else {
              starShape.lineTo(x, y);
            }
          }
          starShape.closePath();
          geometry = new THREE.ShapeGeometry(starShape);
          break;
        default:
          geometry = new THREE.SphereGeometry(0.05);
      }

      const material = new THREE.MeshBasicMaterial({
        color: customization.color || "#ffffff",
        transparent: true,
        opacity: customization.opacity || 1,
      });

      const particle = new THREE.Mesh(geometry, material);

      const spread = customization.spread || 50;
      particle.position.set(
        ((Math.random() - 0.5) * spread) / 50,
        ((Math.random() - 0.5) * spread) / 50,
        ((Math.random() - 0.5) * spread) / 50
      );

      (particle.userData as any) = {
        speed: (Math.random() * 0.5 + 0.5) * (customization.speed || 1),
        size: customization.size || 5,
        lifetime: customization.lifetime || 5,
        age: Math.random() * (customization.lifetime || 5),
        gravity: customization.gravity || 0,
        wind: customization.wind || 0,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
      };

      group.add(particle);
    }

    return group;
  }

  private createOverlayObject(element: VisualElement): THREE.Object3D {
    const customization = element.customization as any;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      switch (customization.overlayType) {
        case "gradient":
          const gradient = context.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
          );
          gradient.addColorStop(0, "#ff000080");
          gradient.addColorStop(1, "#0000ff80");
          context.fillStyle = gradient;
          context.fillRect(0, 0, canvas.width, canvas.height);
          break;

        case "noise":
          const imageData = context.createImageData(
            canvas.width,
            canvas.height
          );
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 255;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 50;
          }
          context.putImageData(imageData, 0, 0);
          break;

        case "grid":
          context.strokeStyle = "#ffffff40";
          context.lineWidth = 1;
          const gridSize = 50;
          for (let x = 0; x <= canvas.width; x += gridSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
          }
          for (let y = 0; y <= canvas.height; y += gridSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
          }
          break;

        case "vignette":
          const vignetteGradient = context.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2
          );
          vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
          vignetteGradient.addColorStop(1, "rgba(0,0,0,0.5)");
          context.fillStyle = vignetteGradient;
          context.fillRect(0, 0, canvas.width, canvas.height);
          break;

        case "scanlines":
          context.strokeStyle = "#00ff0040";
          context.lineWidth = 1;
          for (let y = 0; y < canvas.height; y += 4) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
          }
          break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: customization.opacity || 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(100, 100);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = -1;

    return mesh;
  }

  private createFrameObject(element: VisualElement): THREE.Object3D {
    const customization = element.customization as any;
    const group = new THREE.Group();

    const frameColor = customization.color || "#ffffff";

    const shape = new THREE.Shape();
    const outerSize = 10;
    const innerSize = 9.8;

    shape.moveTo(-outerSize, outerSize);
    shape.lineTo(outerSize, outerSize);
    shape.lineTo(outerSize, -outerSize);
    shape.lineTo(-outerSize, -outerSize);
    shape.lineTo(-outerSize, outerSize);

    const hole = new THREE.Path();
    hole.moveTo(-innerSize, innerSize);
    hole.lineTo(innerSize, innerSize);
    hole.lineTo(innerSize, -innerSize);
    hole.lineTo(-innerSize, -innerSize);
    hole.lineTo(-innerSize, innerSize);
    shape.holes.push(hole);

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: frameColor,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    return group;
  }

  private createAmbientObject(element: VisualElement): THREE.Object3D {
    const customization = element.customization as any;

    let geometry: THREE.BufferGeometry;
    switch (customization.elementType) {
      case "bouncing-ball":
      case "pulsing-sphere":
        geometry = new THREE.SphereGeometry(customization.size || 0.5);
        break;
      case "rotating-cube":
        geometry = new THREE.BoxGeometry(
          customization.size || 1,
          customization.size || 1,
          customization.size || 1
        );
        break;
      default:
        geometry = new THREE.SphereGeometry(0.3);
    }

    const material = new THREE.MeshBasicMaterial({
      color: customization.color || "#ffffff",
      transparent: true,
      opacity: customization.opacity || 0.6,
    });

    const mesh = new THREE.Mesh(geometry, material);

    (mesh.userData as any) = {
      movementType: customization.movementType || "float",
      speed: customization.speed || 1,
      amplitude: customization.amplitude || 1,
      frequency: customization.frequency || 1,
      bounceHeight: customization.bounceHeight || 3,
      startPosition: [...element.position] as [number, number, number],
    };

    return mesh;
  }

  updateElement(element: VisualElement) {
    const object = this.elementObjects.get(element.id);
    if (!object) {
      this.createElementObject(element);
      return;
    }

    object.visible = element.visible;

    object.position.set(...element.position);
    object.rotation.set(...element.rotation);
    object.scale.set(...element.scale);

    const customization = element.customization as any;

    if (element.type === "text") {
      this.updateTextObject(object as THREE.Mesh, customization);
    } else if (element.type === "image" || element.type === "gif") {
      this.updateImageObject(object as THREE.Mesh, customization, element.type);
    } else if (element.type === "icon") {
      this.updateIconObject(object as THREE.Mesh, customization);
    } else if (element.type === "particleSystem") {
      this.updateParticleSystem(object as THREE.Group, customization);
    } else {
      if (
        object instanceof THREE.Mesh &&
        object.material instanceof THREE.MeshBasicMaterial
      ) {
        object.material.opacity = customization.opacity || 1;
        if (customization.color && object.material.color) {
          object.material.color.set(customization.color);
        }
      }
    }
  }

  private updateTextObject(mesh: THREE.Mesh, customization: any) {
    const material = mesh.material as THREE.MeshBasicMaterial;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.font = `${customization.fontWeight || "normal"} ${
        customization.fontSize || 24
      }px ${customization.fontFamily || "Arial"}`;
      context.fillStyle = customization.color || "#ffffff";
      context.textAlign = customization.textAlign || "center";
      context.textBaseline = "middle";

      if (customization.backgroundColor && customization.backgroundOpacity) {
        context.fillStyle = customization.backgroundColor;
        context.globalAlpha = customization.backgroundOpacity;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;
      }

      const text = customization.text || "";
      const lines = this.wrapText(context, text, canvas.width - 20);

      const lineHeight = (customization.fontSize || 24) * 1.2;
      const startY = (canvas.height - lines.length * lineHeight) / 2;

      lines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, startY + index * lineHeight);
      });

      if (customization.shadow) {
        context.shadowColor = customization.shadowColor || "#000000";
        context.shadowBlur = customization.shadowBlur || 10;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        lines.forEach((line, index) => {
          context.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });
      }
    }

    if (material.map) {
      material.map.dispose();
    }
    material.map = new THREE.CanvasTexture(canvas);
    material.map.needsUpdate = true;
    material.opacity = customization.opacity || 1;
    if (customization.color && material.color) {
      material.color.set(customization.color);
    }
  }

  private updateImageObject(
    mesh: THREE.Mesh,
    customization: any,
    elementType: string
  ) {
    const material = mesh.material as THREE.MeshBasicMaterial;

    const currentUrl = material.map?.userData?.url || "";
    const newUrl =
      elementType === "gif" ? customization.gifUrl : customization.imageUrl;

    if (newUrl && newUrl !== currentUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(newUrl, (texture) => {
        if (material.map) {
          material.map.dispose();
        }
        material.map = texture;
        texture.userData = { url: newUrl };
        material.map.needsUpdate = true;
        material.opacity = customization.opacity || 1;
      });
    } else {
      material.opacity = customization.opacity || 1;
    }
  }

  private updateIconObject(mesh: THREE.Mesh, customization: any) {
    const material = mesh.material as THREE.MeshBasicMaterial;
    const geometry = mesh.geometry as THREE.PlaneGeometry;

    const size = customization.size || 32;
    geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(size / 50, size / 50);

    if (customization.iconType !== material.map?.userData?.iconType) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext("2d");

      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "80px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = customization.color || "#ffffff";
        context.fillText(customization.iconType || "🌟", 64, 64);
      }

      if (material.map) {
        material.map.dispose();
      }
      material.map = new THREE.CanvasTexture(canvas);
      material.map.userData = { iconType: customization.iconType };
      material.map.needsUpdate = true;
    }

    material.opacity = customization.opacity || 1;
    if (customization.color && material.color) {
      material.color.set(customization.color);
    }
  }

  private updateParticleSystem(group: THREE.Group, customization: any) {
    group.children.forEach((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = customization.opacity || 1;
          if (customization.color && child.material.color) {
            child.material.color.set(customization.color);
          }
        }

        const particleData = child.userData;
        if (particleData) {
          particleData.speed = customization.speed || 1;
          particleData.gravity = customization.gravity || 0;
          particleData.wind = customization.wind || 0;
          particleData.lifetime = customization.lifetime || 5;
        }
      }
    });
  }

  removeElement(elementId: string) {
    const object = this.elementObjects.get(elementId);
    if (object) {
      this.scene.remove(object);

      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }

      this.elementObjects.delete(elementId);
    }
  }

  animateElements(time: number) {
    this.elementObjects.forEach((object) => {
      if (object instanceof THREE.Group && object.children.length > 0) {
        object.children.forEach((child: THREE.Object3D) => {
          const particleData = child.userData;
          if (particleData) {
            child.position.x += particleData.velocity.x * particleData.speed;
            child.position.y += particleData.velocity.y * particleData.speed;
            child.position.z += particleData.velocity.z * particleData.speed;

            child.position.y -= particleData.gravity * 0.01;

            child.position.x += particleData.wind * 0.01;

            particleData.age += 0.016;

            if (particleData.age > particleData.lifetime) {
              particleData.age = 0;
              child.position.set(
                ((Math.random() - 0.5) * (particleData.spread || 50)) / 50,
                ((Math.random() - 0.5) * (particleData.spread || 50)) / 50,
                ((Math.random() - 0.5) * (particleData.spread || 50)) / 50
              );
            }
          }
        });
      } else if (object instanceof THREE.Mesh) {
        const animData = object.userData;
        if (animData && animData.movementType) {
          const t = time;
          const startPos = animData.startPosition || [0, 0, 0];

          switch (animData.movementType) {
            case "bounce":
              object.position.y =
                startPos[1] +
                Math.abs(Math.sin(t * animData.speed)) * animData.bounceHeight;
              break;
            case "float":
              object.position.y =
                startPos[1] + Math.sin(t * animData.speed) * animData.amplitude;
              object.position.x =
                startPos[0] +
                Math.cos(t * animData.speed * 0.7) * animData.amplitude;
              break;
            case "rotate":
              object.rotation.x += 0.01 * animData.speed;
              object.rotation.y += 0.01 * animData.speed;
              break;
            case "pulse":
              const scale = 1 + Math.sin(t * animData.speed) * 0.2;
              object.scale.set(scale, scale, scale);
              break;
          }
        }
      }
    });
  }

  dispose() {
    this.elementObjects.forEach((object) => {
      this.scene.remove(object);
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.elementObjects.clear();
  }
}
