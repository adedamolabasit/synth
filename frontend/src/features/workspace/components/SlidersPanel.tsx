import React from "react";
import { Slider } from "../../../components/ui/Slider";

interface SlidersPanelProps {
  params: any;
  onParamsChange: (updater: (prev: any) => any) => void;
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
          onParamsChange((p: any) => ({ ...p, speed: v }))
        }
      />
    </div>
  );
};
