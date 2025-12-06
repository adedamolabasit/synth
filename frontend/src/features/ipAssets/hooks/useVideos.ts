import { useState, useEffect } from "react";
import type { Video as VideoParams, RegisteredIpAssetParams } from "../types";
import { useToastContext } from "../../../components/common/Toast/ToastProvider";
import { useGetVideoByWallet } from "../../../hooks/useGetVideosByWallet";
import { useUpdatePublication } from "../../../hooks/useUpdatePublication";
import { useUpdateIp } from "../../../hooks/useUpdateIp";
import { useDeleteVideo } from "../../../hooks/useDeleteVideo";

export function useVideos(walletAddress: string, isConnected: boolean) {
  const [videos, setVideos] = useState<VideoParams[]>([]);
  const [loading, setLoading] = useState(true);

  const toast = useToastContext();

  const {
    data: videosData,
    isLoading: isVideosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useGetVideoByWallet(walletAddress || "");

  const updatePublicationMutation = useUpdatePublication();
  const updateIpMutation = useUpdateIp();
  const deleteVideoMutation = useDeleteVideo();

  useEffect(() => {
    if (videosData?.success && Array.isArray(videosData.videos)) {
      const videosWithIPData = videosData.videos.map((video: VideoParams) => ({
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
    } else if (!isConnected || !walletAddress) {
      setVideos([]);
    }
  }, [videosData, isConnected, walletAddress]);

  useEffect(() => {
    if (!isConnected || !walletAddress) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(isVideosLoading);
  }, [isVideosLoading, isConnected, walletAddress]);

  useEffect(() => {
    if (videosError) {
      console.error("Error fetching videos:", videosError);
      setVideos([]);
    }
  }, [videosError]);

  const fetchUserVideos = async () => {
    if (!isConnected) {
      setVideos([]);
      setLoading(false);
      return;
    }

    try {
      await refetchVideos();
    } catch (err) {
      console.error("Error refetching videos:", err);
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
      await updatePublicationMutation.mutateAsync({
        id: video.id,
        status,
      });

      await refetchVideos();
    } catch (err) {
      console.error("Error updating publication:", err);
      await refetchVideos();
      toast.error("Failed to update publication status");
    }
  };

  const updateVideoIpRegistration = async (
    video: VideoParams,
    ipRegistration: RegisteredIpAssetParams
  ) => {
    try {
      await updateIpMutation.mutateAsync({
        id: video.id,
        ipRegistration: {
          ipId: ipRegistration.ipId as string,
          status: ipRegistration.status,
          tokenId: ipRegistration.tokenId
            ? ipRegistration.tokenId.toString()
            : undefined,
        },
      });

      await refetchVideos();
    } catch (err) {
      await refetchVideos();
      toast.error("Failed to update IP registration");
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    setVideos((prev) => prev.filter((v) => v.id !== videoId));

    try {
      await deleteVideoMutation.mutateAsync(videoId);
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      await refetchVideos();
      toast.error("Failed to delete video");
    }
  };

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
