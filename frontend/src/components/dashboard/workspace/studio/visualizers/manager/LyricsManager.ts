// src/studio/audio/LyricsManager.ts
import { LyricsData, LyricsState, LyricsDisplayConfig, WordTimestamp, SegmentTimestamp } from '../../types/visualizer';

export class LyricsManager {
  private lyricsData: LyricsData | null = null;
  private currentState: LyricsState;
  private config: LyricsDisplayConfig;
  private updateCallbacks: ((state: LyricsState) => void)[] = [];
  private lastUpdateTime: number = 0;

  constructor() {
    this.currentState = {
      currentLineIndex: -1,
      currentWordIndex: -1,
      currentLine: '',
      currentWord: '',
      progress: 0,
      isActive: false,
    };

    this.config = {
      fontSize: 24,
      color: '#ffffff',
      highlightColor: '#00ff88',
      backgroundColor: 'transparent',
      textAlign: 'center',
      position: { x: 0.5, y: 0.8 },
      animation: 'fade',
      showWordHighlight: true,
      showLineHighlight: true,
    };
  }

  loadLyrics(lyricsData: LyricsData): void {
    this.lyricsData = lyricsData;
    this.reset();
    console.log('Lyrics loaded:', lyricsData.segments?.length, 'segments');
  }

  update(currentTime: number): void {
    if (!this.lyricsData?.segments || !this.lyricsData.segments.length) {
      this.currentState.isActive = false;
      return;
    }

    this.currentState.isActive = true;
    
    // Find current segment (line)
    const currentSegmentIndex = this.findCurrentSegmentIndex(currentTime);
    this.currentState.currentLineIndex = currentSegmentIndex;
    
    if (currentSegmentIndex >= 0) {
      const currentSegment = this.lyricsData.segments[currentSegmentIndex];
      this.currentState.currentLine = currentSegment.text;
      
      // Find current word if word-level timestamps are available
      if (currentSegment.words && this.config.showWordHighlight) {
        const currentWordIndex = this.findCurrentWordIndex(currentSegment.words, currentTime);
        this.currentState.currentWordIndex = currentWordIndex;
        this.currentState.currentWord = currentWordIndex >= 0 ? currentSegment.words[currentWordIndex].word : '';
      } else {
        this.currentState.currentWordIndex = -1;
        this.currentState.currentWord = '';
      }
      
      // Calculate progress within current segment
      const segmentDuration = currentSegment.end - currentSegment.start;
      const segmentProgress = segmentDuration > 0 ? 
        (currentTime - currentSegment.start) / segmentDuration : 0;
      this.currentState.progress = Math.max(0, Math.min(1, segmentProgress));
    } else {
      this.currentState.currentLine = '';
      this.currentState.currentWord = '';
      this.currentState.progress = 0;
    }

    // Throttle updates to 60fps
    const now = Date.now();
    if (now - this.lastUpdateTime > 16) {
      this.notifyCallbacks();
      this.lastUpdateTime = now;
    }
  }

  private findCurrentSegmentIndex(currentTime: number): number {
    if (!this.lyricsData?.segments) return -1;
    
    for (let i = 0; i < this.lyricsData.segments.length; i++) {
      const segment = this.lyricsData.segments[i];
      if (currentTime >= segment.start && currentTime <= segment.end) {
        return i;
      }
    }
    
    // If no segment found, return the last segment that started
    for (let i = this.lyricsData.segments.length - 1; i >= 0; i--) {
      if (currentTime >= this.lyricsData.segments[i].start) {
        return i;
      }
    }
    
    return -1;
  }

  private findCurrentWordIndex(words: WordTimestamp[], currentTime: number): number {
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (currentTime >= word.start && currentTime <= word.end) {
        return i;
      }
    }
    
    // If no word found, return the last word that started
    for (let i = words.length - 1; i >= 0; i--) {
      if (currentTime >= words[i].start) {
        return i;
      }
    }
    
    return -1;
  }

  getCurrentState(): LyricsState {
    return { ...this.currentState };
  }

  getLyricsData(): LyricsData | null {
    return this.lyricsData;
  }

  getConfig(): LyricsDisplayConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<LyricsDisplayConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  reset(): void {
    this.currentState = {
      currentLineIndex: -1,
      currentWordIndex: -1,
      currentLine: '',
      currentWord: '',
      progress: 0,
      isActive: false,
    };
    this.notifyCallbacks();
  }

  onUpdate(callback: (state: LyricsState) => void): void {
    this.updateCallbacks.push(callback);
  }

  offUpdate(callback: (state: LyricsState) => void): void {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  private notifyCallbacks(): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(this.getCurrentState());
      } catch (error) {
        console.error('Lyrics callback error:', error);
      }
    });
  }

  // Utility methods for rendering
  getFormattedLine(): { text: string; words: WordTimestamp[] } | null {
    if (!this.lyricsData?.segments || this.currentState.currentLineIndex < 0) {
      return null;
    }

    const segment = this.lyricsData.segments[this.currentState.currentLineIndex];
    return {
      text: segment.text,
      words: segment.words || []
    };
  }

  getUpcomingLines(count: number = 3): string[] {
    if (!this.lyricsData?.segments) return [];
    
    const startIndex = this.currentState.currentLineIndex + 1;
    return this.lyricsData.segments
      .slice(startIndex, startIndex + count)
      .map(segment => segment.text);
  }

  getPreviousLines(count: number = 3): string[] {
    if (!this.lyricsData?.segments) return [];
    
    const startIndex = Math.max(0, this.currentState.currentLineIndex - count);
    return this.lyricsData.segments
      .slice(startIndex, this.currentState.currentLineIndex)
      .map(segment => segment.text);
  }
}