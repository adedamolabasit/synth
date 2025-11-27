import { Wallet } from "lucide-react";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";

interface WalletCardProps {
  walletAddress: string;
}

export function WalletCard({ walletAddress }: WalletCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="text-cyan-400" size={20} />
          <div>
            <p className="text-sm text-slate-400">Wallet Address</p>
            <p className="text-white font-mono text-sm">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          </div>
        </div>
        <Badge variant="success" size="sm">
          Connected
        </Badge>
      </div>
    </Card>
  );
}