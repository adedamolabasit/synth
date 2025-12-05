import React, { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Palette,
  Zap,
  Image,
  Trash2,
  Type,
  FileImage,
  Film,
  Smile,
  Layers,
  Sparkles,
  Settings,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Zap as Lightning,
  Frame,
} from "lucide-react";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { Button } from "../../../components/ui/Button";
import { Slider } from "../../../components/ui/Slider";
import { useToastContext } from "../../../components/common/Toast/ToastProvider";


export const ElementCustomizationPanel: React.FC = () => {
  const {
    visualElements,
    selectedElement,
    setSelectedElement,
    updateElement,
    updateElementCustomization,
    setSceneBackground,
  } = useVisualizer();

  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");
  const element = visualElements.find((el) => el.id === selectedElement);
  const gifInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = React.useRef<HTMLInputElement>(null); 
  const toast = useToastContext();

  React.useEffect(() => {
    setIsVisible(!!selectedElement);
  }, [selectedElement]);

  if (!element) return null;

const handleFieldChange = (fieldKey: string, value: any) => {
  updateElementCustomization(element.id, { [fieldKey]: value });
  
  if (element.type === "background") {
    const customization = element.customization as any;
    const updatedCustomization = { ...customization, [fieldKey]: value };
    const backgroundType = updatedCustomization.backgroundType || "color";

    if (setSceneBackground) {
      if (fieldKey === "backgroundType") {
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
        setSceneBackground({
          type: "color",
          color: value,
        });
      } else if (fieldKey === "image" && backgroundType === "image") {
        setSceneBackground({
          type: "image",
          image: value,
          imageOpacity: updatedCustomization.imageOpacity || 1,
        });
      } else if (fieldKey === "gradient" && backgroundType === "gradient") {
        setSceneBackground({
          type: "gradient",
          gradient: value,
        });
      } else if (fieldKey === "imageOpacity" && backgroundType === "image") {
        setSceneBackground({
          type: "image",
          image: updatedCustomization.image,
          imageOpacity: value,
        });
      }
      
      if (backgroundType === "image" && fieldKey.includes("image")) {
        setSceneBackground({
          type: "image",
          image: updatedCustomization.image,
          imageOpacity: updatedCustomization.imageOpacity || 1,
        });
      }
    }
  }
};

const handleFileUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  fieldKey: string,
  elementType: string
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  const validGifTypes = ["image/gif", "video/mp4", "video/webm"];

  if (elementType === "image" && !validImageTypes.includes(file.type)) {
    toast.error("Please select a valid image file (JPEG, PNG, GIF, WEBP, SVG)");
    return;
  }

  if (elementType === "gif" && !validGifTypes.includes(file.type)) {
    toast.error("Please select a valid GIF or video file (GIF, MP4, WEBM)");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error("Please select a file smaller than 10MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileUrl = e.target?.result as string;
    
    const updates: any = {
      [fieldKey]: fileUrl,
      [`${fieldKey}File`]: file.name,
    };

    if (elementType === "gif") {
      updates.gifUrl = fileUrl;
    } else if (elementType === "image") {
      updates.imageUrl = fileUrl;
    }

    if (element.type === "background" && elementType === "image") {
      updates.backgroundType = "image";
      
      if (setSceneBackground) {
        setSceneBackground({
          type: "image",
          image: fileUrl,
          imageOpacity: customization.imageOpacity || 1,
        });
      }
    }

    updateElementCustomization(element.id, updates);
    
    toast.success("File Uploaded", `${file.name} has been uploaded successfully`);
  };
  
  reader.readAsDataURL(file);

  if (elementType === "gif" && gifInputRef.current) {
    gifInputRef.current.value = "";
  } else if (elementType === "image") {
    if (element.type === "background" && backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = "";
    } else if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }
};

  const removeFile = (fieldKey: string) => {
    updateElementCustomization(element.id, {
      [fieldKey]: null,
      [`${fieldKey}File`]: null,
    });
    toast.info("File Removed", "File has been removed");
  };

  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = [...element.position] as [number, number, number];
    if (axis === "x") newPosition[0] = value;
    if (axis === "y") newPosition[1] = value;
    if (axis === "z") newPosition[2] = value;
    updateElement(element.id, { position: newPosition });
  };

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    const newRotation = [...element.rotation] as [number, number, number];
    if (axis === "x") newRotation[0] = value;
    if (axis === "y") newRotation[1] = value;
    if (axis === "z") newRotation[2] = value;
    updateElement(element.id, { rotation: newRotation });
  };

  const handleScaleChange = (axis: "x" | "y" | "z", value: number) => {
    const newScale = [...element.scale] as [number, number, number];
    if (axis === "x") newScale[0] = value;
    if (axis === "y") newScale[1] = value;
    if (axis === "z") newScale[2] = value;
    updateElement(element.id, { scale: newScale });
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

  const duplicateElement = () => {
    const newElement = {
      ...element,
      id: `${element.id}-copy-${Date.now()}`,
      name: `${element.name} (Copy)`,
      position: [
        element.position[0] + 1,
        element.position[1],
        element.position[2],
      ] as [number, number, number],
    };
    toast.info("Coming Soon", "Duplicate feature coming soon!");
  };
  

const handleGradientColorChange = (index: number, color: string) => {
  const newColors = [...(customization.gradient?.colors || ["#0a0a0a", "#1a1a2e", "#16213e"])];
  newColors[index] = color;
  const newGradient = {
    ...(customization.gradient || { type: "radial" }),
    colors: newColors,
  };
  
  handleFieldChange("gradient", newGradient);
};

  const customization = element.customization as any;

  if (!isVisible) return null;

  const renderElementSpecificControls = () => {
    switch (element.type) {
      case "text":
        return (
          <div className="space-y-4">
            {/* Text Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Text Content
              </label>
              <textarea
                value={customization.text || ""}
                onChange={(e) => handleFieldChange("text", e.target.value)}
                className="w-full h-24 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white resize-none"
                placeholder="Enter your text here..."
              />
            </div>

            {/* Font Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Font Size
                </label>
                <Slider
                  value={customization.fontSize || 16}
                  onChange={(v) => handleFieldChange("fontSize", v)}
                  min={8}
                  max={72}
                  step={1}
                />
                <div className="text-xs text-slate-400 text-center">
                  {customization.fontSize || 16}px
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Font Color
                </label>
                <input
                  type="color"
                  value={customization.color || "#ffffff"}
                  onChange={(e) => handleFieldChange("color", e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Font Family
              </label>
              <select
                value={customization.fontFamily || "Arial"}
                onChange={(e) =>
                  handleFieldChange("fontFamily", e.target.value)
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Impact">Impact</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Monospace">Monospace</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Text Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "left",
                    label: "Left",
                    icon: <AlignLeft size={16} />,
                  },
                  {
                    value: "center",
                    label: "Center",
                    icon: <AlignCenter size={16} />,
                  },
                  {
                    value: "right",
                    label: "Right",
                    icon: <AlignRight size={16} />,
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`p-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      (customization.textAlign || "center") === option.value
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                    }`}
                    onClick={() => handleFieldChange("textAlign", option.value)}
                  >
                    {option.icon}
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Effects */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Text Effects
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.shadow || false}
                    onChange={(e) =>
                      handleFieldChange("shadow", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Shadow</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.backgroundColor || false}
                    onChange={(e) =>
                      handleFieldChange(
                        "backgroundColor",
                        e.target.checked ? "#00000080" : undefined
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Background</span>
                </div>
              </div>
            </div>

            {/* Animation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Animation
              </label>
              <select
                value={customization.animationType || "none"}
                onChange={(e) =>
                  handleFieldChange("animationType", e.target.value)
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                <option value="none">No Animation</option>
                <option value="fade">Fade In/Out</option>
                <option value="slide">Slide In</option>
                <option value="typewriter">Typewriter</option>
                <option value="pulse">Pulse</option>
              </select>
            </div>
          </div>
        );

      case "image":
      case "gif":
        const isGif = element.type === "gif";
        const fileUrl = isGif ? customization.gifUrl : customization.imageUrl;
        const fileName = isGif
          ? customization.gifFile
          : customization.imageFile;
        const fileInputRef = isGif ? gifInputRef : imageInputRef;

        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {isGif ? "GIF/Video File" : "Image File"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept={isGif ? "image/gif,video/mp4,video/webm" : "image/*"}
                onChange={(e) =>
                  handleFileUpload(
                    e,
                    isGif ? "gifUrl" : "imageUrl",
                    element.type
                  )
                }
                className="hidden"
                id={`${element.type}-file-input`}
              />

              {fileUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-video bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
                    {isGif ? (
                      <video
                        src={fileUrl}
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={fileUrl}
                        alt="Uploaded content"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-400 truncate flex-1 mr-2">
                      {fileName || "Uploaded file"}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => removeFile(isGif ? "gifUrl" : "imageUrl")}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 p-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer">
                  <label
                    htmlFor={`${element.type}-file-input`}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    {isGif ? (
                      <Film size={32} className="text-slate-400" />
                    ) : (
                      <Image size={32} className="text-slate-400" />
                    )}
                    <div>
                      <p className="text-sm text-slate-300 font-medium">
                        Upload {isGif ? "GIF/Video" : "Image"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click to browse or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {isGif
                          ? "Supports GIF, MP4, WEBM (max 10MB)"
                          : "Supports JPG, PNG, GIF, WEBP, SVG (max 10MB)"}
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {isGif && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Play Speed
                  </label>
                  <Slider
                    value={customization.playSpeed || 1}
                    onChange={(v) => handleFieldChange("playSpeed", v)}
                    min={0.1}
                    max={3}
                    step={0.1}
                  />
                  <div className="text-xs text-slate-400 text-center">
                    {customization.playSpeed || 1}x
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Loop
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                    <input
                      type="checkbox"
                      checked={customization.loop !== false}
                      onChange={(e) =>
                        handleFieldChange("loop", e.target.checked)
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-slate-300">
                      Loop Animation
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Size</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Width</label>
                  <input
                    type="number"
                    value={customization.width || 100}
                    onChange={(e) =>
                      handleFieldChange("width", parseFloat(e.target.value))
                    }
                    className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white text-sm"
                    min={10}
                    max={1000}
                    step={10}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Height</label>
                  <input
                    type="number"
                    value={customization.height || 100}
                    onChange={(e) =>
                      handleFieldChange("height", parseFloat(e.target.value))
                    }
                    className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white text-sm"
                    min={10}
                    max={1000}
                    step={10}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                <input
                  type="checkbox"
                  checked={customization.keepAspectRatio !== false}
                  onChange={(e) =>
                    handleFieldChange("keepAspectRatio", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm text-slate-300">
                  Keep Aspect Ratio
                </span>
              </div>
            </div>

            {/* Effects */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Effects
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.border || false}
                    onChange={(e) =>
                      handleFieldChange("border", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Border</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.shadow || false}
                    onChange={(e) =>
                      handleFieldChange("shadow", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Shadow</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Animation
              </label>
              <select
                value={customization.animationType || "none"}
                onChange={(e) =>
                  handleFieldChange("animationType", e.target.value)
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                <option value="none">No Animation</option>
                <option value="fade">Fade In/Out</option>
                <option value="slide">Slide In</option>
                <option value="rotate">Rotate</option>
                <option value="scale">Scale</option>
                <option value="float">Float</option>
              </select>
            </div>
          </div>
        );

      case "icon":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Icon Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: "🌟", label: "Star" },
                  { type: "❤️", label: "Heart" },
                  { type: "🔥", label: "Fire" },
                  { type: "💎", label: "Gem" },
                  { type: "✨", label: "Sparkle" },
                  { type: "🎵", label: "Music" },
                  { type: "⚡", label: "Lightning" },
                  { type: "🌙", label: "Moon" },
                  { type: "☀️", label: "Sun" },
                  { type: "💫", label: "Comet" },
                  { type: "🎯", label: "Target" },
                  { type: "🌀", label: "Vortex" },
                ].map((icon) => (
                  <button
                    key={icon.type}
                    className={`p-3 rounded-lg border transition-all flex flex-col items-center ${
                      customization.iconType === icon.type
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                    }`}
                    onClick={() => handleFieldChange("iconType", icon.type)}
                  >
                    <span className="text-xl">{icon.type}</span>
                    <span className="text-xs mt-1">{icon.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Size
                </label>
                <Slider
                  value={customization.size || 32}
                  onChange={(v) => handleFieldChange("size", v)}
                  min={16}
                  max={128}
                  step={4}
                />
                <div className="text-xs text-slate-400 text-center">
                  {customization.size || 32}px
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Color
                </label>
                <input
                  type="color"
                  value={customization.color || "#ffffff"}
                  onChange={(e) => handleFieldChange("color", e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Rotation Speed
              </label>
              <Slider
                value={customization.rotationSpeed || 0}
                onChange={(v) => handleFieldChange("rotationSpeed", v)}
                min={0}
                max={5}
                step={0.1}
              />
              <div className="text-xs text-slate-400 text-center">
                {customization.rotationSpeed || 0}x
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Effects
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.hoverEffect || false}
                    onChange={(e) =>
                      handleFieldChange("hoverEffect", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Hover Effect</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.clickEffect || false}
                    onChange={(e) =>
                      handleFieldChange("clickEffect", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Click Effect</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "particleSystem":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Particle Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "circle", label: "Circle", icon: "●" },
                  { value: "square", label: "Square", icon: "■" },
                  { value: "star", label: "Star", icon: "★" },
                  { value: "sparkle", label: "Sparkle", icon: "✨" },
                  { value: "emoji", label: "Emoji", icon: "😊" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      customization.particleType === option.value
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                    }`}
                    onClick={() =>
                      handleFieldChange("particleType", option.value)
                    }
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Count</label>
                  <Slider
                    value={customization.count || 100}
                    onChange={(v) => handleFieldChange("count", v)}
                    min={10}
                    max={1000}
                    step={10}
                  />
                  <div className="text-xs text-slate-400 text-center">
                    {customization.count || 100}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Size</label>
                  <Slider
                    value={customization.size || 5}
                    onChange={(v) => handleFieldChange("size", v)}
                    min={1}
                    max={20}
                    step={1}
                  />
                  <div className="text-xs text-slate-400 text-center">
                    {customization.size || 5}px
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Speed</label>
                  <Slider
                    value={customization.speed || 1}
                    onChange={(v) => handleFieldChange("speed", v)}
                    min={0.1}
                    max={5}
                    step={0.1}
                  />
                  <div className="text-xs text-slate-400 text-center">
                    {customization.speed || 1}x
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Spread</label>
                  <Slider
                    value={customization.spread || 50}
                    onChange={(v) => handleFieldChange("spread", v)}
                    min={10}
                    max={200}
                    step={5}
                  />
                  <div className="text-xs text-slate-400 text-center">
                    {customization.spread || 50}px
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Gravity</label>
                  <Slider
                    value={customization.gravity || 0}
                    onChange={(v) => handleFieldChange("gravity", v)}
                    min={-2}
                    max={2}
                    step={0.1}
                  />
                  <div className="text-xs text-slate-400 text-center">
                    {customization.gravity || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Wind</label>
                  <Slider
                    value={customization.wind || 0}
                    onChange={(v) => handleFieldChange("wind", v)}
                    min={-1}
                    max={1}
                    step={0.1}
                  />
                  <div className="text-xs text-slate-400 text-center">
                    {customization.wind || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Effects */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Effects
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.trail || false}
                    onChange={(e) =>
                      handleFieldChange("trail", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Trail Effect</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.sizeVariation || false}
                    onChange={(e) =>
                      handleFieldChange(
                        "sizeVariation",
                        e.target.checked ? 0.5 : 0
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Size Variation</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "overlay":
        return (
          <div className="space-y-4">
            {/* Overlay Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Overlay Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "gradient", label: "Gradient", icon: "🌈" },
                  { value: "noise", label: "Noise", icon: "📺" },
                  { value: "grid", label: "Grid", icon: "⬛" },
                  { value: "vignette", label: "Vignette", icon: "⭕" },
                  { value: "scanlines", label: "Scanlines", icon: "📡" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      customization.overlayType === option.value
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                    }`}
                    onClick={() =>
                      handleFieldChange("overlayType", option.value)
                    }
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Intensity
                </label>
                <Slider
                  value={customization.intensity || 0.5}
                  onChange={(v) => handleFieldChange("intensity", v)}
                  min={0}
                  max={1}
                  step={0.1}
                />
                <div className="text-xs text-slate-400 text-center">
                  {customization.intensity || 0.5}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Opacity
                </label>
                <Slider
                  value={customization.opacity || 0.3}
                  onChange={(v) => handleFieldChange("opacity", v)}
                  min={0}
                  max={1}
                  step={0.1}
                />
                <div className="text-xs text-slate-400 text-center">
                  {customization.opacity || 0.3}
                </div>
              </div>
            </div>

            {/* Blend Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Blend Mode
              </label>
              <select
                value={customization.blendMode || "normal"}
                onChange={(e) => handleFieldChange("blendMode", e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                <option value="normal">Normal</option>
                <option value="add">Add</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
            </div>
          </div>
        );

      case "frame":
        return (
          <div className="space-y-4">
            {/* Frame Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Frame Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "none", label: "None", icon: "🚫" },
                  { value: "simple", label: "Simple", icon: "⎯" },
                  { value: "ornate", label: "Ornate", icon: "🖼️" },
                  { value: "modern", label: "Modern", icon: "◼️" },
                  { value: "retro", label: "Retro", icon: "📺" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      customization.frameStyle === option.value
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                    }`}
                    onClick={() =>
                      handleFieldChange("frameStyle", option.value)
                    }
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Thickness
                </label>
                <Slider
                  value={customization.thickness || 10}
                  onChange={(v) => handleFieldChange("thickness", v)}
                  min={1}
                  max={50}
                  step={1}
                />
                <div className="text-xs text-slate-400 text-center">
                  {customization.thickness || 10}px
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Color
                </label>
                <input
                  type="color"
                  value={customization.color || "#ffffff"}
                  onChange={(e) => handleFieldChange("color", e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Frame Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Options
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.inset || false}
                    onChange={(e) =>
                      handleFieldChange("inset", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Inset Frame</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.shadow || false}
                    onChange={(e) =>
                      handleFieldChange("shadow", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Shadow</span>
                </div>
              </div>
            </div>
          </div>
        );

      // In ElementCustomizationPanel.tsx, update the renderElementSpecificControls function:
      // Add a case for "background" type:

     case "background":
  const backgroundType = customization.backgroundType || "color";
  
  return (
    <div className="space-y-4">
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
              ref={backgroundImageInputRef} // Use the specific ref for background
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "image", "image")}
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
                    onClick={() => removeFile("image")}
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
                    handleFieldChange("gradient", newGradient);
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
    </div>
  );
      default:
        // Handle other element types (background, ambient, etc.)
        // Your existing code for other element types...
        return null;
    }
  };

  const renderPositionControls = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">Position</h4>
        {["x", "y", "z"].map((axis) => (
          <div key={axis} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 uppercase">
                {axis} Axis
              </label>
              <span className="text-xs text-slate-400">
                {element.position[axis === "x" ? 0 : axis === "y" ? 1 : 2]}
              </span>
            </div>
            <Slider
              value={element.position[axis === "x" ? 0 : axis === "y" ? 1 : 2]}
              onChange={(v) => handlePositionChange(axis as "x" | "y" | "z", v)}
              min={-50}
              max={50}
              step={0.1}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">Rotation</h4>
        {["x", "y", "z"].map((axis) => (
          <div key={axis} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 uppercase">
                {axis} Rotation
              </label>
              <span className="text-xs text-slate-400">
                {element.rotation[axis === "x" ? 0 : axis === "y" ? 1 : 2]}°
              </span>
            </div>
            <Slider
              value={element.rotation[axis === "x" ? 0 : axis === "y" ? 1 : 2]}
              onChange={(v) => handleRotationChange(axis as "x" | "y" | "z", v)}
              min={-180}
              max={180}
              step={1}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">Scale</h4>
        {["x", "y", "z"].map((axis) => (
          <div key={axis} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 uppercase">
                {axis} Scale
              </label>
              <span className="text-xs text-slate-400">
                {element.scale[axis === "x" ? 0 : axis === "y" ? 1 : 2]}x
              </span>
            </div>
            <Slider
              value={element.scale[axis === "x" ? 0 : axis === "y" ? 1 : 2]}
              onChange={(v) => handleScaleChange(axis as "x" | "y" | "z", v)}
              min={0.1}
              max={5}
              step={0.1}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const getElementIcon = () => {
    switch (element.type) {
      case "text":
        return <Type size={16} className="text-slate-300" />;
      case "image":
        return <FileImage size={16} className="text-slate-300" />;
      case "gif":
        return <Film size={16} className="text-slate-300" />;
      case "icon":
        return <Smile size={16} className="text-slate-300" />;
      case "overlay":
        return <Layers size={16} className="text-slate-300" />;
      case "frame":
        return <Frame size={16} className="text-slate-300" />;
      case "particleSystem":
        return <Sparkles size={16} className="text-slate-300" />;
      case "background":
        return <Palette size={16} className="text-slate-300" />;
      case "ambient":
        return <Zap size={16} className="text-slate-300" />;
      default:
        return <Settings size={16} className="text-slate-300" />;
    }
  };

  return (
    <div className="absolute top-4 right-4 w-96 bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 rounded-lg">{getElementIcon()}</div>
          <div>
            <h3 className="font-semibold text-white">{element.name}</h3>
            <p className="text-xs text-slate-400 capitalize">{element.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Copy size={14} />}
            onClick={duplicateElement}
            className="p-2 hover:bg-slate-700"
            title="Duplicate Element"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            onClick={toggleVisibility}
            className="p-2 hover:bg-slate-700"
            title={element.visible ? "Hide Element" : "Show Element"}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={14} />}
            onClick={closePanel}
            className="p-2 hover:bg-slate-700"
            title="Close Panel"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 px-4">
        <button
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "properties"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
          onClick={() => setActiveTab("properties")}
        >
          Properties
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "transform"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
          onClick={() => setActiveTab("transform")}
        >
          Transform
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "effects"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
          onClick={() => setActiveTab("effects")}
        >
          Effects
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {activeTab === "properties" && renderElementSpecificControls()}
        {activeTab === "transform" && renderPositionControls()}
        {activeTab === "effects" && (
          <div className="space-y-4">
            {/* Opacity */}
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

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.color || "#ffffff"}
                  onChange={(e) => handleFieldChange("color", e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.color || "#ffffff"}
                  onChange={(e) => handleFieldChange("color", e.target.value)}
                  className="w-32 h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Intensity */}
            {customization.intensity !== undefined && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                  <span>Intensity</span>
                  <span className="text-xs text-slate-400">
                    {customization.intensity || 1}
                  </span>
                </label>
                <Slider
                  value={customization.intensity || 1}
                  onChange={(v) => handleFieldChange("intensity", v)}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>
            )}

            {/* Audio Response */}
            {customization.responsive !== undefined && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Audio Response
                </label>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-600 bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={customization.responsive || false}
                    onChange={(e) =>
                      handleFieldChange("responsive", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">
                    Respond to Audio
                  </span>
                </div>
                {customization.responsive && (
                  <select
                    value={customization.responseTo || "overall"}
                    onChange={(e) =>
                      handleFieldChange("responseTo", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white text-sm"
                  >
                    <option value="bass">Bass</option>
                    <option value="mid">Mid</option>
                    <option value="treble">Treble</option>
                    <option value="beat">Beat</option>
                    <option value="overall">Overall</option>
                  </select>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
