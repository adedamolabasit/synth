import { useState, useEffect } from "react";
import type { Video as VideoParams, RegisteredIpAssetParams } from "../types";
import { useToastContext } from "../../../ui/Toast.tsx/ToastProvider";

export function useVideos(walletAddress: string, isConnected: boolean) {
  const [videos, setVideos] = useState<VideoParams[]>([]);
  const [loading, setLoading] = useState(true);

  const toast = useToastContext(); // Initialize toast

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

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && Array.isArray(result.videos)) {
        const videosWithIPData = result.videos.map((video: VideoParams) => ({
          id: video.id,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
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
          ipRegistration: video.ipRegistration,
          publication: video.publication,
          collaborators: Math.random() > 0.5 ? generateMockCollaborators() : [],
          licenseTerms: Math.random() > 0.6 ? generateMockLicenses() : [],
          revenue: Math.floor(Math.random() * 1000),
        }));

        setVideos(videosWithIPData);
      } else {
        setVideos([]);
      }
    } catch (err) {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const updateVideoPublication = async (
    video: VideoParams,
    status: "draft" | "published"
  ) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, publication: status } : v))
    );

    try {
      const res = await fetch(
        `http://localhost:8000/api/video/publication/${video.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publication: status }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        fetchUserVideos();
      }
    } catch (err) {
      fetchUserVideos();
    }
  };
  const updateVideoIpRegistration = async (
    video: VideoParams,
    ipRegistration: RegisteredIpAssetParams
  ) => {
    console.log(ipRegistration, "ayyyyyyyyy");
    try {
      const res = await fetch(
        `http://localhost:8000/api/video/ip/${video.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ipRegistration: {
              ipId: ipRegistration.ipId,
              status: ipRegistration.status,
              tokenId: ipRegistration.tokenId
                ? ipRegistration.tokenId.toString()
                : undefined,
            },
          }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        fetchUserVideos();
      }
    } catch (err) {
      console.log(err, "error>>");
      fetchUserVideos();
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/video/${videoId}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (result.success) {
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      } else {
        toast.error("Failed to delete video");
      }
    } catch (error) {
      toast.error("Error deleting video");
    }
  };

  useEffect(() => {
    fetchUserVideos();
  }, [walletAddress, isConnected]);

  return {
    videos,
    loading,
    fetchUserVideos,
    updateVideoPublication,
    updateVideoIpRegistration,
    deleteVideo,
  };
}

function generateMockCollaborators() {
  return [
    {
      id: "1",
      walletAddress: "0x" + Math.random().toString(16).slice(2, 10) + "...",
      role: ["audio", "visual", "both"][Math.floor(Math.random() * 3)] as
        | "audio"
        | "visual"
        | "both",
      revenueShare: Math.floor(Math.random() * 40) + 10,
      contribution: "Audio mixing & mastering",
    },
  ];
}

function generateMockLicenses() {
  return [
    {
      id: "1",
      name: "Commercial License",
      type: "commercial",
      duration: "1 year",
      terms: "Full commercial rights for distribution",
      createdAt: new Date().toISOString(),
    },
  ];
}
