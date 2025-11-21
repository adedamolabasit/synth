import {
  Search,
  Star,
  Grid3x3,
  Waves,
  Box as BoxIcon,
  Sparkles,
  Rainbow,
  Atom,
  Orbit,
  Network as NetworkIcon,
  Dna,
  Flower,
  Flame,
  Shapes,
  Filter
} from "lucide-react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { useState } from "react";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { VisualizerParams } from "../../../shared/types/visualizer.types";

const typeIcons = {
  bars: Grid3x3,
  particles: Sparkles,
  waveform: Waves,
  "3d": BoxIcon,
  morphing: Sparkles,
  liquid: Waves,
  cyber: Grid3x3,
  geometric: BoxIcon,
  wave: Rainbow,
  // New ones
  fractal: Flower,
  quantum: Atom,
  biological: Dna,
  network: NetworkIcon,
  cosmic: Orbit,
  field: Shapes,
  "4d": Flame,
  warp: Waves,
  molecular: Atom,
  energy: Flame
};

type FilterType =
  | "all"
  | "bars"
  | "particles"
  | "waveform"
  | "3d"
  | "morphing"
  | "liquid"
  | "cyber"
  | "geometric";

export function VisualizerLibrary() {
  const {
    visualizers,
    setShowVisualizerLibrary,
    setCurrentVisualizer,
    currentVisualizer,
  } = useVisualizer();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<FilterType>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const onVisualizerSelect = (
    visualizerType: VisualizerParams["visualizerType"]
  ) => {
    setCurrentVisualizer(visualizerType);
    setShowVisualizerLibrary(false);
    // The visualizer will be recreated automatically via the useEffect that depends on params.visualizerType
  };

  const filteredVisualizers = visualizers.filter((viz) => {
    const matchesSearch = viz.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || viz.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleVisualizerClick = (visualizer: (typeof visualizers)[0]) => {
    onVisualizerSelect?.(visualizer.visualizerType);
  };

  const filterTypes: FilterType[] = [
    "all",
    "bars",
    "particles",
    "waveform",
    "3d",
    "morphing",
    "liquid",
    "cyber",
    "geometric",
  ];

  const getTypeLabel = (type: FilterType) => {
    const labels: Record<FilterType, string> = {
      all: "All",
      bars: "Bars",
      particles: "Particles",
      waveform: "Waveform",
      "3d": "3D",
      morphing: "Morphing",
      liquid: "Liquid",
      cyber: "Cyber",
      geometric: "Geometric",
    };
    return labels[type];
  };

  const getTypeIcon = (type: FilterType) => {
    if (type === "all") return Filter;
    return typeIcons[type] || Grid3x3;
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={20} />
          Template
        </h2>
        {currentVisualizer && (
          <Badge variant="success" size="sm">
            Active: {currentVisualizer.replace(/([A-Z])/g, " $1").trim()}
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search visualizers..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filter Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`
              h-10 px-3 rounded-lg border transition-all flex items-center justify-center
              ${
                selectedType !== "all"
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : "bg-slate-800/50 text-slate-400 border-slate-600 hover:text-slate-200 hover:bg-slate-800"
              }
            `}
          >
            <Filter size={16} />
            {selectedType !== "all" && (
              <span className="ml-2 text-xs font-medium">
                {getTypeLabel(selectedType)}
              </span>
            )}
          </button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="absolute top-12 right-0 z-10 bg-slate-800 border border-slate-600 rounded-lg shadow-lg py-2 min-w-[140px]">
              {filterTypes.map((type) => {
                const Icon = getTypeIcon(type);
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setShowFilterDropdown(false);
                    }}
                    className={`
                      w-full px-3 py-2 text-sm text-left transition-all flex items-center gap-2
                      ${
                        type === selectedType
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "text-slate-300 hover:bg-slate-700/50"
                      }
                    `}
                  >
                    <Icon size={14} />
                    {getTypeLabel(type)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Chips (Optional - for better UX) */}
     

      <div className="flex-1 overflow-y-auto mt-6 mx-2">
        {filteredVisualizers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <Search size={32} className="mb-2" />
            <p>No visualizers found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredVisualizers.map((viz) => {
              const Icon = typeIcons[viz.type];
              const isActive = currentVisualizer === viz.visualizerType;

              return (
                <Card
                  key={viz.id}
                  hover
                  glow={isActive ? "cyan" : "magenta"}
                  className={`p-3 cursor-pointer transition-all ${
                    isActive ? "ring-2 ring-cyan-500 bg-cyan-500/10" : ""
                  }`}
                  onClick={() => handleVisualizerClick(viz)}
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg mb-2 flex items-center justify-center text-3xl relative overflow-hidden group">
                    {viz.thumbnail}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* {viz.favorite && (
                      <Star
                        size={14}
                        className="absolute top-2 right-2 fill-amber-400 text-amber-400"
                      />
                    )} */}
                    {isActive && (
                      <div className="absolute top-2 left-2 bg-cyan-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        Active
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">
                    {viz.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="default" size="sm">
                      <Icon size={10} className="mr-1" />
                      {viz.type}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      {/* <Star
                        size={10}
                        className="fill-amber-400 text-amber-400"
                      /> */}
                      {/* {viz.rating} */}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-700/50">
        {filteredVisualizers.length} of {visualizers.length} visualizers
      </div>
    </div>
  );
}