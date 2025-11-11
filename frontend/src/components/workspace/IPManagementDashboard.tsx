import { Box, Link as LinkIcon, Users, DollarSign, Shield, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface IPAsset {
  id: string;
  name: string;
  type: 'audio' | 'visual' | 'composition';
  status: 'registered' | 'pending' | 'draft';
  royaltySplit: number;
  collaborators: number;
}

const assets: IPAsset[] = [
  { id: '1', name: 'Audio Track - Neon Dreams', type: 'audio', status: 'registered', royaltySplit: 60, collaborators: 1 },
  { id: '2', name: 'Visualizer - Particle Flow', type: 'visual', status: 'registered', royaltySplit: 40, collaborators: 0 },
  { id: '3', name: 'Full Composition', type: 'composition', status: 'pending', royaltySplit: 100, collaborators: 1 },
];

export function IPManagementDashboard() {
  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Box className="text-blue-400" size={20} />
          IP Assets
        </h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />}>
          Register New Asset
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Assets</span>
            <Shield className="text-blue-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{assets.length}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Registered</span>
            <Box className="text-emerald-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">
            {assets.filter(a => a.status === 'registered').length}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Collaborators</span>
            <Users className="text-magenta-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">
            {assets.reduce((sum, a) => sum + a.collaborators, 0)}
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <LinkIcon size={16} className="text-cyan-400" />
          Asset Relationships
        </h3>
        <div className="relative h-48 bg-slate-900/50 rounded-lg flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <circle cx="200" cy="100" r="30" fill="url(#grad1)" />
            <circle cx="100" cy="60" r="25" fill="url(#grad2)" />
            <circle cx="100" cy="140" r="25" fill="url(#grad3)" />

            <line x1="170" y1="100" x2="125" y2="70" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4" />
            <line x1="170" y1="100" x2="125" y2="130" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4" />

            <defs>
              <linearGradient id="grad1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="grad2">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="grad3">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            <text x="200" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
              Composition
            </text>
            <text x="100" y="65" textAnchor="middle" fill="white" fontSize="9">
              Audio
            </text>
            <text x="100" y="145" textAnchor="middle" fill="white" fontSize="9">
              Visual
            </text>
          </svg>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Assets</h3>
        {assets.map((asset) => (
          <Card key={asset.id} hover className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white">{asset.name}</h4>
                  <Badge
                    variant={
                      asset.status === 'registered' ? 'success' :
                      asset.status === 'pending' ? 'warning' : 'default'
                    }
                    size="sm"
                  >
                    {asset.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} />
                    {asset.royaltySplit}% split
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {asset.collaborators} collaborator{asset.collaborators !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
