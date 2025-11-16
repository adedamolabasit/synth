// SlidersPanel.tsx
import React from "react";
import { VisualizerParams } from "./studio/types/visualizer";
import { Slider } from "../../ui/Slider";

interface SlidersPanelProps {
  params: VisualizerParams;
  onParamsChange: (updater: (prev: VisualizerParams) => VisualizerParams) => void;
}

export const SlidersPanel: React.FC<SlidersPanelProps> = ({
  params,
  onParamsChange,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <Slider
        label="Intensity"
        value={params.intensity}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, intensity: v }))
        }
      />
      <Slider
        label="Speed"
        value={params.speed}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, speed: v }))
        }
      />
      <Slider
        label="Rotation"
        value={params.rotationSpeed}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, rotationSpeed: v }))
        }
      />
      <Slider
        label="Complexity"
        value={params.complexity}
        min={1}
        max={10}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, complexity: v }))
        }
      />
      <Slider
        label="Particles"
        value={params.particleCount}
        min={100}
        max={10000}
        step={100}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, particleCount: v }))
        }
      />
      <Slider
        label="Morph Speed"
        value={params.morphSpeed}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, morphSpeed: v }))
        }
      />
      <Slider
        label="Fluidity"
        value={params.fluidity}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, fluidity: v }))
        }
      />
      <Slider
        label="Reaction Speed"
        value={params.reactionSpeed}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, reactionSpeed: v }))
        }
      />
    </div>
  );
};