import { useState, useEffect } from "react";
import { Sidebar } from "./layouts/Sidebar";
import { StatusBar } from "./layouts/StatusBar";
import { WorkspaceLayout } from "./pages/dashboard/WorkspaceLayout";

function App() {
  const [activeView, setActiveView] = useState("");

  // Load view from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");

    if (view) {
      setActiveView(view);
    } else {
      // default view
      setActiveView("workspace");
    }
  }, []);

  // Sync and update both state + URL
  const updateActiveView = (view: string) => {
    setActiveView(view);

    const params = new URLSearchParams(window.location.search);
    params.set("view", view);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={updateActiveView} />
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
