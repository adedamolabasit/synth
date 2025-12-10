import { useState, useEffect } from "react";
import { Video } from "../components";
import { useGetVideos } from "../../../shared/hooks/useGetVideos";

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    data: videosData,
    isLoading: isVideosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useGetVideos();

  useEffect(() => {
    if (videosData?.success) {
      setVideos(videosData.videos || []);
    }
  }, [videosData]);

  useEffect(() => {
    setLoading(false);
  }, [isVideosLoading]);

  useEffect(() => {
    if (videosError) {
      setVideos([]);
    }
  }, [videosError]);

  return {
    videos,
    loading,
    refetchVideos: refetchVideos,
  };
};
