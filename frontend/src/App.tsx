import { useState } from 'react';
import { Sidebar } from './layouts/Sidebar';
import { StatusBar } from './layouts/StatusBar';

import { WorkspaceLayout } from './pages/dashboard/WorkspaceLayout';

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
