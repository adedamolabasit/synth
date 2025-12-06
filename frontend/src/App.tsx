import { useState, useEffect } from "react";
import { Sidebar } from "./components/layouts/Sidebar";
import { StatusBar } from "./components/layouts/StatusBar";
import { WorkspaceLayout } from "./pages/dashboard/WorkspaceLayout";

function App() {
  const [activeView, setActiveView] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");

    if (view) {
      setActiveView(view);
    } else {
      setActiveView("workspace");
    }
  }, []);

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
        projectName="Synth Canvas"
        lastSaved={new Date(Date.now() - 120000)}
      />
    </div>
  );
}

export default App;
