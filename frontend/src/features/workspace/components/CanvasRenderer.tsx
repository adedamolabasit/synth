import React from "react";

interface CanvasRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  sceneReady: boolean;
  beatDetected: boolean;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  canvasRef,
  sceneReady,
  beatDetected,
}) => {
  return (
    <>
      <canvas 
        ref={canvasRef} 
        
        className="w-full h-full" 
        style={{ background: '#0a0a0a' }}
      />
      
      {!sceneReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="text-white text-lg">Initializing Visualizer...</div>
        </div>
      )}
      
      {beatDetected && (
        <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </>
  );
};