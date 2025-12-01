import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { VisualizerProvider } from "./provider/VisualizerContext.tsx";
import { AudioProvider } from "./provider/AudioContext.tsx";
import { IpProvider } from "./provider/IpContext.tsx";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { WagmiProvider, createConfig } from "wagmi";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { aeneid } from "@story-protocol/core-sdk";
import { http } from "viem";

export const config = createConfig({
  chains: [aeneid],
  multiInjectedProviderDiscovery: false,
  transports: {
    [aeneid.id]: http(),
  },
});

export const queryClient = new QueryClient();


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <VisualizerProvider>
              <AudioProvider>
                <IpProvider>
                  <App />
                </IpProvider>
              </AudioProvider>
            </VisualizerProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  </StrictMode>
);
