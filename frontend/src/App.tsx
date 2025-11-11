import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';

function App() {
  const [activeView, setActiveView] = useState('workspace');

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <WorkspaceLayout activeView={activeView} />
      </div>
      <StatusBar
        ipConnected={true}
        projectName="Neon Dreams Project"
        lastSaved={new Date(Date.now() - 120000)}
      />
    </div>
  );
}

export default App;
