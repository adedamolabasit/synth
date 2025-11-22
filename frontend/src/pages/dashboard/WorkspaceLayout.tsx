import { useState, useEffect } from "react";
import { AudioUploadPanel } from "../../components/dashboard/audio/AudioUploadPanel";
import { VisualizerLibrary } from "../../components/dashboard/workspace/VisualizerLibrary";
import { LivePreviewCanvas } from "../../components/dashboard/workspace/LivePreviewCanvas";
import { IPManagementDashboard } from "../../components/dashboard/ipAssets/IPManagementDashboard";
import { ExportPanel } from "../../components/dashboard/exports/ExportPanel";
import { VideoGallery } from "../../components/dashboard/video/VideoGallery";

interface WorkspaceLayoutProps {
  activeView: string;
}

export function WorkspaceLayout({ activeView }: WorkspaceLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (activeView === "audio") {
    return (
      <div className="flex-1 overflow-hidden">
        <AudioUploadPanel />
      </div>
    );
  }

  if (activeView === "media") {
    return (
      <div className="flex-1 overflow-hidden">
        <VideoGallery />
      </div>
    );
  }

  if (activeView === "ip") {
    return (
      <div className="flex-1 overflow-hidden">
        <IPManagementDashboard />
      </div>
    );
  }

  if (activeView === "import") {
    return (
      <div className="flex-1 overflow-hidden">
        <ExportPanel />
      </div>
    );
  }

  if (activeView === "settings") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Settings panel coming soon</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {!isMobile && (
        <div
          className="
            bg-slate-900/50 
            border-r border-slate-800/50 
            overflow-y-auto
            hidden md:block
          "
          style={{ width: `320px` }}
        >
          <AudioUploadPanel />
        </div>
      )}

      <div className="flex-1 flex flex-col bg-slate-950/40 overflow-hidden">
        <LivePreviewCanvas />
      </div>

      {!isMobile && (
        <div
          className="
            bg-slate-900/50 
            border-l border-slate-800/50 
            overflow-y-auto
            hidden md:block
          "
          style={{ width: `320px` }}
        >
          <VisualizerLibrary />
        </div>
      )}
    </div>
  );
}
