import { Database } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface StatusBarProps {
  ipConnected: boolean;
  projectName: string;
  lastSaved?: Date;
}

export function StatusBar({ ipConnected }: StatusBarProps) {
  const { user, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const isConnected = !!user;

  const handleClick = () => {
    if (!isConnected) {
      setShowAuthFlow(true);
    } else {
      handleLogOut();
    }
  };

  return (
    <div className="py-2 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 px-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4 ml-24">
        <button
          onClick={handleClick}
          className="px-3 py-1 rounded-lg bg-cyan-400 text-black font-semibold flex items-center gap-2"
        >
          {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
        </button>
      </div>

      <Badge variant={ipConnected ? "success" : "error"} size="sm">
        <Database size={12} className="mr-1" />
        {isConnected ? "Story Protocol Connected" : "Not connected"}
      </Badge>
    </div>
  );
}
