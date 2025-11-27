import { useState, useEffect, useRef } from "react";
import {
  Play,
  Download,
  Eye,
  Clock,
  FileVideo,
  X,
  ArrowLeft,
  Lock,
  EyeOff,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

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
  publication: "draft" | "published";
  createdAt: string;
}

export const VideoPlayer = () => {
  const { user, primaryWallet } = useDynamicContext();
  const isConnected = !!user;
  const walletAddress = primaryWallet?.address;

  const [activeTab, setActiveTab] = useState<"all" | "your">("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [videoThumbnails, setVideoThumbnails] = useState<{
    [key: string]: string;
  }>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const videoThumbnailCache: Record<string, string> = {};

  useEffect(() => {
    let isMounted = true;

    const generateThumbnailsSequentially = async () => {
      for (const video of videos) {
        if (video.thumbnailUrl || videoThumbnailCache[video.videoUrl]) continue;

        try {
          const thumb = await generateVideoThumbnail(video.videoUrl);
          if (!isMounted) return;

          videoThumbnailCache[video.videoUrl] = thumb;

          setVideoThumbnails((prev) => ({ ...prev, [video.id]: thumb }));
        } catch (err) {}
      }
    };

    if (videos.length > 0) {
      generateThumbnailsSequentially();
    }

    return () => {
      isMounted = false;
    };
  }, [videos]);

  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = videoUrl;
      video.muted = true;

      video.addEventListener("loadedmetadata", () => {
        video.currentTime = 0;
      });

      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } else {
          reject(new Error("Could not get canvas context"));
        }
      });

      video.addEventListener("error", () =>
        reject(new Error("Video loading error"))
      );

      video.load();
    });
  };

  const handleVideoHover = (videoId: string) => {
    setHoveredVideo(videoId);

    const previewVideo = previewRefs.current[videoId];
    if (previewVideo) {
      previewVideo.currentTime = 0;
      previewVideo.play().catch(() => {});
    }
  };

  const handleVideoHoverEnd = (videoId: string) => {
    setHoveredVideo(null);

    const previewVideo = previewRefs.current[videoId];
    if (previewVideo) {
      previewVideo.pause();
      previewVideo.currentTime = 0;
    }
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        if (activeTab === "your" && !isConnected) {
          setVideos([]);
          setLoading(false);
          return;
        }

        const endpoint =
          activeTab === "all"
            ? "http://localhost:8000/api/video"
            : `http://localhost:8000/api/video/wallet/${walletAddress}`;

        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          setVideos(result.videos || []);
        } else {
          setVideos([]);
        }
      } catch (error) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeTab, isConnected, walletAddress]);

  const handleTabChange = (tab: "all" | "your") => {
    if (tab === "your" && !isConnected) {
      return;
    }
    setActiveTab(tab);
  };

  // Filter videos based on active tab
  const getFilteredVideos = () => {
    if (activeTab === "all") {
      // Show only published videos for "All Videos" tab
      return videos.filter(video => video.publication === "published");
    } else {
      // Show ALL videos (both draft and published) for "Your Videos" tab
      return videos;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleBackToGallery = () => {
    setSelectedVideo(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-400">Loading videos...</div>
      </div>
    );
  }

  const filteredVideos = getFilteredVideos();

  return (
    <div className="h-full overflow-y-scroll bg-slate-900/50">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Video Player</h2>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "all" ? "primary" : "secondary"}
              onClick={() => handleTabChange("all")}
            >
              All Videos
            </Button>
            <Button
              variant={activeTab === "your" ? "primary" : "secondary"}
              onClick={() => handleTabChange("your")}
              disabled={!isConnected}
              className={`relative ${
                !isConnected ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {!isConnected && (
                <Lock size={14} className="absolute -left-2 -top-2" />
              )}
              Your Videos
            </Button>
          </div>
        </div>

        {activeTab === "your" && !isConnected && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="text-amber-400" size={20} />
              <div>
                <p className="text-amber-300 font-medium">
                  Connect your wallet
                </p>
                <p className="text-amber-400/80 text-sm">
                  Please connect your wallet to view your uploaded videos
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {selectedVideo ? (
          <div className="flex-1 flex flex-col p-6 min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft size={16} />}
                  onClick={handleBackToGallery}
                  className="text-slate-400 hover:text-white"
                >
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white truncate">
                    {selectedVideo.metadata.name}
                  </h3>
                  {selectedVideo.publication === "draft" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs border border-amber-500/30">
                      <EyeOff size={12} />
                      Draft
                    </span>
                  )}
                </div>
              </div>
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

            <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl mb-6 min-h-0">
              <video
                ref={videoRef}
                src={selectedVideo.videoUrl}
                controls
                className="w-full h-full object-scale-down"
                poster={
                  selectedVideo.thumbnailUrl ||
                  videoThumbnails[selectedVideo.id]
                }
              />
            </div>

            <div className="h-48 flex-shrink-0">
              <Card className="h-full flex flex-col">
                <div className="p-4 border-b  flex-shrink-0">
                  <h4 className="text-lg font-semibold text-white">
                    Video Information
                  </h4>
                </div>
                <div className="flex-1 p-4 bg-slate-800/50 ">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Status:</span>
                      <span className={`text-sm font-medium ${
                        selectedVideo.publication === "published" 
                          ? "text-green-400" 
                          : "text-amber-400"
                      }`}>
                        {selectedVideo.publication === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Size:</span>
                      <span className="text-white text-sm">
                        {formatFileSize(selectedVideo.metadata.size)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Type:</span>
                      <span className="text-white text-sm uppercase">
                        {selectedVideo.metadata.type.split("/")[1]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Duration:</span>
                      <span className="text-white text-sm">
                        {formatDuration(selectedVideo.metadata.duration)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Uploaded:</span>
                      <span className="text-white text-sm">
                        {formatDate(selectedVideo.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Wallet:</span>
                      <span className="text-white text-sm font-mono">
                        {selectedVideo.walletAddress.slice(0, 8)}...
                        {selectedVideo.walletAddress.slice(-6)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <h5 className="text-sm font-medium text-slate-300 mb-2">
                      IPFS Hash
                    </h5>
                    <div className="bg-slate-800/50 rounded-lg p-2">
                      <code className="text-xs text-slate-300 break-all">
                        {selectedVideo.videoHash}
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      icon={<Download size={16} />}
                      onClick={() =>
                        window.open(selectedVideo.videoUrl, "_blank")
                      }
                    >
                      Download
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      icon={<Eye size={16} />}
                      onClick={() =>
                        window.open(selectedVideo.videoUrl, "_blank")
                      }
                    >
                      View Original
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "your" && !isConnected ? (
              <div className="text-center py-12">
                <Lock className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-lg text-slate-300 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-slate-500 mb-4">
                  Please connect your wallet to view your uploaded videos
                </p>
                <Button variant="primary">Connect Wallet</Button>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <FileVideo className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-lg text-slate-300 mb-2">No videos found</h3>
                <p className="text-slate-500">
                  {activeTab === "all"
                    ? "No published videos available."
                    : "You haven't uploaded any videos yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <Card
                    key={video.id}
                    className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    onClick={() => handleVideoClick(video)}
                    onMouseEnter={() => handleVideoHover(video.id)}
                    onMouseLeave={() => handleVideoHoverEnd(video.id)}
                  >
                    <div className="aspect-video bg-slate-800 relative overflow-hidden">
                      {hoveredVideo === video.id ? (
                        <video
                          ref={(el) => (previewRefs.current[video.id] = el)}
                          src={video.videoUrl}
                          muted
                          loop
                          className="w-full h-full object-cover"
                          playsInline
                        />
                      ) : (
                        <>
                          {video.thumbnailUrl || videoThumbnails[video.id] ? (
                            <img
                              src={
                                video.thumbnailUrl || videoThumbnails[video.id]
                              }
                              alt={video.metadata.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                              <FileVideo
                                className="text-slate-400 group-hover:text-blue-400 transition-colors"
                                size={48}
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                          <Play
                            className="text-slate-800"
                            size={24}
                            fill="currentColor"
                          />
                        </div>
                      </div>

                      {video.publication === "draft" && (
                        <div className="absolute top-2 left-2 bg-amber-500/90 text-amber-50 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <EyeOff size={10} />
                          Draft
                        </div>
                      )}

                      {video.metadata.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.metadata.duration)}
                        </div>
                      )}
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

        {selectedVideo && (
          <div className="w-80 border-l border-slate-800/50 bg-slate-900/95 backdrop-blur-xl overflow-y-auto">
            <div className="p-4 border-b border-slate-800/50">
              <h4 className="text-lg font-semibold text-white mb-2">
                More Videos ({filteredVideos.length - 1})
              </h4>
              <p className="text-slate-400 text-sm">Click any video to play</p>
            </div>

            <div className="p-4 space-y-4">
              {filteredVideos
                .filter((video) => video.id !== selectedVideo.id)
                .map((video) => (
                  <Card
                    key={video.id}
                    className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    onClick={() => handleVideoClick(video)}
                    onMouseEnter={() => handleVideoHover(video.id)}
                    onMouseLeave={() => handleVideoHoverEnd(video.id)}
                  >
                    <div className="aspect-video bg-slate-800 relative overflow-hidden">
                      {hoveredVideo === video.id ? (
                        <video
                          ref={(el) => (previewRefs.current[video.id] = el)}
                          src={video.videoUrl}
                          muted
                          loop
                          className="w-full h-full object-cover"
                          playsInline
                        />
                      ) : (
                        <>
                          {video.thumbnailUrl || videoThumbnails[video.id] ? (
                            <img
                              src={
                                video.thumbnailUrl || videoThumbnails[video.id]
                              }
                              alt={video.metadata.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                              <FileVideo
                                className="text-slate-400 group-hover:text-blue-400 transition-colors"
                                size={24}
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                          <Play
                            className="text-slate-800"
                            size={16}
                            fill="currentColor"
                          />
                        </div>
                      </div>

                      {video.publication === "draft" && (
                        <div className="absolute top-1 left-1 bg-amber-500/90 text-amber-50 text-xs px-1 py-0.5 rounded flex items-center gap-1">
                          <EyeOff size={8} />
                          Draft
                        </div>
                      )}

                      {video.metadata.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                          {formatDuration(video.metadata.duration)}
                        </div>
                      )}
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