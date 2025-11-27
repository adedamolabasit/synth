import { useEffect } from "react";

export const useCanvasAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  sceneReady: boolean,
  isPlaying: boolean,
  params: any,
  visualElements: any[]
) => {
  useEffect(() => {
    console.log('Canvas Animation State:', {
      sceneReady,
      isPlaying,
      hasCanvas: !!canvasRef.current
    });

    // This hook is now mainly for logging and coordination
    // The actual Three.js animation is handled in useThreeSetup
  }, [sceneReady, isPlaying, params, visualElements, canvasRef]);
};