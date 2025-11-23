import React from "react";
import { VisualizerParams } from "../../../studio/types/visualizer";
import { Slider } from "../../ui/Slider";

interface SlidersPanelProps {
  params: VisualizerParams;
  onParamsChange: (
    updater: (prev: VisualizerParams) => VisualizerParams
  ) => void;
}

export const SlidersPanel: React.FC<SlidersPanelProps> = ({
  params,
  onParamsChange,
}) => {
  return (
    <div className="">
      <Slider
        label="Speed"
        value={params.speed}
        onChange={(v: number) =>
          onParamsChange((p: VisualizerParams) => ({ ...p, speed: v }))
        }
      />
    </div>
  );
};
