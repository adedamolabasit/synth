import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { VisualizerProvider } from "./app/provider/VisualizerContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VisualizerProvider>
      <App />
    </VisualizerProvider>
  </StrictMode>
);
