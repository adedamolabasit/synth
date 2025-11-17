import React from "react";
import { X, Eye, EyeOff, Palette, Zap, Image, Upload, Trash2 } from "lucide-react";
import { useVisualizer } from "../../../../../../app/provider/VisualizerContext";
import { Button } from "../../../../../ui/Button";
import { Slider } from "../../../../../ui/Slider";

interface CustomizationField {
  key: string;
  label: string;
  type: "color" | "slider" | "select" | "checkbox" | "image";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export const ElementCustomizationPanel: React.FC = () => {
  const {
    visualElements,
    selectedElement,
    setSelectedElement,
    updateElement,
    updateElementCustomization,
  } = useVisualizer();

  const element = visualElements.find((el) => el.id === selectedElement);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!element) return null;

  const getCustomizationFields = (): CustomizationField[] => {
    const baseFields: CustomizationField[] = [
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
      baseFields.splice(2, 0, {
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
        // ... existing ambient fields
      ],
      particle: [
        // ... existing particle fields
      ],
      light: [
        // ... existing light fields
      ],
      grid: [
        // ... existing grid fields
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
          ]
        },
        { key: "color", label: "Color", type: "color" },
        { key: "gradient", label: "Gradient", type: "checkbox" },
        { key: "gradientStart", label: "Gradient Start", type: "color" },
        { key: "gradientEnd", label: "Gradient End", type: "color" },
        { 
          key: "image", 
          label: "Background Image", 
          type: "image" 
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
        // ... existing shape fields
      ],
      wave: [
        // ... existing wave fields
      ],
    };

    return [...baseFields, ...(typeSpecificFields[element.type] || [])];
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    updateElementCustomization(element.id, { [fieldKey]: value });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Check file size (limit to 5MB)
    // if (file.size > 5 * 1024 * 1024) {
    //   alert('Please select an image smaller than 5MB');
    //   return;
    // }

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Update the background element with the image
    updateElementCustomization(element.id, { 
      image: imageUrl,
      imageFile: file.name,
      backgroundType: 'image'
    });

    console.log('Image uploaded:', file.name, imageUrl);

    // Clean up the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeBackgroundImage = () => {
    // Revoke the object URL to free memory
    const currentImage = (element.customization as any).image;
    if (currentImage && currentImage.startsWith('blob:')) {
      URL.revokeObjectURL(currentImage);
    }

    updateElementCustomization(element.id, { 
      image: null,
      imageFile: null,
      backgroundType: 'color'
    });
  };

  const toggleVisibility = () => {
    updateElement(element.id, { visible: !element.visible });
  };

  const fields = getCustomizationFields();

  const getValue = (fieldKey: string): any => {
    const value = (element.customization as any)[fieldKey];

    // Set default background type if not set
    if (fieldKey === "backgroundType" && !value) {
      if ((element.customization as any).image) return "image";
      if ((element.customization as any).gradient) return "gradient";
      return "color";
    }

    if (fieldKey === "color" && !value) return "#000000";
    if (fieldKey === "opacity" && value === undefined) return 1;
    if (fieldKey === "intensity" && value === undefined) return 1;
    if (fieldKey === "responseTo" && !value) return "overall";
    if (fieldKey === "imageScale" && value === undefined) return 1;
    if (fieldKey === "imageOffsetX" && value === undefined) return 0;
    if (fieldKey === "imageOffsetY" && value === undefined) return 0;

    return value;
  };

  const hslToHex = (hsl: string): string => {
    const matches = hsl.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
    if (!matches) return '#000000';
    
    const h = parseFloat(matches[1]) / 360;
    const s = parseFloat(matches[2]) / 100;
    const l = parseFloat(matches[3]) / 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getSliderValue = (fieldKey: string): number => {
    const value = getValue(fieldKey);
    return typeof value === "number" ? value : 0;
  };

  const getColorValue = (fieldKey: string): string => {
    const value = getValue(fieldKey);
    
    if (typeof value === "string" && value.startsWith('hsl')) {
      return hslToHex(value);
    }
    
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

  const shouldShowField = (field: CustomizationField): boolean => {
    if (element.type !== "background") return true;
    
    const backgroundType = getValue("backgroundType");
    
    // Show fields based on background type
    switch (field.key) {
      case "color":
        return backgroundType === "color";
      case "gradient":
      case "gradientStart":
      case "gradientEnd":
        return backgroundType === "gradient";
      case "image":
      case "imageScale":
      case "imageOffsetX":
      case "imageOffsetY":
        return backgroundType === "image";
      default:
        return true;
    }
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl z-50">
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
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={16} />}
            onClick={() => setSelectedElement(null)}
            className="p-2 hover:bg-slate-700"
          />
        </div>
      </div>

      {/* Customization Fields */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {fields.map((field) => (
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
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                  />
                </div>
              )}

              {field.type === "select" && (
                <select
                  value={getSelectValue(field.key)}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
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

              {field.type === "image" && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {getValue("image") ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
                        <img 
                          src={getValue("image")} 
                          alt="Background" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-400 truncate flex-1 mr-2">
                          {(element.customization as any).imageFile || "Uploaded image"}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={removeBackgroundImage}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 p-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer">
                      <div 
                        className="flex flex-col items-center gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image size={24} className="text-slate-400" />
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
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        ))}
      </div>

      {/* Audio Response Preview */}
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
              <span>Active</span>
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