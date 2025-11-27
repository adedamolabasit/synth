import { useState } from "react";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { Input } from "../../../ui/Input";
import { Textarea } from "../../../ui/Input";
import { formatDate } from "../utils/formatter";
import { RegisterIPModalProps, IPRegistrationData } from "../types";
import type { Video } from "../types";


export function RegisterIPModal({ video, onRegister, onClose }: RegisterIPModalProps) {
  const [formData, setFormData] = useState<IPRegistrationData>({
    title: video.metadata.name,
    video: video,
    description: video.metadata.name,
    creators: [
      {
        name: "",
        address: "",
        contributionPercent: 100,
      },
    ],
    licenseTerms: {
      commercialRevShare: 5,
      defaultMintingFee: "1",
      currency: "0x", // Will be replaced with actual token address
    },
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof IPRegistrationData],
        [field]: value
      }
    }));
  };

  const updateCreatorField = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      creators: prev.creators?.map((creator, i) => 
        i === index ? { ...creator, [field]: value } : creator
      )
    }));
  };

  const addCreator = () => {
    setFormData(prev => ({
      ...prev,
      creators: [...(prev.creators || []), { name: "", address: "", contributionPercent: 0 }]
    }));
  };

  const removeCreator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      creators: prev.creators?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    if (formData.creators && formData.creators.length > 0) {
      const totalContribution = formData.creators.reduce((sum, creator) => sum + creator.contributionPercent, 0);
      if (totalContribution !== 100) {
        alert("Total contribution percentage must equal 100%");
        return;
      }
    }

    const registrationData: IPRegistrationData = {
      ...formData,
      createdAt: Math.floor(Date.now() / 1000).toString(),
      image: video.thumbnailUrl || "",
      imageHash: "",
      mediaHash: "",
      mediaType: video.metadata.type || "video/mp4",
      
      // Static NFT Metadata
      nftName: formData.title,
      nftDescription: `This NFT represents ownership of the IP Asset for ${formData.title}`,
      nftAttributes: [
        { key: "Source", value: "Visualizer App" },
        { key: "File Type", value: video.metadata.type?.split("/")[1] || "video" },
        { key: "File Size", value: `${(video.metadata.size / (1024 * 1024)).toFixed(2)} MB` },
        { key: "Original Video", value: video.metadata.name },
      ],
    };

    onRegister(registrationData);
  };

  const totalContribution = formData.creators?.reduce((sum, creator) => sum + creator.contributionPercent, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Register IP Asset
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Video Information */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Video Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <p className="text-white font-medium">{video.metadata.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Size:</span>
                  <p className="text-white">{formatFileSize(video.metadata.size)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Type:</span>
                  <p className="text-white">{video.metadata.type}</p>
                </div>
                <div>
                  <span className="text-slate-400">Uploaded:</span>
                  <p className="text-white">{formatDate(video.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300">Basic Information</h4>
              
              <Input
                label="Title *"
                value={formData.title}
                onChange={(value) => updateField("title", value)}
                placeholder="Enter IP asset title"
                required
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Describe your IP asset"
                rows={3}
              />
            </div>

            {/* Creators */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300">Creators</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCreator}
                >
                  Add Creator
                </Button>
              </div>

              {formData.creators?.map((creator, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Input
                      label="Name"
                      value={creator.name}
                      onChange={(value) => updateCreatorField(index, "name", value)}
                      placeholder="Creator name"
                    />
                    <Input
                      label="Address"
                      value={creator.address}
                      onChange={(value) => updateCreatorField(index, "address", value)}
                      placeholder="0x..."
                    />
                    <Input
                      label="Contribution %"
                      type="number"
                      value={creator.contributionPercent.toString()}
                      onChange={(value) => updateCreatorField(index, "contributionPercent", parseInt(value) || 0)}
                      placeholder="100"
                      min="0"
                      max="100"
                    />
                  </div>
                  {formData.creators && formData.creators.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCreator(index)}
                      className="text-red-400 hover:text-red-300 mt-6"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}

              {totalContribution !== 100 && (
                <p className="text-amber-400 text-sm">
                  Total contribution: {totalContribution}% (must equal 100%)
                </p>
              )}
            </div>

            {/* License Terms */}
            {/* <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300">License Terms</h4>
              
              <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <Input
                  label="Commercial Revenue Share %"
                  type="number"
                  value={formData.licenseTerms?.commercialRevShare.toString() || "5"}
                  onChange={(value) => updateNestedField("licenseTerms", "commercialRevShare", parseInt(value) || 0)}
                  placeholder="5"
                  min="0"
                  max="100"
                />

                <Input
                  label="Default Minting Fee"
                  value={formData.licenseTerms?.defaultMintingFee || "1"}
                  onChange={(value) => updateNestedField("licenseTerms", "defaultMintingFee", value)}
                  placeholder="1"
                />

                <Input
                  label="Currency Address"
                  value={formData.licenseTerms?.currency || "0x"}
                  onChange={(value) => updateNestedField("licenseTerms", "currency", value)}
                  placeholder="0x..."
                />
              </div>
            </div> */}


            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit}
                disabled={!formData.title.trim() || totalContribution !== 100}
              >
                Register IP Asset
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}