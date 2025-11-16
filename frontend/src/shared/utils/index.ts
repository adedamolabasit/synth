import { AudioFile } from "../../components/dashboard/workspace/studio/types/audio";

export const simulateAudioData = (): Uint8Array => {
  const simulatedData = new Uint8Array(1024);
  const time = Date.now() * 0.001;
  
  for (let i = 0; i < simulatedData.length; i++) {
    const baseFreq = Math.sin(time * 2 + i * 0.01) * 0.5 + 0.5;
    const harmonic1 = Math.sin(time * 4 + i * 0.02) * 0.3;
    const harmonic2 = Math.sin(time * 8 + i * 0.04) * 0.2;
    const value = (baseFreq + harmonic1 + harmonic2) / 1.5;
    
    simulatedData[i] = Math.floor(value * 155 + 100);
  }
  
  return simulatedData;
};

export const decodeGzippedBase64 = async (base64Data: string): Promise<string> => {
  try {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decompressedStream = new Response(bytes).body?.pipeThrough(
      new DecompressionStream('gzip')
    );
    
    if (decompressedStream) {
      const decompressedResponse = new Response(decompressedStream);
      return await decompressedResponse.text();
    }
    
    return "Unable to decompress data";
  } catch (error) {
    console.error('Error decoding data:', error);
    return "Error decoding content";
  }
};

export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number) => {
  if (!bytes) return "Unknown size";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

export const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getAudioSource = (audioFile: AudioFile) => {
  return audioFile.audioUrl || audioFile.url;
};