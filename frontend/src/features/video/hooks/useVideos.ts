import { useState, useEffect } from "react";
import { Video } from "..";

export const useVideos = (activeTab: "all" | "your", isConnected: boolean, walletAddress?: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        if (activeTab === "your" && !isConnected) {
          setVideos([]);
          setLoading(false);
          return;
        }

        const endpoint = `http://localhost:8000/api/video/wallet/${walletAddress}`;

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

  return { videos, loading};
};