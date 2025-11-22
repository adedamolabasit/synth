import React, { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Palette,
  Zap,
  Image,
  Upload,
  Trash2,
  Move3D,
} from "lucide-react";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { Button } from "../../../components/ui/Button";
import { Slider } from "../../../components/ui/Slider";

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
  } = useVisualizer();

  const [isVisible, setIsVisible] = useState(false);
  const element = visualElements.find((el) => el.id === selectedElement);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setIsVisible(!!selectedElement);
  }, [selectedElement]);

  if (!element) return null;

  const getCustomizationFields = (): CustomizationField[] => {
    const baseFields: CustomizationField[] = [
      {
        key: "position",
        label: "Position",
        type: "position",
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "opacity",
        label: "Opacity",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: "responseTo",
        label: "Response To",
        type: "select",
        options: [
          { value: "bass", label: "Bass" },
          { value: "mid", label: "Mid Range" },
          { value: "treble", label: "Treble" },
          { value: "beat", label: "Beat" },
          { value: "overall", label: "Overall" },
        ],
      },
    ];

    if (element.type !== "background") {
      baseFields.splice(3, 0, {
        key: "intensity",
        label: "Intensity",
        type: "slider",
        min: 0,
        max: 2,
        step: 0.1,
      });
    }

    const typeSpecificFields: Record<string, CustomizationField[]> = {
      ambient: [
        {
          key: "size",
          label: "Size",
          type: "slider",
          min: 0.1,
          max: 3,
          step: 0.1,
        },
        {
          key: "speed",
          label: "Speed",
          type: "slider",
          min: 0.1,
          max: 3,
          step: 0.1,
        },
        {
          key: "amplitude",
          label: "Amplitude",
          type: "slider",
          min: 0.1,
          max: 5,
          step: 0.1,
        },
        {
          key: "texture",
          label: "Texture",
          type: "image",
        },
      ],
      particle: [
        {
          key: "particleCount",
          label: "Particle Count",
          type: "slider",
          min: 10,
          max: 500,
          step: 10,
        },
        {
          key: "particleSize",
          label: "Particle Size",
          type: "slider",
          min: 1,
          max: 20,
          step: 0.5,
        },
        {
          key: "movementSpeed",
          label: "Movement Speed",
          type: "slider",
          min: 0.1,
          max: 5,
          step: 0.1,
        },
        {
          key: "connectParticles",
          label: "Connect Particles",
          type: "checkbox",
        },
        {
          key: "particleTexture",
          label: "Particle Texture",
          type: "image",
        },
      ],
      light: [
        {
          key: "beamCount",
          label: "Beam Count",
          type: "slider",
          min: 1,
          max: 12,
          step: 1,
        },
        {
          key: "beamWidth",
          label: "Beam Width",
          type: "slider",
          min: 5,
          max: 45,
          step: 1,
        },
        {
          key: "rotationSpeed",
          label: "Rotation Speed",
          type: "slider",
          min: -2,
          max: 2,
          step: 0.1,
        },
      ],
      grid: [
        {
          key: "gridSize",
          label: "Grid Size",
          type: "slider",
          min: 5,
          max: 50,
          step: 1,
        },
        {
          key: "cellSpacing",
          label: "Cell Spacing",
          type: "slider",
          min: 10,
          max: 100,
          step: 5,
        },
        {
          key: "waveHeight",
          label: "Wave Height",
          type: "slider",
          min: 0,
          max: 100,
          step: 5,
        },
        {
          key: "gridTexture",
          label: "Grid Texture",
          type: "image",
        },
      ],
      background: [
        {
          key: "backgroundType",
          label: "Background Type",
          type: "select",
          options: [
            { value: "color", label: "Solid Color" },
            { value: "gradient", label: "Gradient" },
            { value: "image", label: "Image" },
          ],
        },
        { key: "color", label: "Color", type: "color" },
        {
          key: "image",
          label: "Background Image",
          type: "image",
        },
        {
          key: "imageScale",
          label: "Image Scale",
          type: "slider",
          min: 0.1,
          max: 3,
          step: 0.1,
        },
        {
          key: "imageOffsetX",
          label: "Image Offset X",
          type: "slider",
          min: -1,
          max: 1,
          step: 0.1,
        },
        {
          key: "imageOffsetY",
          label: "Image Offset Y",
          type: "slider",
          min: -1,
          max: 1,
          step: 0.1,
        },
      ],
      shape: [
        {
          key: "shapeType",
          label: "Shape Type",
          type: "select",
          options: [
            { value: "circle", label: "Circle" },
            { value: "square", label: "Square" },
            { value: "triangle", label: "Triangle" },
            { value: "star", label: "Star" },
            { value: "custom", label: "Custom Image" },
          ],
        },
        {
          key: "size",
          label: "Size",
          type: "slider",
          min: 10,
          max: 200,
          step: 5,
        },
        {
          key: "rotation",
          label: "Rotation",
          type: "slider",
          min: 0,
          max: 360,
          step: 1,
        },
        {
          key: "shapeImage",
          label: "Shape Image",
          type: "image",
        },
        {
          key: "imageScale",
          label: "Image Scale",
          type: "slider",
          min: 0.1,
          max: 3,
          step: 0.1,
        },
      ],
      wave: [
        {
          key: "waveCount",
          label: "Wave Count",
          type: "slider",
          min: 1,
          max: 10,
          step: 1,
        },
        {
          key: "waveThickness",
          label: "Wave Thickness",
          type: "slider",
          min: 1,
          max: 10,
          step: 0.5,
        },
        {
          key: "frequency",
          label: "Frequency",
          type: "slider",
          min: 0.1,
          max: 5,
          step: 0.1,
        },
        {
          key: "waveTexture",
          label: "Wave Texture",
          type: "image",
        },
      ],
    };

    return [...baseFields, ...(typeSpecificFields[element.type] || [])];
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    if (fieldKey === "position") {
      return;
    } else {
      updateElementCustomization(element.id, { [fieldKey]: value });
    }
  };

  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = [...element.position] as [number, number, number];
    const axisIndex = { x: 0, y: 1, z: 2 }[axis];
    newPosition[axisIndex] = value;

    updateElement(element.id, {
      ...element,
      position: newPosition,
    });
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    if (fieldKey === "image" && element.type === "background") {
      updateElementCustomization(element.id, {
        [fieldKey]: imageUrl,
        imageFile: file.name,
        backgroundType: "image",
      });
    } else {
      updateElementCustomization(element.id, {
        [fieldKey]: imageUrl,
        [`${fieldKey}File`]: file.name,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (fieldKey: string) => {
    const currentImage = (element.customization as any)[fieldKey];
    if (currentImage && currentImage.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage);
    }

    if (fieldKey === "image" && element.type === "background") {
      updateElementCustomization(element.id, {
        [fieldKey]: null,
        imageFile: null,
        backgroundType: "color",
      });
    } else {
      updateElementCustomization(element.id, {
        [fieldKey]: null,
        [`${fieldKey}File`]: null,
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

  const fields = getCustomizationFields();

  const positionAxes: PositionAxis[] = [
    { axis: "x", label: "X", min: -10, max: 10, step: 0.1 },
    { axis: "y", label: "Y", min: -10, max: 10, step: 0.1 },
    { axis: "z", label: "Z", min: -10, max: 10, step: 0.1 },
  ];

  const getValue = (fieldKey: string): any => {
    if (fieldKey === "position") {
      return element.position;
    }

    const value = (element.customization as any)[fieldKey];

    if (fieldKey === "backgroundType" && !value) {
      if ((element.customization as any).image) return "image";
      if ((element.customization as any).gradient) return "gradient";
      return "color";
    }

    const defaultValues: Record<string, any> = {
      color: "#000000",
      opacity: 1,
      intensity: 1,
      responseTo: "overall",
      imageScale: 1,
      imageOffsetX: 0,
      imageOffsetY: 0,
      size: 1,
      speed: 1,
      amplitude: 2,
      particleCount: 100,
      particleSize: 3,
      movementSpeed: 1,
      connectParticles: false,
      beamCount: 6,
      beamWidth: 15,
      rotationSpeed: 0.5,
      gridSize: 20,
      cellSpacing: 30,
      waveHeight: 30,
      shapeType: "circle",
      rotation: 0,
      waveCount: 3,
      waveThickness: 2,
      frequency: 1,
    };

    return value !== undefined && value !== null
      ? value
      : defaultValues[fieldKey];
  };

  const getSliderValue = (fieldKey: string): number => {
    const value = getValue(fieldKey);
    return typeof value === "number" ? value : 0;
  };

  const getColorValue = (fieldKey: string): string => {
    const value = getValue(fieldKey);
    return typeof value === "string" ? value : "#000000";
  };

  const getSelectValue = (fieldKey: string): string => {
    const value = getValue(fieldKey);
    return typeof value === "string" ? value : "";
  };

  const getCheckboxValue = (fieldKey: string): boolean => {
    const value = getValue(fieldKey);
    return typeof value === "boolean" ? value : false;
  };

  const getImageValue = (fieldKey: string): string | null => {
    const value = (element.customization as any)[fieldKey];
    return value || null;
  };

  const getImageFileName = (fieldKey: string): string => {
    const fileName = (element.customization as any)[`${fieldKey}File`];
    return fileName || "Uploaded image";
  };

  const shouldShowField = (field: CustomizationField): boolean => {
    if (element.type !== "background") return true;

    const backgroundType = getValue("backgroundType");

    switch (field.key) {
      case "color":
        return backgroundType === "color";
      case "image":
      case "imageScale":
      case "imageOffsetX":
      case "imageOffsetY":
        return backgroundType === "image";
      default:
        return true;
    }
  };

  const getImageFieldLabel = (fieldKey: string): string => {
    const labels: Record<string, string> = {
      image: "Background Image",
      texture: "Element Texture",
      particleTexture: "Particle Texture",
      gridTexture: "Grid Texture",
      shapeImage: "Shape Image",
      waveTexture: "Wave Texture",
    };

    return labels[fieldKey] || "Upload Image";
  };

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
        {fields.map(
          (field) =>
            shouldShowField(field) && (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.type === "slider" && (
                    <span className="text-xs text-slate-400">
                      {getValue(field.key)}
                    </span>
                  )}
                </label>

                {field.type === "slider" && (
                  <Slider
                    value={getSliderValue(field.key)}
                    onChange={(v) => handleFieldChange(field.key, v)}
                    min={field.min || 0}
                    max={field.max || 100}
                    step={field.step || 1}
                  />
                )}

                {field.type === "color" && (
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={getColorValue(field.key)}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.value)
                      }
                      className="w-full h-8 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                    />
                  </div>
                )}

                {field.type === "select" && (
                  <select
                    value={getSelectValue(field.key)}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === "checkbox" && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getCheckboxValue(field.key)}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.checked)
                      }
                      className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">Enabled</span>
                  </label>
                )}

                {field.type === "position" && (
                  <div className="space-y-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Move3D size={12} />
                      <span>3D Position</span>
                    </div>
                    <div className="space-y-2">
                      {positionAxes.map(({ axis, label, min, max, step }) => {
                        const axisIndex = { x: 0, y: 1, z: 2 }[axis];
                        const currentValue = element.position[axisIndex];

                        return (
                          <div key={axis} className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 w-6">
                              {label}
                            </span>
                            <Slider
                              value={currentValue}
                              onChange={(v) => handlePositionChange(axis, v)}
                              min={min}
                              max={max}
                              step={step}
                              className="flex-1"
                            />
                            <span className="text-xs text-slate-400 w-8 text-right">
                              {currentValue.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {field.type === "image" && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, field.key)}
                      className="hidden"
                      id={`file-input-${field.key}`}
                    />

                    {getImageValue(field.key) ? (
                      <div className="space-y-3">
                        <div className="relative aspect-video bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
                          <img
                            src={getImageValue(field.key)!}
                            alt={getImageFieldLabel(field.key)}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-slate-400 truncate flex-1 mr-2">
                            {getImageFileName(field.key)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            onClick={() => removeImage(field.key)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 p-2"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer">
                        <label
                          htmlFor={`file-input-${field.key}`}
                          className="flex flex-col items-center gap-2 cursor-pointer"
                        >
                          <Image size={24} className="text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-300 font-medium">
                              {getImageFieldLabel(field.key)}
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
                )}
              </div>
            )
        )}
      </div>

      {element.type !== "background" && (
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">
              Audio Response
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Current: {getValue("responseTo") || "overall"}</span>
              <span>Intensity: {(getValue("intensity") || 1).toFixed(1)}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                style={{
                  width: `${(getValue("intensity") || 1) * 50}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
