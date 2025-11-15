import { useState, useEffect } from 'react';
import { AudioUploadPanel } from './AudioUploadPanel';
import { VisualizerLibrary } from './VisualizerLibrary';
import { LivePreviewCanvas } from './LivePreviewCanvas';
import { IPManagementDashboard } from './IPManagementDashboard';
import { ExportPanel } from './ExportPanel';


interface WorkspaceLayoutProps {
  activeView: string;
}

export function WorkspaceLayout({ activeView }: WorkspaceLayoutProps) {
  // const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(330);
  const [isMobile, setIsMobile] = useState(false);

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);


  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle single panel views
  if (activeView === 'audio') {
    return (
      <div className="flex-1 overflow-hidden bg-slate-900">
        <AudioUploadPanel />
      </div>
    );
  }

  if (activeView === 'visualizers') {
    return (
      <div className="flex-1 overflow-hidden bg-slate-900">
        <VisualizerLibrary />
      </div>
    );
  }

  if (activeView === 'ip') {
    return (
      <div className="flex-1 overflow-hidden bg-slate-900">
        <IPManagementDashboard />
      </div>
    );
  }

  if (activeView === 'export') {
    return (
      <div className="flex-1 overflow-hidden bg-slate-900">
        <ExportPanel />
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Settings panel coming soon</p>
      </div>
    );
  }

  // Mobile layout - stacked vertically
  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        {/* Collapsible panels with tabs */}
        <div className="flex border-b border-slate-700">
          <button
            className="flex-1 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 border-r border-slate-700"
            // onClick={() => setLeftPanelWidth(leftPanelWidth > 0 ? 0 : 320)}
          >
            Audio
          </button>
          <button
            className="flex-1 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            onClick={() => setRightPanelWidth(rightPanelWidth > 0 ? 0 : 320)}
          >
            Visualizers
          </button>
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Audio panel */}
          {/* {leftPanelWidth > 0 && (
            <div className="border-b border-slate-700" style={{ height: '40vh' }}>
              <AudioUploadPanel />
            </div>
          )} */}
          
          {/* Main preview area */}
          <div className="flex-1 min-h-[200px]">
            <LivePreviewCanvas />
          </div>
          
          {/* Visualizers panel */}
          {rightPanelWidth > 0 && (
            <div className="border-t border-slate-700" style={{ height: '40vh' }}>
              <VisualizerLibrary />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout - side by side with resizable panels
 return (
    <div className="flex-1 flex overflow-hidden bg-slate-900">
      {/* Left Panel */}
      {/* <div
        className={`bg-slate-900/80 border-r border-slate-700/50 overflow-y-auto transition-all duration-300 ease-in-out ${
          isLeftCollapsed ? 'w-16' : ''
        }`}
        style={{ 
          width: isLeftCollapsed ? '64px' : `${leftPanelWidth}px`,
          minWidth: isLeftCollapsed ? '64px' : '280px',
          maxWidth: isLeftCollapsed ? '64px' : 'calc(100vw - 400px)'
        }}
      >
        <AudioUploadPanel 
          isCollapsed={isLeftCollapsed}
          onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
          position="left"
        />
      </div> */}

      {/* Resize Handle (only show when not collapsed) */}
      {!isLeftCollapsed && (
        <div
          className="w-1 bg-slate-700/30 hover:bg-blue-500/50 cursor-col-resize transition-colors duration-200"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            // const startWidth = leftPanelWidth;
            
            // const handleMouseMove = (moveEvent: MouseEvent) => {
            //   const delta = moveEvent.clientX - startX;
            //   const newWidth = Math.max(280, Math.min(600, startWidth + delta));
            //   setLeftPanelWidth(newWidth);
            // };
            
            const handleMouseUp = () => {
              // document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            // document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative">
          <LivePreviewCanvas />
        </div>
      </div>

      {/* Resize Handle (only show when not collapsed) */}
      {!isRightCollapsed && (
        <div
          className="w-1 bg-slate-700/30 hover:bg-blue-500/50 cursor-col-resize transition-colors duration-200"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = rightPanelWidth;
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const delta = startX - moveEvent.clientX;
              const newWidth = Math.max(280, Math.min(600, startWidth + delta));
              setRightPanelWidth(newWidth);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}

      {/* Right Panel */}
      <div
        className={`bg-slate-900/80 border-l border-slate-700/50 overflow-y-auto transition-all duration-300 ease-in-out ${
          isRightCollapsed ? 'w-16' : ''
        }`}
        style={{ 
          width: isRightCollapsed ? '64px' : `${rightPanelWidth}px`,
          minWidth: isRightCollapsed ? '64px' : '280px',
          maxWidth: isRightCollapsed ? '64px' : 'calc(100vw - 400px)'
        }}
      >
        <VisualizerLibrary 
          // // isCollapsed={isRightCollapsed}
          // onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
          // position="right"
        />
      </div>
    </div>
  );
}