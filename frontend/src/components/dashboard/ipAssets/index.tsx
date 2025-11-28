"use client";
import { useState, useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DashboardHeader } from "./components/DashboardHeader";
import { StatsGrid } from "./components/StatsGrid";
import { WalletCard } from "./components/WalletCard";
import { VideoGrid } from "./components/VideoGrid";
import { RegisterIPModal } from "./components/RegisterIPModal";
import { LicenseModal } from "./components/LicenseModal";
import { useVideos } from "./hooks/useVideos";
import { useVideoThumbnails } from "./hooks/useVideoThumbnails";
import { Shield } from "lucide-react";
import type { Video } from "./types";

export function IPManagementDashboard() {
  const { user, primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || "";
  const isConnected = !!user;

  const {
    videos,
    loading,
    fetchUserVideos,
    updateVideoPublication,
    updateVideoIpRegistration,
    deleteVideo,
  } = useVideos(walletAddress, isConnected);
  const { videoThumbnails, generateThumbnails } = useVideoThumbnails();

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Generate thumbnails when videos change
  useEffect(() => {
    if (videos.length > 0) {
      generateThumbnails(videos);
    }
  }, [videos, generateThumbnails]);

  // Stats calculations
  const totalVideos = videos.length;
  const registeredVideos = videos.filter(
    (v) => v.ipRegistration?.status === "registered"
  ).length;
  const totalRevenue = videos.reduce((sum, v) => sum + (v.revenue || 0), 0);
  const totalCollaborators = videos.reduce(
    (sum, v) => sum + (v.collaborators?.length || 0),
    0
  );

  //   const handleRegisterIP = (video: Video) => {
  //     // Update local state - in real app, this would be an API call
  //     fetchUserVideos(); // Refresh data
  //     setShowRegisterModal(false);
  //     setSelectedVideo(null);
  //   };

  const handleAddLicense = (video: Video, license: any) => {
    // Update local state - in real app, this would be an API call
    fetchUserVideos(); // Refresh data
    setShowLicenseModal(false);
    setSelectedVideo(null);
  };

  if (!isConnected) {
    return <ConnectWalletPrompt />;
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <DashboardHeader />

      <StatsGrid
        totalVideos={totalVideos}
        registeredVideos={registeredVideos}
        totalRevenue={totalRevenue}
        totalCollaborators={totalCollaborators}
      />

      <WalletCard walletAddress={walletAddress} />

      <VideoGrid
        videos={videos}
        loading={loading}
        videoThumbnails={videoThumbnails}
        onVideoSelect={setSelectedVideo}
        onShowRegisterModal={setShowRegisterModal}
        onShowLicenseModal={setShowLicenseModal}
        onTogglePublishStatus={updateVideoPublication}
        onDeleteVideo={deleteVideo}
      />

      {showRegisterModal && selectedVideo && (
        <RegisterIPModal
          video={selectedVideo}
          onClose={() => setShowRegisterModal(false)}
          updateVideoIpRegistration={updateVideoIpRegistration}
        />
      )}

      {showLicenseModal && selectedVideo && (
        <LicenseModal
          video={selectedVideo}
          onAddLicense={handleAddLicense}
          onClose={() => setShowLicenseModal(false)}
        />
      )}
    </div>
  );
}

// Separate component for connect wallet state
function ConnectWalletPrompt() {
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
