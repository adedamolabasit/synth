import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { VisualizerProvider } from "./provider/VisualizerContext.tsx";
import { AudioProvider } from "./provider/AudioContext.tsx";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <VisualizerProvider>
        <AudioProvider>
          <App />
        </AudioProvider>
      </VisualizerProvider>
    </DynamicContextProvider>
  </StrictMode>
);
