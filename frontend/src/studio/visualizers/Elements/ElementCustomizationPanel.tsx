import React, { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Palette,
  Zap,
  Image,
  Trash2,
  Move3D,
} from "lucide-react";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { Button } from "../../../components/ui/Button";
import { Slider } from "../../../components/ui/Slider";
import { useToastContext } from "../../../components/ui/Toast.tsx/ToastProvider";

interface CustomizationField {
  key: string;
  label: string;
  type: "color" | "slider" | "select" | "checkbox" | "image" | "position";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

interface PositionAxis {
  axis: "x" | "y" | "z";
  label: string;
  min: number;
  max: number;
  step: number;
}

export const ElementCustomizationPanel: React.FC = () => {
  const {
    visualElements,
    selectedElement,
    setSelectedElement,
    updateElement,
    updateElementCustomization,
    setSceneBackground, // Make sure this exists in your context
    sceneBackground, // Add this to track current background
  } = useVisualizer();

  const [isVisible, setIsVisible] = useState(false);
  const element = visualElements.find((el) => el.id === selectedElement);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToastContext();

  React.useEffect(() => {
    setIsVisible(!!selectedElement);
  }, [selectedElement]);

  if (!element || element.type !== "background") return null;

  // const handleFieldChange = (fieldKey: string, value: any) => {
  //   // Update the element customization first
  //   updateElementCustomization(element.id, { [fieldKey]: value });
    
  //   // Then update the scene background immediately
  //   if (fieldKey === "color") {
  //     if (setSceneBackground) {
  //       setSceneBackground({
  //         type: "color",
  //         color: value,
  //       });
  //     }
  //   } else if (fieldKey === "backgroundType") {
  //     if (setSceneBackground) {
  //       const currentCustomization = element.customization as any;
  //       if (value === "color") {
  //         setSceneBackground({
  //           type: "color",
  //           color: currentCustomization.color || "#0a0a0a",
  //         });
  //       } else if (value === "image") {
  //         setSceneBackground({
  //           type: "image",
  //           image: currentCustomization.image,
  //           imageOpacity: currentCustomization.imageOpacity || 1,
  //         });
  //       } else if (value === "gradient") {
  //         setSceneBackground({
  //           type: "gradient",
  //           gradient: currentCustomization.gradient || {
  //             colors: ["#0a0a0a", "#1a1a2e", "#16213e"],
  //             type: "radial",
  //           },
  //         });
  //       }
  //     }
  //   }
  // };
const handleFieldChange = (fieldKey: string, value: any) => {
  // Update the element customization first
  updateElementCustomization(element.id, { [fieldKey]: value });
  
  // Get the updated customization
  const updatedCustomization = {
    ...customization,
    [fieldKey]: value,
  };

  // Update scene background based on background type
  if (setSceneBackground) {
    if (fieldKey === "backgroundType") {
      // When background type changes
      if (value === "color") {
        setSceneBackground({
          type: "color",
          color: updatedCustomization.color || "#0a0a0a",
        });
      } else if (value === "image") {
        setSceneBackground({
          type: "image",
          image: updatedCustomization.image,
          imageOpacity: updatedCustomization.imageOpacity || 1,
        });
      } else if (value === "gradient") {
        setSceneBackground({
          type: "gradient",
          gradient: updatedCustomization.gradient || {
            colors: ["#0a0a0a", "#1a1a2e", "#16213e"],
            type: "radial",
          },
        });
      }
    } else if (fieldKey === "color" && backgroundType === "color") {
      // When color changes for color background
      setSceneBackground({
        type: "color",
        color: value,
      });
    } else if (fieldKey === "image" && backgroundType === "image") {
      // When image changes
      setSceneBackground({
        type: "image",
        image: value,
        imageOpacity: updatedCustomization.imageOpacity || 1,
      });
    } else if (fieldKey === "gradient" && backgroundType === "gradient") {
      // When gradient changes
      setSceneBackground({
        type: "gradient",
        gradient: value,
      });
    } else if (fieldKey === "imageOpacity" && backgroundType === "image") {
      // When image opacity changes
      setSceneBackground({
        type: "image",
        image: updatedCustomization.image,
        imageOpacity: value,
      });
    }
  }
};

const handleGradientColorChange = (index: number, color: string) => {
  const newColors = [...(customization.gradient?.colors || ["#0a0a0a", "#1a1a2e", "#16213e"])];
  newColors[index] = color;
  const newGradient = {
    ...(customization.gradient || {}),
    colors: newColors,
  };
  
  updateElementCustomization(element.id, {
    gradient: newGradient,
  });
  
  if (setSceneBackground && backgroundType === "gradient") {
    setSceneBackground({
      type: "gradient",
      gradient: newGradient,
    });
  }
};

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      updateElementCustomization(element.id, {
        image: imageUrl,
        imageFile: file.name,
        backgroundType: "image",
      });
      
      // Update scene background immediately
      if (setSceneBackground) {
        setSceneBackground({
          type: "image",
          image: imageUrl,
          imageOpacity: 1,
        });
      }
    };
    
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (fieldKey: string) => {
    updateElementCustomization(element.id, {
      [fieldKey]: null,
      imageFile: null,
      backgroundType: "color",
    });
    
    // Reset to color background
    if (setSceneBackground) {
      setSceneBackground({
        type: "color",
        color: "#0a0a0a",
      });
    }
  };

  const toggleVisibility = () => {
    updateElement(element.id, {
      ...element,
      visible: !element.visible,
    });
  };

  const closePanel = () => {
    setSelectedElement(null);
    setIsVisible(false);
  };

  const customization = element.customization as any;
  const backgroundType = customization.backgroundType || "color";

  if (!isVisible) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 rounded-lg">
            <Palette size={16} className="text-slate-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{element.name}</h3>
            <p className="text-xs text-slate-400 capitalize">{element.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={element.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            onClick={toggleVisibility}
            className="p-2 hover:bg-slate-700"
            title={element.visible ? "Hide Element" : "Show Element"}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={16} />}
            onClick={closePanel}
            className="p-2 hover:bg-slate-700"
            title="Close Panel"
          />
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Background Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Background Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "color", label: "Color", icon: "🎨" },
              { value: "gradient", label: "Gradient", icon: "🌈" },
              { value: "image", label: "Image", icon: "🖼️" },
            ].map((option) => (
              <button
                key={option.value}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  backgroundType === option.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                }`}
                onClick={() => handleFieldChange("backgroundType", option.value)}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Background */}
        {backgroundType === "color" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.color || "#0a0a0a"}
                onChange={(e) => handleFieldChange("color", e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={customization.color || "#0a0a0a"}
                onChange={(e) => handleFieldChange("color", e.target.value)}
                className="w-32 h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white"
                placeholder="#000000"
              />
            </div>
          </div>
        )}

        {/* Image Background */}
        {backgroundType === "image" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Background Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "image")}
                className="hidden"
                id="background-image-input"
              />

              {customization.image ? (
                <div className="space-y-3">
                  <div className="relative aspect-video bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
                    <img
                      src={customization.image}
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-400 truncate flex-1 mr-2">
                      {customization.imageFile || "Uploaded image"}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => removeImage("image")}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 p-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer">
                  <label
                    htmlFor="background-image-input"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Image size={32} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-300 font-medium">
                        Upload Background Image
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click to browse or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports JPG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Image Opacity */}
            {customization.image && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                  <span>Image Opacity</span>
                  <span className="text-xs text-slate-400">
                    {customization.imageOpacity || 1}
                  </span>
                </label>
                <Slider
                  value={customization.imageOpacity || 1}
                  onChange={(v) => handleFieldChange("imageOpacity", v)}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            )}
          </div>
        )}

        {/* Gradient Background */}
{backgroundType === "gradient" && (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">
        Gradient Colors
      </label>
      <div className="grid grid-cols-3 gap-2">
        {(customization.gradient?.colors || ["#0a0a0a", "#1a1a2e", "#16213e"]).map(
          (color: string, index: number) => (
            <div key={index} className="space-y-1">
              <input
                type="color"
                value={color}
                onChange={(e) => handleGradientColorChange(index, e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-600 cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => handleGradientColorChange(index, e.target.value)}
                className="w-full text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
              />
            </div>
          )
        )}
      </div>
    </div>
    
    {/* Gradient Type Selector */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">
        Gradient Type
      </label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: "linear", label: "Linear", icon: "↔️" },
          { value: "radial", label: "Radial", icon: "⭕" },
        ].map((option) => (
          <button
            key={option.value}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
              (customization.gradient?.type || "radial") === option.value
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
            }`}
            onClick={() => {
              const newGradient = {
                ...(customization.gradient || {}),
                type: option.value,
              };
              updateElementCustomization(element.id, {
                gradient: newGradient,
              });
              if (setSceneBackground) {
                setSceneBackground({
                  type: "gradient",
                  gradient: newGradient,
                });
              }
            }}
          >
            <span>{option.icon}</span>
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
)}

        {/* Always show opacity slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
            <span>Opacity</span>
            <span className="text-xs text-slate-400">
              {customization.opacity || 1}
            </span>
          </label>
          <Slider
            value={customization.opacity || 1}
            onChange={(v) => handleFieldChange("opacity", v)}
            min={0}
            max={1}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
};