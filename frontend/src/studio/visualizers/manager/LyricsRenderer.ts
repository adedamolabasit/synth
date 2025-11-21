import * as THREE from "three";
import { LyricsManager } from "./LyricsManager";
import {
  LyricsState,
  LyricsDisplayConfig,
} from "../../../shared/types/visualizer.types";

export class LyricsRenderer {
  private scene: THREE.Scene;
  private lyricsManager: LyricsManager;
  private currentLyricsObject: THREE.Mesh | null = null;
  private previousLinesMesh: THREE.Mesh | null = null;
  private upcomingLinesMesh: THREE.Mesh | null = null;
  private lyricsLayer: THREE.Group;
  private config: LyricsDisplayConfig;

  constructor(scene: THREE.Scene, lyricsManager: LyricsManager) {
    this.scene = scene;
    this.lyricsManager = lyricsManager;
    this.config = lyricsManager.getConfig();

    this.lyricsLayer = new THREE.Group();
    this.lyricsLayer.renderOrder = 9999;
    this.scene.add(this.lyricsLayer);

    lyricsManager.onUpdate(this.handleLyricsUpdate.bind(this));
  }

  private handleLyricsUpdate(state: LyricsState) {
    if (!state.isActive || !state.currentLine) {
      this.clearAllLyrics();
      return;
    }

    this.config = this.lyricsManager.getConfig();
    this.renderAllLyrics(state, this.config);
  }

  private renderAllLyrics(state: LyricsState, config: LyricsDisplayConfig) {
    this.clearAllLyrics();

    const formattedLine = this.lyricsManager.getFormattedLine();
    const upcoming = this.lyricsManager.getUpcomingLines(1);
    const previous = this.lyricsManager.getPreviousLines(1);

    // Previous (smaller + faded)
    if (previous.length > 0) {
      this.previousLinesMesh = this.createTextMesh(previous[0], {
        fontSize: 16,
        opacity: 0.5,
        color: "#d1d5db",
        y: -9.2,
      });
      if (this.previousLinesMesh) this.lyricsLayer.add(this.previousLinesMesh);
    }

    // Current
    this.currentLyricsObject = this.createTextMesh(
      state.currentLine,
      {
        fontSize: 22,
        opacity: 1,
        color: config.color,
        y: -11.5,
        scale: config.showLineHighlight ? 1.1 : 1,
        isCurrent: true,
      }
    );

    if (this.currentLyricsObject)
      this.lyricsLayer.add(this.currentLyricsObject);

    // Upcoming
    if (upcoming.length > 0) {
      this.upcomingLinesMesh = this.createTextMesh(upcoming[0], {
        fontSize:16,
        opacity: 0.7,
        color: "#e2e8f0",
        y: -12.8,
      });
      if (this.upcomingLinesMesh)
        this.lyricsLayer.add(this.upcomingLinesMesh);
    }
  }

  /**
   * Create sharp, transparent, auto-wrapped text mesh
   */
  private createTextMesh(
    text: string,
    options: {
      fontSize: number;
      opacity: number;
      color: string;
      y: number;
      scale?: number;
      isCurrent?: boolean;
    }
  ): THREE.Mesh | null {
    try {
      const maxWidthPx = 1300; // ✨ prevents cutoff
      const scaleFactor = 2;
      const padding = 20 * scaleFactor;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.font = `700 ${options.fontSize * scaleFactor}px Inter, sans-serif`;

      // ✨ Auto-wrap long text
      const words = text.split(" ");
      const lines: string[] = [];
      let current = "";

      words.forEach((w) => {
        const test = current + w + " ";
        if (ctx.measureText(test).width > maxWidthPx) {
          lines.push(current.trim());
          current = w + " ";
        } else {
          current = test;
        }
      });
      if (current.trim()) lines.push(current.trim());

      const lineHeight = options.fontSize * scaleFactor * 1.35;
      canvas.width = maxWidthPx + padding * 2;
      canvas.height = lineHeight * lines.length + padding * 2;

      // Transparent background ✨
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = options.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${options.fontSize * scaleFactor}px Inter, sans-serif`;

      // Shadow for glow
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 6 * scaleFactor;

      // Draw each line
      lines.forEach((line, i) => {
        const yPos = padding + lineHeight / 2 + i * lineHeight;
        ctx.fillText(line, canvas.width / 2, yPos);
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const aspect = canvas.width / canvas.height;
      const width = options.isCurrent ? 20 : 16;
      const height = width / aspect;

      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: options.opacity,
        depthTest: false,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Raise from bottom ✨
      mesh.position.set(0, options.y, 0.2);

      if (options.scale) mesh.scale.set(options.scale, options.scale, 1);

      return mesh;
    } catch (err) {
      console.error("❌ Text mesh error", err);
      return null;
    }
  }

  private clearAllLyrics() {
    this.lyricsLayer.clear();
  }

  // ❗ STOP ROTATION — No billboard, no copy quaternion
  public update() {}

  public dispose() {
    this.scene.remove(this.lyricsLayer);
  }
}
