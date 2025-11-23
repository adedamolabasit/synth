import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  VisualElement,
  Customization,
  AudioData,
  VisualizerParams,
} from "../shared/types/visualizer.types";
import { VisualizerContextType } from "../shared/types/visualizer.types";
import {
  defaultVisualElements,
  defaultVisualizers,
  defaultAudioData,
  defaultParams,
} from "./config";

const VisualizerContext = createContext<VisualizerContextType | undefined>(
  undefined
);

export const VisualizerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [params, setParams] = useState<VisualizerParams>(defaultParams);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const [visualElements, setVisualElements] = useState<VisualElement[]>(
    defaultVisualElements
  );
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<AudioData>(defaultAudioData);
  const [showVisualizerLibrary, setShowVisualizerLibrary] = useState(false);
  const [currentVisualizer, setCurrentVisualizer] = useState("audioReactive");

  const updateElement = (id: string, updates: Partial<VisualElement>) => {
    setVisualElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const updateElementCustomization = (
    id: string,
    updates: Partial<Customization>
  ) => {
    setVisualElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              customization: { ...el.customization, ...updates },
            }
          : el
      )
    );
  };

  const handleSetParams = (
    newParams: VisualizerParams | ((prev: VisualizerParams) => VisualizerParams)
  ) => {
    setParams((prev) => {
      const updatedParams =
        typeof newParams === "function" ? newParams(prev) : newParams;
      if (updatedParams.visualizerType !== prev.visualizerType) {
        setCurrentVisualizer(updatedParams.visualizerType);
      }
      return updatedParams;
    });
  };

  const handleSetCurrentVisualizer = (visualizerType: string) => {
    setCurrentVisualizer(visualizerType);
    setParams((prev) => ({
      ...prev,
      visualizerType: visualizerType as VisualizerParams["visualizerType"],
    }));
  };

  const value: VisualizerContextType = {
    params,
    setParams: handleSetParams,
    visualElements,
    setVisualElements,
    updateElement,
    updateElementCustomization,
    selectedElement,
    setSelectedElement,
    audioData,
    setAudioData,
    showVisualizerLibrary,
    setShowVisualizerLibrary,
    visualizers: defaultVisualizers,
    currentVisualizer,
    setCurrentVisualizer: handleSetCurrentVisualizer,
    setShowDownloadModal,
    showDownloadModal,
    setVideoBlob,
    videoBlob,
  };

  return (
    <VisualizerContext.Provider value={value}>
      {children}
    </VisualizerContext.Provider>
  );
};

export const useVisualizer = () => {
  const context = useContext(VisualizerContext);
  if (context === undefined) {
    throw new Error("useVisualizer must be used within a VisualizerProvider");
  }
  return context;
};
