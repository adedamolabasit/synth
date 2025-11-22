import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AudioFile } from "../shared/types/audio.types";
import { BeatInfo } from "../studio/types/visualizer";
import { AudioManager } from "../studio/visualizers/manager/AudioManager";

interface AudioState {
  currentAudio: AudioFile | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  beatInfo: BeatInfo;
  audioLevel: number;
}

interface AudioContextType extends AudioState {
  playAudio: (audioFile: AudioFile) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => Promise<void>;
  stopAudio: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  getAudioUrl: () => string | null;
  getAudioManager: () => AudioManager;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    currentAudio: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    frequencyData: new Uint8Array(1024),
    timeData: new Uint8Array(1024),
    beatInfo: {
      isBeat: false,
      strength: 0,
      bandStrengths: { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
    },
    audioLevel: 0,
  });

  const audioManagerRef = useRef<AudioManager>(new AudioManager());
  const animationRef = useRef<number>();

  useEffect(() => {
    const initializeAudio = async () => {
      await audioManagerRef.current.initialize();
      startAudioAnalysis();
    };

    initializeAudio();

    audioManagerRef.current.onTimeUpdate((currentTime, duration) => {
      setAudioState((prev) => ({
        ...prev,
        currentTime,
        duration,
      }));
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioManagerRef.current.cleanup();
    };
  }, []);

  const startAudioAnalysis = () => {
    const analyzeAudio = () => {
      const audioManager = audioManagerRef.current;

      const frequencyData = audioManager.getFrequencyData();
      const timeData = audioManager.getTimeDomainData();

      const beatInfo = audioManager.detectBeat(frequencyData);

      setAudioState((prev) => ({
        ...prev,
        frequencyData,
        timeData,
        beatInfo,
        audioLevel: beatInfo.strength * 100,
        isPlaying: audioManager.isPlaying(),
      }));

      animationRef.current = requestAnimationFrame(analyzeAudio);
    };

    animationRef.current = requestAnimationFrame(analyzeAudio);
  };

  const playAudio = async (audioFile: AudioFile) => {
    try {
      const audioUrl = audioFile.audioUrl || audioFile.url;
      if (!audioUrl) {
        return;
      }

      setAudioState((prev) => ({
        ...prev,
        currentAudio: audioFile,
        isLoading: true,
      }));

      const success = await audioManagerRef.current.loadAudioFromUrl(audioUrl);
      if (success) {
        await audioManagerRef.current.play();
        setAudioState((prev) => ({
          ...prev,
          isPlaying: true,
          isLoading: false,
        }));
      } else {
        throw new Error("Failed to load audio");
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setAudioState((prev) => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
      }));
    }
  };

  const pauseAudio = () => {
    audioManagerRef.current.pause();
    setAudioState((prev) => ({ ...prev, isPlaying: false }));
  };

  const resumeAudio = async () => {
    try {
      await audioManagerRef.current.play();
      setAudioState((prev) => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error("Error resuming audio:", error);
    }
  };

  const stopAudio = () => {
    audioManagerRef.current.pause();
    audioManagerRef.current.seekTo(0);
    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  };

  const seekTo = (time: number) => {
    audioManagerRef.current.seekTo(time);
    setAudioState((prev) => ({ ...prev, currentTime: time }));
  };

  const setVolume = (volume: number) => {
    setAudioState((prev) => ({ ...prev, volume }));
  };

  const setPlaybackRate = (rate: number) => {
    setAudioState((prev) => ({ ...prev, playbackRate: rate }));
  };

  const toggleMute = () => {
    setAudioState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const getAudioUrl = (): string | null => {
    return audioState.currentAudio
      ? audioState.currentAudio.audioUrl || audioState.currentAudio.url
      : null;
  };

  const getAudioManager = (): AudioManager => {
    return audioManagerRef.current;
  };

  const value: AudioContextType = {
    ...audioState,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    seekTo,
    setVolume,
    setPlaybackRate,
    toggleMute,
    getAudioUrl,
    getAudioManager,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
