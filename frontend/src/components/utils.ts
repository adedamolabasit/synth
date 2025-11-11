export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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