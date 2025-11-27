import { useEffect, useRef } from "react";
import { useAudio } from "../../../../provider/AudioContext";

export const useCanvasAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  sceneReady: boolean,
  isPlaying: boolean,
  params: any,
  visualElements: any[]
) => {
  const { frequencyData, beatInfo, audioLevel } = useAudio();
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!sceneReady || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw some basic visualization based on audio data
      if (frequencyData && frequencyData.length > 0) {
        const barWidth = canvas.width / frequencyData.length;
        const maxBarHeight = canvas.height * 0.4;

        ctx.fillStyle = '#00ff88';
        
        for (let i = 0; i < frequencyData.length; i++) {
          const barHeight = (frequencyData[i] / 255) * maxBarHeight;
          const x = i * barWidth;
          const y = canvas.height - barHeight;
          
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
      }

      // Draw beat indicator
      if (beatInfo?.isBeat) {
        ctx.fillStyle = '#ff0066';
        ctx.beginPath();
        ctx.arc(canvas.width - 30, 30, 15, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw audio level
      if (audioLevel > 0) {
        ctx.fillStyle = '#0099ff';
        const levelHeight = audioLevel * canvas.height;
        ctx.fillRect(10, canvas.height - levelHeight, 20, levelHeight);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sceneReady, isPlaying, frequencyData, beatInfo, audioLevel, canvasRef, params, visualElements]);

  // Log for debugging
  useEffect(() => {
    console.log('Canvas Animation State:', {
      sceneReady,
      isPlaying,
      hasFrequencyData: !!frequencyData,
      beatDetected: beatInfo?.isBeat,
      audioLevel
    });
  }, [sceneReady, isPlaying, frequencyData, beatInfo, audioLevel]);
};