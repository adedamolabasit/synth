import { BeatInfo } from "../../../shared/types/visualizer.types";
import { LyricsManager } from "./LyricsManager";

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private beatCutoff: number = 0;
  private beatTime: number = 0;
  private isInitialized: boolean = false;
  private defaultSource: AudioBufferSourceNode | null = null;
  private isDefaultAudioPlaying: boolean = false;
  private progressCallbacks: ((
    currentTime: number,
    duration: number
  ) => void)[] = [];
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private lyricsManager: LyricsManager | null = null;

  private frequencyBands = {
    bass: [20, 250],
    lowMid: [250, 500],
    mid: [500, 2000],
    highMid: [2000, 6000],
    treble: [6000, 20000],
  };

  async loadAudioFromUrl(url: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.pause();
    this.isDefaultAudioPlaying = false;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
      if (this.audioContext && this.destinationNode && !this.source) {
        this.source = this.audioContext.createMediaElementSource(
          this.audioElement
        );
        this.source.connect(this.analyser!);
        this.analyser!.connect(this.destinationNode);
        this.analyser!.connect(this.audioContext.destination);
      }
    }

    return new Promise((resolve) => {
      this.audioElement!.src = url;
      this.audioElement!.ontimeupdate = () => this.notifyProgressCallbacks();
      this.audioElement!.onended = () => {
        this.isDefaultAudioPlaying = false;
        this.notifyProgressCallbacks();
      };
      this.audioElement!.oncanplaythrough = () => {
        resolve(true);
      };
      this.audioElement!.onerror = (e) => {
        resolve(false);
      };
    });
  }

  async initialize() {
    if (this.isInitialized) return;
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0.7;
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
      this.source = this.audioContext.createMediaElementSource(
        this.audioElement
      );
      this.destinationNode = this.audioContext.createMediaStreamDestination();
      this.source.connect(this.analyser);
      this.analyser.connect(this.destinationNode);
      this.analyser.connect(this.audioContext.destination);
      this.isInitialized = true;
    } catch (error) {
      this.isInitialized = false;
    }
  }

  getProcessedAudioStream(): MediaStream | null {
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }

  async loadAudioFile(file: File): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    this.pause();
    this.isDefaultAudioPlaying = false;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
      if (this.audioContext && this.destinationNode && !this.source) {
        this.source = this.audioContext.createMediaElementSource(
          this.audioElement
        );
        this.source.connect(this.analyser!);
        this.analyser!.connect(this.destinationNode);
        this.analyser!.connect(this.audioContext.destination);
      }
    }

    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      this.audioElement!.src = url;
      this.audioElement!.ontimeupdate = () => this.notifyProgressCallbacks();
      this.audioElement!.onended = () => {
        this.isDefaultAudioPlaying = false;
        this.notifyProgressCallbacks();
      };
      this.audioElement!.oncanplaythrough = () => {
        resolve(true);
      };
      this.audioElement!.onerror = (e) => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
    });
  }

  async loadDefaultAudio(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.pause();

      const duration = 10;
      const sampleRate = 44100;
      const numberOfSamples = duration * sampleRate;
      const audioBuffer = this.audioContext!.createBuffer(
        2,
        numberOfSamples,
        sampleRate
      );

      for (let channel = 0; channel < 2; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < numberOfSamples; i++) {
          const t = i / sampleRate;
          const freq1 = 220 + Math.sin(t * 0.5) * 110;
          const freq2 = 440 + Math.sin(t * 0.3) * 220;
          channelData[i] =
            Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
            Math.sin(2 * Math.PI * freq2 * t) * 0.2;
        }
      }

      this.defaultSource = this.audioContext!.createBufferSource();
      this.defaultSource.buffer = audioBuffer;
      this.defaultSource.connect(this.analyser!);
      this.defaultSource.loop = true;

      return true;
    } catch (error) {
      return false;
    }
  }

  async play(): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }

    if (this.audioElement && this.audioElement.src) {
      await this.audioElement.play();
      this.startProgressTracking();
      return;
    }

    if (this.defaultSource) {
      try {
        this.defaultSource.start();
        this.isDefaultAudioPlaying = true;
        this.startProgressTracking();
      } catch (error) {
        await this.loadDefaultAudio();
        this.defaultSource!.start();
        this.isDefaultAudioPlaying = true;
        this.startProgressTracking();
      }
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.defaultSource && this.isDefaultAudioPlaying) {
      try {
        this.defaultSource.stop();
      } catch (error) {}
      this.isDefaultAudioPlaying = false;

      this.loadDefaultAudio();
    }
    this.stopProgressTracking();
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(1024);
    const d = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(d);
    return d;
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(1024);
    const d = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(d);
    return d;
  }

  detectBeat(frequencyData: Uint8Array): BeatInfo {
    const bandStrengths: BeatInfo["bandStrengths"] = {
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      treble: 0,
    };

    let totalEnergy = 0;
    Object.entries(this.frequencyBands).forEach(([band, [low, high]]) => {
      const lowIndex = Math.floor((low / 20000) * frequencyData.length);
      const highIndex = Math.floor((high / 20000) * frequencyData.length);
      let energy = 0;
      const count = highIndex - lowIndex;
      if (count > 0) {
        for (let i = lowIndex; i < highIndex; i++) energy += frequencyData[i];
        energy /= count;
      }
      bandStrengths[band as keyof BeatInfo["bandStrengths"]] = energy / 255;
      totalEnergy += energy;
    });

    const averageEnergy = totalEnergy / 5 / 255;
    const currentTime = Date.now();
    const isBeat =
      averageEnergy > this.beatCutoff && currentTime - this.beatTime > 200;
    if (isBeat) {
      this.beatTime = currentTime;
      this.beatCutoff = averageEnergy * 1.3;
    } else {
      this.beatCutoff *= 0.95;
    }

    return {
      isBeat,
      strength: averageEnergy,
      bandStrengths,
    };
  }

  getBassLevel(frequencyData: Uint8Array): number {
    const [low, high] = this.frequencyBands.bass;
    const lowIndex = Math.floor((low / 20000) * frequencyData.length);
    const highIndex = Math.floor((high / 20000) * frequencyData.length);
    let bassEnergy = 0;
    const count = highIndex - lowIndex;
    if (count > 0) {
      for (let i = lowIndex; i < highIndex; i++) bassEnergy += frequencyData[i];
      bassEnergy /= count;
    }
    return bassEnergy / 255 || 0;
  }

  isPlaying(): boolean {
    if (this.audioElement)
      return !this.audioElement.paused && !this.audioElement.ended;
    return this.isDefaultAudioPlaying;
  }

  getDuration(): number {
    if (this.audioElement && this.audioElement.duration)
      return this.audioElement.duration;
    return this.defaultSource?.buffer?.duration || 10;
  }

  getCurrentTime(): number {
    if (this.audioElement) return this.audioElement.currentTime || 0;
    return this.defaultSource?.context?.currentTime || 0;
  }

  onTimeUpdate(cb: (currentTime: number, duration: number) => void) {
    this.progressCallbacks.push(cb);
  }

  offTimeUpdate(cb: (currentTime: number, duration: number) => void) {
    this.progressCallbacks = this.progressCallbacks.filter((c) => c !== cb);
  }

  setLyricsManager(lyricsManager: LyricsManager): void {
    this.lyricsManager = lyricsManager;

    this.onTimeUpdate((currentTime) => {
      if (this.lyricsManager) {
        this.lyricsManager.update(currentTime);
      }
    });
  }

  loadLyricsData(lyricsData: any): void {
    if (this.lyricsManager) {
      this.lyricsManager.loadLyrics(lyricsData);
    }
  }
  private notifyProgressCallbacks() {
    const currentTime = this.getCurrentTime();
    const duration = this.getDuration();
    this.progressCallbacks.forEach((cb) => {
      try {
        cb(currentTime, duration);
      } catch (e) {}
    });
  }

  private progressInterval: number | null = null;
  private startProgressTracking() {
    this.stopProgressTracking();
    this.progressInterval = window.setInterval(
      () => this.notifyProgressCallbacks(),
      100
    );
  }
  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  seekTo(time: number) {
    if (this.audioElement) this.audioElement.currentTime = time;
  }

  cleanup() {
    try {
      this.stopProgressTracking();
      this.progressCallbacks = [];
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = "";
        try {
          this.audioElement.load();
        } catch {}
      }
      if (this.defaultSource) {
        try {
          this.defaultSource.stop();
        } catch {}
        this.defaultSource = null;
      }
      this.isDefaultAudioPlaying = false;
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      this.isInitialized = false;
      this.destinationNode = null;
    } catch (error) {}
  }
}
