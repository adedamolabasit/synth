import { Download, FileVideo, Shield, Share2, Settings as SettingsIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function ExportPanel() {
  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Download className="text-cyan-400" size={20} />
          Export & License
        </h2>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <FileVideo size={16} className="text-blue-400" />
          Video Settings
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {['1080p', '4K', '8K'].map((res) => (
                <button
                  key={res}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${res === '1080p'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }
                  `}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Frame Rate</label>
            <div className="grid grid-cols-4 gap-2">
              {['24fps', '30fps', '60fps', '120fps'].map((fps) => (
                <button
                  key={fps}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${fps === '60fps'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }
                  `}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {['MP4', 'MOV', 'WebM'].map((format) => (
                <button
                  key={format}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${format === 'MP4'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }
                  `}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Shield size={16} className="text-emerald-400" />
          License Configuration
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">License Type</label>
            <select className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              <option>Commercial Use - Full Rights</option>
              <option>Personal Use Only</option>
              <option>Attribution Required</option>
              <option>Non-Commercial</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Revenue Split</label>
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Audio Creator</span>
                <Badge variant="info" size="sm">60%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Visual Creator</span>
                <Badge variant="info" size="sm">40%</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-cyan-500/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="text-cyan-400" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">Story Protocol Registration</h4>
            <p className="text-sm text-slate-300 mb-3">
              Register this composition as an IP Asset on Story Protocol to enable transparent licensing and royalty distribution.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">Audio Registered</Badge>
              <Badge variant="success" size="sm">Visual Registered</Badge>
              <Badge variant="warning" size="sm">Composition Pending</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" icon={<Share2 size={16} />}>
          Generate Share Link
        </Button>
        <Button variant="primary" className="flex-1" icon={<Download size={16} />}>
          Export & Register
        </Button>
      </div>
    </div>
  );
}
