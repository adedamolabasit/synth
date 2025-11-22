export const getAudioBand = (
  frequencyData: Uint8Array,
  band: "bass" | "mid" | "treble" | number
): number => {
  const len = frequencyData.length;

  let start: number, end: number;

  if (typeof band === "number") {
    const idx = Math.floor(Math.min(1, Math.max(0, band)) * len);
    return frequencyData[idx] / 255;
  }

  switch (band) {
    case "bass":
      start = 0;
      end = Math.floor(len * 0.1);
      break;
    case "mid":
      start = Math.floor(len * 0.1);
      end = Math.floor(len * 0.5);
      break;
    case "treble":
      start = Math.floor(len * 0.5);
      end = len;
      break;
    default:
      start = 0;
      end = len;
  }

  const slice = frequencyData.slice(start, end);
  if (!slice.length) return 0;
  const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
  return avg / 255; 
};


export const colorShift = (
  time: number,
  depth: number,
  audioValue: number,
  beatInfo?: { isBeat?: boolean }
) => {
  const baseHue = (time * 0.05 + depth * 0.1 + audioValue * 0.3) % 1;
  const lightness = 0.4 + audioValue * 0.3 + (beatInfo?.isBeat ? 0.1 : 0);
  return { hue: baseHue, lightness };
};
