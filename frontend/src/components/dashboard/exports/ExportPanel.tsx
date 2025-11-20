import { Download, FileVideo, Shield, Share2, Upload, X } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useState, useRef } from 'react';

export function ExportPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; videoUrl?: string; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'video/mp4',
        'video/mpeg',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/webm'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadResult({
          success: false,
          error: 'Invalid file type. Please upload MP4, MPEG, AVI, MOV, WMV, or WebM files.'
        });
        return;
      }

      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setUploadResult({
          success: false,
          error: 'File too large. Maximum size is 100MB.'
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      // Simulate progress for demo (replace with actual progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:8000/api/video/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadResult({
          success: true,
          videoUrl: result.videoUrl
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadResult({
          success: false,
          error: result.error || 'Upload failed'
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: 'Network error. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Download className="text-cyan-400" size={20} />
          Export & License
        </h2>
      </div>

      {/* Video Upload Card */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <FileVideo size={16} className="text-blue-400" />
          Video Upload
        </h3>

        <div className="space-y-4">
          {/* File Upload Area */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/mp4,video/mpeg,video/avi,video/mov,video/wmv,video/webm"
                className="hidden"
              />
              <FileVideo className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-slate-300 text-sm mb-2">
                Drag and drop your video file here, or click to browse
              </p>
              <p className="text-slate-500 text-xs">
                Supported formats: MP4, MPEG, AVI, MOV, WMV, WebM • Max 100MB
              </p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload size={16} />}
              >
                Select Video File
              </Button>
            </div>
          ) : (
            /* Selected File Preview */
            <div className="border border-slate-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileVideo className="text-cyan-400" size={20} />
                  <div>
                    <p className="text-slate-200 text-sm font-medium truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  icon={<X size={16} />}
                >
                  Remove
                </Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Upload Button */}
              {!isUploading && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleUpload}
                  icon={<Upload size={16} />}
                >
                  Upload Video
                </Button>
              )}
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`p-3 rounded-lg text-sm ${
              uploadResult.success 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {uploadResult.success ? (
                <div>
                  <p className="font-medium">Upload Successful!</p>
                  {uploadResult.videoUrl && (
                    <p className="text-xs mt-1 opacity-90">
                      Video is being processed and will be available shortly.
                    </p>
                  )}
                </div>
              ) : (
                <p>{uploadResult.error}</p>
              )}
            </div>
          )}
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