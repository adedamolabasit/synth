// components/VisualElementSelector.tsx
import React from "react";
import { Settings, Plus, Trash2, Sparkles, Zap } from "lucide-react";
import { useVisualizer, defaultCustomizations } from "../../../provider/VisualizerContext";
import { Button } from "../../../components/ui/Button";
import { VisualElement } from "../../types/visualizer";

export const VisualElementSelector: React.FC = () => {
  const {
    visualElements,
    selectedElement,
    setSelectedElement,
    setVisualElements,
  } = useVisualizer();

  const addNewElement = (type: VisualElement["type"]) => {
    const elementNames = {
      particle: "Particles",
      shape: "Shape",
      light: "Light",
      grid: "Grid",
      wave: "Wave",
      background: "Background",
      ambient: "Ambient Element",
    };

    setVisualElements((prev) => {
      const newElement: VisualElement = {
        id: `${type}-${Date.now()}`,
        type,
        name: `${elementNames[type]} ${
          prev.filter((el) => el.type === type).length + 1
        }`,
        visible: true,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        customization: defaultCustomizations[type] as any,
      };

      return [...prev, newElement];
    });

    setSelectedElement(`${type}-${Date.now()}`);
  };

  // In VisualElementSelector.tsx - Update addAmbientElement
  const addAmbientElement = (ambientType: string) => {
    const ambientNames = {
      "bouncing-ball": "Bouncing Ball",
      "floating-particle": "Floating Particle",
      "flying-bird": "Flying Bird",
      "floating-text": "Floating Text",
      "rotating-cube": "Rotating Cube",
      "pulsing-sphere": "Pulsing Sphere",
    };

    setVisualElements((prev) => {
      // Generate random hex color
      const randomColor = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;

      const newElement: VisualElement = {
        id: `ambient-${Date.now()}`,
        type: "ambient",
        name:
          ambientNames[ambientType as keyof typeof ambientNames] ||
          "Ambient Element",
        visible: true,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 5,
        ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        customization: {
          elementType: ambientType,
          color: randomColor, // Use hex color instead of HSL
          size: 0.5 + Math.random() * 1,
          speed: 0.5 + Math.random() * 1,
          amplitude: 1 + Math.random() * 2,
          frequency: 0.5 + Math.random() * 1,
          bounceHeight: 2 + Math.random() * 3,
          movementType: ambientType.includes("bounce")
            ? "bounce"
            : ambientType.includes("float")
            ? "float"
            : ambientType.includes("fly")
            ? "fly"
            : ambientType.includes("rotate")
            ? "rotate"
            : "pulse",
          responsive: true,
          responseTo: "overall",
          intensity: 0.5 + Math.random() * 0.5,
          opacity: 0.6 + Math.random() * 0.3,
        } as any,
      };

      return [...prev, newElement];
    });

    setSelectedElement(`ambient-${Date.now()}`);
  };

  const removeElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisualElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  return (
    <div className="absolute bottom-60 left-4 flex flex-col gap-2">
      <div className="relative group">
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          className="mb-2"
        >
          Add Element
        </Button>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-xl p-2 min-w-48 shadow-2xl z-50">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  "particle",
                  "shape",
                  "light",
                  "grid",
                  "wave",
                  "background",
                ] as const
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => addNewElement(type)}
                  className="text-xs p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 capitalize flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                  {type}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-600 pt-2">
              <div className="text-xs text-slate-400 px-2 pb-1 flex items-center gap-1">
                <Sparkles size={10} />
                Ambient Elements
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { type: "bouncing-ball", label: "Bouncing Ball", icon: "⚽" },
                  {
                    type: "floating-particle",
                    label: "Floating Particle",
                    icon: "✨",
                  },
                  { type: "flying-bird", label: "Flying Bird", icon: "🐦" },
                  { type: "floating-text", label: "Floating Text", icon: "📝" },
                  { type: "rotating-cube", label: "Rotating Cube", icon: "🎲" },
                  {
                    type: "pulsing-sphere",
                    label: "Pulsing Sphere",
                    icon: "🔴",
                  },
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addAmbientElement(type)}
                    className="text-xs p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 flex items-center gap-1"
                  >
                    <span className="text-xs">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto px-2 scrollbar-left">
        {visualElements.map((element) => (
          <div
            key={element.id}
            className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-xl transition-all cursor-pointer group ${
              selectedElement === element.id
                ? "bg-cyan-500/20 border-cyan-500/50 shadow-lg"
                : "bg-slate-800/90 border-slate-600 hover:bg-slate-700/90"
            } ${!element.visible ? "opacity-50" : ""}`}
            onClick={() => setSelectedElement(element.id)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  element.type === "ambient"
                    ? (element.customization as any).color
                    : (element.customization as any).color || "#ffffff",
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {element.name}
              </div>
              <div className="text-xs text-slate-400 capitalize flex items-center gap-1">
                {element.type === "ambient" && <Sparkles size={10} />}
                {element.type}
                {element.type === "ambient" && (
                  <span className="text-slate-500">
                    • {(element.customization as any).elementType}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                icon={<Settings size={12} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element.id);
                }}
                className="p-1 hover:bg-slate-600"
              />

              {!element.id.includes("background") && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={12} />}
                  onClick={(e) => removeElement(element.id, e)}
                  className="p-1 hover:bg-rose-500/20"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
