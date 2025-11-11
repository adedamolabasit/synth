import { Upload, Music, Wand2, Loader2, FileAudio, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AudioFile {
  name: string;
  size: number;
  duration?: number;
  bpm?: number;
  key?: string;
}

interface AudioUploadPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  position?: 'left' | 'right';
}

export function AudioUploadPanel({ 
  isCollapsed = false, 
  onToggleCollapse, 
  position = 'left' 
}: AudioUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(f => f.type.startsWith('audio/'));

    if (audioFile) {
      simulateAnalysis(audioFile);
    }
  };

  const simulateAnalysis = (file: File) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAudioFile({
        name: file.name,
        size: file.size,
        duration: 234,
        bpm: 128,
        key: 'A minor',
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  // Collapsed state - just show a minimal button
  if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <Button
          variant="ghost"
          className="w-10 h-10 p-0 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-300 hover:scale-105"
          onClick={onToggleCollapse}
        >
          {position === 'left' ? (
            <ChevronRight className="text-cyan-400" size={20} />
          ) : (
            <ChevronLeft className="text-cyan-400" size={20} />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col gap-4 p-4 transition-all duration-300 ease-in-out animate-in slide-in-from-left"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header with collapse button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-slate-700/50 transition-all duration-200"
            onClick={onToggleCollapse}
          >
            {position === 'left' ? (
              <ChevronLeft className="text-slate-400" size={16} />
            ) : (
              <ChevronRight className="text-slate-400" size={16} />
            )}
          </Button>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music className="text-cyan-400" size={20} />
            Audio Input
          </h2>
        </div>
        <Button variant="secondary" size="sm" icon={<Wand2 size={16} />}>
          AI Generate
        </Button>
      </div>

      {!audioFile ? (
        <Card
          className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 animate-in fade-in-50 ${
            isDragging 
              ? 'border-cyan-500 bg-cyan-500/10 scale-[0.98] shadow-lg shadow-cyan-500/20' 
              : 'hover:scale-[0.995] hover:shadow-lg hover:shadow-cyan-500/10'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-50">
              <Loader2 className="text-cyan-400 animate-spin" size={48} />
              <p className="text-slate-300">Analyzing audio...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 hover:scale-105 hover:bg-slate-700/50">
                <Upload className="text-cyan-400 transition-transform duration-300 group-hover:scale-110" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 text-center animate-in slide-in-from-top-2">
                Drop your audio file
              </h3>
              <p className="text-slate-400 text-center mb-6 animate-in slide-in-from-top-4">
                Support for MP3, WAV, FLAC, OGG
                <br />
                <span className="text-sm">or use AI to generate music</span>
              </p>
              <Button variant="primary" className="animate-in fade-in-50">
                Browse Files
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="flex-1 flex flex-col gap-4 animate-in fade-in-50">
          <Card className="p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform duration-300 hover:scale-105">
                <FileAudio className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 transition-all duration-200">
                  {audioFile.name}
                </h3>
                <p className="text-sm text-slate-400 transition-all duration-200">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  {audioFile.duration && ` · ${Math.floor(audioFile.duration / 60)}:${(audioFile.duration % 60).toString().padStart(2, '0')}`}
                </p>
                <div className="flex gap-2 mt-3 animate-in slide-in-from-left-4">
                  {audioFile.bpm && (
                    <Badge variant="info" size="sm" className="transition-all duration-200 hover:scale-105">
                      {audioFile.bpm} BPM
                    </Badge>
                  )}
                  {audioFile.key && (
                    <Badge variant="default" size="sm" className="transition-all duration-200 hover:scale-105">
                      {audioFile.key}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Waveform</h4>
            <div className="h-24 bg-slate-900/50 rounded-lg flex items-center justify-center gap-1 px-2 transition-all duration-300 hover:bg-slate-800/50">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full opacity-70 transition-all duration-500 hover:opacity-100"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    animation: `pulse ${2 + i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
          </Card>

          <Button 
            variant="secondary" 
            className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Replace Audio
          </Button>
        </div>
      )}
    </div>
  );
}