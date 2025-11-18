import { useState, useEffect } from "react";
import { AudioUploadPanel } from "../../components/dashboard/audio/AudioUploadPanel";
import { VisualizerLibrary } from "../../components/dashboard/workspace/VisualizerLibrary";
import { LivePreviewCanvas } from "../../components/dashboard/workspace/LivePreviewCanvas";
import { IPManagementDashboard } from "../../components/dashboard/ipAssets/IPManagementDashboard";
import { ExportPanel } from "../../components/dashboard/exports/ExportPanel";


interface WorkspaceLayoutProps {
  activeView: string;
}

export function WorkspaceLayout({ activeView }: WorkspaceLayoutProps) {
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);

  if (activeView === 'audio') {
    return (
      <div className="flex-1 overflow-hidden">
        <AudioUploadPanel />
      </div>
    );
  }

  if (activeView === 'visualizers') {
    return (
      <div className="flex-1 overflow-hidden">
        <VisualizerLibrary />
      </div>
    );
  }

  if (activeView === 'ip') {
    return (
      <div className="flex-1 overflow-hidden">
        <IPManagementDashboard />
      </div>
    );
  }

  if (activeView === 'export') {
    return (
      <div className="flex-1 overflow-hidden">
        <ExportPanel />
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Settings panel coming soon</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div
        className="bg-slate-900/50 border-r border-slate-800/50 overflow-y-auto"
        style={{ width: `${leftPanelWidth}px` }}
      >
        <AudioUploadPanel />
      </div>

      <div className="flex-1 flex flex-col">
        <LivePreviewCanvas />
      </div>

      <div
        className="bg-slate-900/50 border-l border-slate-800/50 overflow-y-auto"
        style={{ width: `${rightPanelWidth}px` }}
      >
        <VisualizerLibrary />
      </div>
    </div>
  );
}
