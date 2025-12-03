import { Button } from "../../../ui/Button";
import { Lock } from "lucide-react";

interface VideoPlayerHeaderProps {
  activeTab: "all" | "your";
  onTabChange: (tab: "all" | "your") => void;
  isConnected: boolean;
}

export const VideoPlayerHeader: React.FC<VideoPlayerHeaderProps> = ({
  activeTab,
  onTabChange,
  isConnected
}) => {
  return (
    <div className="p-6 border-b border-slate-800/50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">synths</h2>

      </div>

      {activeTab === "your" && !isConnected && (
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="text-amber-400" size={20} />
            <div>
              <p className="text-amber-300 font-medium">Connect your wallet</p>
              <p className="text-amber-400/80 text-sm">
                Please connect your wallet to view your uploaded videos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};