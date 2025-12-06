import { useState, useEffect } from "react";
import { Video } from "..";
import { useGetVideoByWallet } from "../../../hooks/useGetVideosByWallet";

export const useVideos = (
  activeTab: "all" | "your",
  isConnected: boolean,
  walletAddress?: string
) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    data: videosData,
    isLoading: isVideosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useGetVideoByWallet(walletAddress || "");

  useEffect(() => {
    if (videosData?.success) {
      setVideos(videosData.videos || []);
    } else if (!isConnected || !walletAddress) {
      setVideos([]);
    }
  }, [videosData, isConnected, walletAddress]);

  useEffect(() => {
    if (activeTab === "your" && !isConnected) {
      setVideos([]);
      setLoading(false);
      return;
    }

    if (activeTab === "your" && walletAddress) {
      setLoading(isVideosLoading);
    } else {
      setLoading(false);
    }
  }, [activeTab, isConnected, walletAddress, isVideosLoading]);

  useEffect(() => {
    if (videosError) {
      setVideos([]);
    }
  }, [videosError]);

  const fetchVideos = async () => {
    if (activeTab === "your" && walletAddress) {
      await refetchVideos();
    }
  };

  return {
    videos,
    loading,
    refetchVideos: fetchVideos,
  };
};
