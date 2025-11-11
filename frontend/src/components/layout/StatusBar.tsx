import { Wifi, Database, Cloud, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface StatusBarProps {
  ipConnected: boolean;
  projectName: string;
  lastSaved?: Date;
}

export function StatusBar({ ipConnected, projectName, lastSaved }: StatusBarProps) {
  return (
    <div className="h-10 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 px-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <span className="text-slate-400 font-medium">{projectName}</span>

        <div className="flex items-center gap-2">
          <Badge variant={ipConnected ? 'success' : 'error'} size="sm">
            <Database size={12} className="mr-1" />
            {ipConnected ? 'Story Protocol Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        {lastSaved && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span className="text-xs">Saved {formatTimeAgo(lastSaved)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Wifi size={14} className="text-emerald-400" />
        </div>

        <div className="flex items-center gap-1.5">
          <Cloud size={14} className="text-cyan-400" />
          <span className="text-xs">Synced</span>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
