import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Download, Trash2, Eye, Clock, FileVideo, X } from 'lucide-react';
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";

interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  videoHash: string;
  walletAddress: string;
  metadata: {
    name: string;
    size: number;
    type: string;
    duration?: number;
  };
  createdAt: string;
}

export const VideoGallery = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'your'>('all');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const DUMMY_WALLET = "0x0000000000000000000000000000000000000000";

  // Fetch videos based on active tab
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'all' 
          ? 'http://localhost:8000/api/video'
          : `http://localhost:8000/api/video/wallet/${DUMMY_WALLET}`;
        
        const response = await fetch(endpoint);
        const result = await response.json();
        
        if (result.success) {
          setVideos(result.videos || []);
        } else {
          console.error('Failed to fetch videos:', result.error);
          setVideos([]);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeTab]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    // Auto-play the video when selected
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    }, 100);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/video/${videoId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
        if (selectedVideo?.id === videoId) {
          handleCloseVideo();
        }
      } else {
        alert('Failed to delete video: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-400">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900/50">
      {/* Header with Tabs */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Video Gallery</h2>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'all' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('all')}
            >
              All Videos
            </Button>
            <Button
              variant={activeTab === 'your' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('your')}
            >
              Your Videos
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: Main Video Player (shown when video is selected) */}
        {selectedVideo ? (
          <div className="flex-1 flex flex-col p-6">
            {/* Video Player Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white truncate flex-1 mr-4">
                {selectedVideo.metadata.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<X size={16} />}
                onClick={handleCloseVideo}
                className="text-slate-400 hover:text-white"
              >
                Close
              </Button>
            </div>

            {/* Large Video Player */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl mb-6">
              <video
                ref={videoRef}
                src={selectedVideo.videoUrl}
                controls
                className="w-full h-full object-contain"
                poster={selectedVideo.thumbnailUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>

            {/* Video Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-4">Video Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Size:</span>
                    <span className="text-white text-sm">{formatFileSize(selectedVideo.metadata.size)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Type:</span>
                    <span className="text-white text-sm uppercase">{selectedVideo.metadata.type.split('/')[1]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Uploaded:</span>
                    <span className="text-white text-sm">{formatDate(selectedVideo.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Wallet:</span>
                    <span className="text-white text-sm font-mono">
                      {selectedVideo.walletAddress.slice(0, 8)}...{selectedVideo.walletAddress.slice(-6)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* IPFS & Actions */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">IPFS Hash</h4>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <code className="text-xs text-slate-300 break-all">
                      {selectedVideo.videoHash}
                    </code>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    icon={<Download size={16} />}
                    onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                  >
                    Download
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    icon={<Eye size={16} />}
                    onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                  >
                    View Original
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteVideo(selectedVideo.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full grid when no video is selected */
          <div className="flex-1 p-6 overflow-y-auto">
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <FileVideo className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-lg text-slate-300 mb-2">No videos found</h3>
                <p className="text-slate-500">
                  {activeTab === 'all' 
                    ? 'No videos have been uploaded yet.' 
                    : "You haven't uploaded any videos yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <Card 
                    key={video.id} 
                    className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="aspect-video bg-slate-800 relative overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.metadata.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                          <FileVideo className="text-slate-400 group-hover:text-blue-400 transition-colors" size={48} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                          <Play className="text-slate-800" size={24} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-tight">
                        {video.metadata.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileVideo size={12} />
                          {formatFileSize(video.metadata.size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(video.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right: Videos List (single column, only shown when video is playing) */}
        {selectedVideo && (
          <div className="w-80 border-l border-slate-800/50 bg-slate-900/95 backdrop-blur-xl overflow-y-auto">
            <div className="p-4 border-b border-slate-800/50">
              <h4 className="text-lg font-semibold text-white mb-2">
                More Videos ({videos.length - 1})
              </h4>
              <p className="text-slate-400 text-sm">
                Click any video to play
              </p>
            </div>

            <div className="p-4 space-y-4">
              {videos
                .filter(video => video.id !== selectedVideo.id)
                .map((video) => (
                  <Card 
                    key={video.id} 
                    className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="aspect-video bg-slate-800 relative overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.metadata.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                          <FileVideo className="text-slate-400 group-hover:text-blue-400 transition-colors" size={24} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                          <Play className="text-slate-800" size={16} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-white text-xs mb-1 line-clamp-2 leading-tight">
                        {video.metadata.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{formatFileSize(video.metadata.size)}</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};