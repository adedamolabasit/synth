"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  FileVideo,
  Users,
  DollarSign,
  Shield,
  Plus,
  Eye,
  FileText,
  Clock,
  Wallet,
  Play,
} from "lucide-react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface Collaborator {
  id: string;
  walletAddress: string;
  role: "audio" | "visual" | "both";
  revenueShare: number;
  contribution?: string;
}

interface LicenseTerm {
  id: string;
  name: string;
  type: string;
  duration: string;
  terms: string;
  createdAt: string;
}

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
    description?: string;
  };
  createdAt: string;
  ipRegistered?: boolean;
  ipStatus?: "draft" | "published" | "pending";
  collaborators?: Collaborator[];
  licenseTerms?: LicenseTerm[];
  revenue?: number;
}

export function IPManagementDashboard() {
  const { user, primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || "";
  const isConnected = !!user;

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [videoThumbnails, setVideoThumbnails] = useState<{
    [key: string]: string;
  }>({});
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const previewRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const videoThumbnailCache: Record<string, string> = {};

  // Stats
  const totalVideos = videos.length;
  const registeredVideos = videos.filter((v) => v.ipRegistered).length;
  const totalRevenue = videos.reduce((sum, v) => sum + (v.revenue || 0), 0);
  const totalCollaborators = videos.reduce(
    (sum, v) => sum + (v.collaborators?.length || 0),
    0
  );

  // Thumbnail generation - same approach as VideoPlayer
  useEffect(() => {
    let isMounted = true;

    const generateThumbnailsSequentially = async () => {
      for (const video of videos) {
        // Skip if already has thumbnail or already processed
        if (video.thumbnailUrl || videoThumbnailCache[video.videoUrl] || videoThumbnails[video.id]) {
          continue;
        }

        try {
          const thumb = await generateVideoThumbnail(video.videoUrl);
          if (!isMounted) return;

          videoThumbnailCache[video.videoUrl] = thumb;
          setVideoThumbnails((prev) => ({ ...prev, [video.id]: thumb }));
        } catch (err) {
          console.warn(`Thumbnail failed for ${video.id}`, err);
        }
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
        video.currentTime = Math.min(video.duration * 0.1, 10); // Get thumbnail at 10% of video or 10 seconds
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

  // Fetch user videos
  useEffect(() => {
    const fetchUserVideos = async () => {
      if (!isConnected) {
        setVideos([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/video/wallet/${walletAddress}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.videos)) {
          // Transform API response to include IP data
          const videosWithIPData = result.videos.map((video: any) => ({
            id: video.id,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl, // Use the thumbnail from API if available
            videoHash: video.videoHash,
            walletAddress: video.walletAddress,
            metadata: {
              name: video.metadata?.name || "Untitled Video",
              size: video.metadata?.size || 0,
              type: video.metadata?.type || "video/mp4",
              duration: video.metadata?.duration,
              description: video.metadata?.description,
            },
            createdAt: video.createdAt,
            // Mock IP data for demonstration
            ipRegistered: Math.random() > 0.3,
            ipStatus: ["draft", "published", "pending"][
              Math.floor(Math.random() * 3)
            ] as "draft" | "published" | "pending",
            collaborators:
              Math.random() > 0.5
                ? [
                    {
                      id: "1",
                      walletAddress: "0x" + Math.random().toString(16).slice(2, 10) + "...",
                      role: ["audio", "visual", "both"][
                        Math.floor(Math.random() * 3)
                      ] as "audio" | "visual" | "both",
                      revenueShare: Math.floor(Math.random() * 40) + 10,
                      contribution: "Audio mixing & mastering",
                    },
                  ]
                : [],
            licenseTerms:
              Math.random() > 0.6
                ? [
                    {
                      id: "1",
                      name: "Commercial License",
                      type: "commercial",
                      duration: "1 year",
                      terms: "Full commercial rights for distribution",
                      createdAt: new Date().toISOString(),
                    },
                  ]
                : [],
            revenue: Math.floor(Math.random() * 1000),
          }));
          
          setVideos(videosWithIPData);
        } else {
          console.error("Invalid response format:", result);
          setVideos([]);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserVideos();
  }, [walletAddress, isConnected]);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const togglePublishStatus = (video: Video) => {
    setVideos(
      videos.map((v) =>
        v.id === video.id
          ? {
              ...v,
              ipStatus: v.ipStatus === "published" ? "draft" : "published",
            }
          : v
      )
    );
  };

  const handleRegisterIP = (video: Video) => {
    setVideos(
      videos.map((v) =>
        v.id === video.id ? { ...v, ipRegistered: true, ipStatus: "draft" } : v
      )
    );
    setShowRegisterModal(false);
    setSelectedVideo(null);
  };

  const handleAddLicense = (video: Video, license: LicenseTerm) => {
    setVideos(
      videos.map((v) =>
        v.id === video.id
          ? { ...v, licenseTerms: [...(v.licenseTerms || []), license] }
          : v
      )
    );
    setShowLicenseModal(false);
    setSelectedVideo(null);
  };

  if (!isConnected) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Shield className="text-slate-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-slate-400 mb-6">
          Please connect your wallet to manage your IP assets
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Box className="text-blue-400" size={20} /> IP Assets Management
        </h2>
        <div className="text-sm text-slate-400">
          Manage your video IP assets
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Videos</span>
            <FileVideo className="text-blue-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{totalVideos}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">IP Registered</span>
            <Shield className="text-emerald-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{registeredVideos}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Revenue</span>
            <DollarSign className="text-amber-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">${totalRevenue}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Collaborators</span>
            <Users className="text-purple-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{totalCollaborators}</p>
        </Card>
      </div>

      {/* Wallet Info */}
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

      {/* Videos Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <FileVideo size={16} className="text-cyan-400" /> Your Video Assets ({videos.length})
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400">Loading videos...</div>
          </div>
        ) : videos.length === 0 ? (
          <Card className="p-8 text-center">
            <FileVideo className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg text-slate-300 mb-2">No videos found</h3>
            <p className="text-slate-500 mb-4">
              Upload videos to start managing IP assets
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                onMouseEnter={() => handleVideoHover(video.id)}
                onMouseLeave={() => handleVideoHoverEnd(video.id)}
              >
                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                  {/* Thumbnail or Preview Video */}
                  {hoveredVideo === video.id ? (
                    // Show video preview on hover
                    <video
                      ref={(el) => (previewRefs.current[video.id] = el)}
                      src={video.videoUrl}
                      muted
                      loop
                      className="w-full h-full object-cover"
                      playsInline
                    />
                  ) : (
                    // Show static thumbnail
                    <>
                      {video.thumbnailUrl || videoThumbnails[video.id] ? (
                        <img
                          src={video.thumbnailUrl || videoThumbnails[video.id]}
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

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={
                        video.ipRegistered
                          ? video.ipStatus === "published"
                            ? "success"
                            : "warning"
                          : "default"
                      }
                      size="sm"
                    >
                      {video.ipRegistered ? video.ipStatus : "Not Registered"}
                    </Badge>
                  </div>

                  {/* Hover Overlay with Play Button */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                      <Play
                        className="text-slate-800"
                        size={24}
                        fill="currentColor"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-white text-sm line-clamp-2 mb-2">
                    {video.metadata.name}
                  </h4>
                  
                  <div className="space-y-2 text-xs text-slate-400 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(video.createdAt)}
                      </span>
                      <span>{formatFileSize(video.metadata.size)}</span>
                    </div>

                    {video.collaborators && video.collaborators.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{video.collaborators.length} collaborator(s)</span>
                      </div>
                    )}

                    {video.licenseTerms && video.licenseTerms.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText size={12} />
                        <span>{video.licenseTerms.length} license(s)</span>
                      </div>
                    )}

                    {video.revenue && video.revenue > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign size={12} />
                        <span>${video.revenue} revenue</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {video.ipRegistered ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowLicenseModal(true);
                          }}
                        >
                          <FileText size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => togglePublishStatus(video)}
                        >
                          {video.ipStatus === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(video.videoUrl, "_blank")}
                        >
                          <Eye size={14} />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedVideo(video);
                          setShowRegisterModal(true);
                        }}
                      >
                        Register IP
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Register IP Modal */}
      {showRegisterModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Register IP Asset</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Video</label>
                  <div className="p-3 bg-slate-800 rounded border border-slate-600">
                    <p className="text-white font-medium">{selectedVideo.metadata.name}</p>
                    <p className="text-slate-400 text-sm">{formatDate(selectedVideo.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleRegisterIP(selectedVideo)}
                  >
                    Register IP Asset
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRegisterModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* License Terms Modal */}
      {showLicenseModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                License Terms - {selectedVideo.metadata.name}
              </h3>
              
              {selectedVideo.licenseTerms && selectedVideo.licenseTerms.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {selectedVideo.licenseTerms.map((license) => (
                    <Card key={license.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{license.name}</h4>
                        <Badge variant="outline" size="sm">{license.type}</Badge>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>Duration: {license.duration}</p>
                        <p>Terms: {license.terms}</p>
                        <p>Created: {formatDate(license.createdAt)}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <FileText className="mx-auto text-slate-400 mb-4" size={48} />
                  <p className="text-slate-400">No license terms attached</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() =>
                    handleAddLicense(selectedVideo, {
                      id: Date.now().toString(),
                      name: "Commercial License",
                      type: "commercial",
                      duration: "1 year",
                      terms: "Full commercial rights for digital distribution",
                      createdAt: new Date().toISOString(),
                    })
                  }
                >
                  Attach License Terms
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLicenseModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}