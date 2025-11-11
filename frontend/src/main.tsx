import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { VisualizerProvider } from "./components/contexts/VisualizerContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VisualizerProvider>
      <App />
    </VisualizerProvider>
  </StrictMode>
);
