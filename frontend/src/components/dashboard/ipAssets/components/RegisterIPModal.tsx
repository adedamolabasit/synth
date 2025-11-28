import { useState } from "react";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { Input, Textarea } from "../../../ui/Input2";
import { formatDate } from "../utils/formatter";
import { RegisterIPModalProps, IPRegistrationData } from "../types";
import {
  NonCommercialSocialRemixingTerms,
  createCommercialRemixTerms,
} from "../../../../story/utils";
import { RegisterIpAsset } from "../actions/RegisterIpAsset";
import { client } from "../../../../story/config";

export function RegisterIPModal({
  video,
  onClose,
  updateVideoIpRegistration,
}: RegisterIPModalProps) {
  const [licenseType, setLicenseType] = useState<
    "nonCommercial" | "commercial"
  >("nonCommercial");

  const [commercialTerms, setCommercialTerms] = useState({
    commercialRevShare: 5,
    defaultMintingFee: "1",
  });

  const [formData, setFormData] = useState<IPRegistrationData>({
    title: video.metadata.name,
    video: video,
    description: video.metadata.name,
    creators: [
      {
        name: "",
        address: "" as `0x${string}`,
        contributionPercent: 100,
      },
    ],
    licenseTerms: NonCommercialSocialRemixingTerms,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCreatorField = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      creators: prev.creators?.map((creator, i) =>
        i === index ? { ...creator, [field]: value } : creator
      ),
    }));
  };

  const updateCommercialTerms = (field: string, value: any) => {
    setCommercialTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addCreator = () => {
    setFormData((prev) => ({
      ...prev,
      creators: [
        ...(prev.creators || []),
        { name: "", address: "" as `0x${string}`, contributionPercent: 0 },
      ],
    }));
  };

  const removeCreator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      creators: prev.creators?.filter((_, i) => i !== index),
    }));
  };

  const handleLicenseTypeChange = (type: "nonCommercial" | "commercial") => {
    setLicenseType(type);

    if (type === "commercial") {
      const terms = createCommercialRemixTerms({
        commercialRevShare: commercialTerms.commercialRevShare,
        defaultMintingFee: parseFloat(commercialTerms.defaultMintingFee) || 1,
      });
      setFormData((prev) => ({
        ...prev,
        licenseTerms: terms,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    const registrationData: IPRegistrationData = {
      ...formData,
    };

    try {
      const response = await RegisterIpAsset(client!, registrationData);

      console.log(response, "respons");

      const ipRegistration = {
        ipId: response.ipId,
        tokenId: response.tokenId,
        status: response.status,
      };

      if (response?.status === "registered") {
        await updateVideoIpRegistration(video, ipRegistration);

        alert("IP Asset registered successfully!");
      }

      return response;
    } catch (error: any) {
      console.error("IP registration failed:", error);

      alert(error?.message || "IP registration failed. Please try again.");
    }
  };

  const totalContribution =
    formData.creators?.reduce(
      (sum, creator) => sum + creator.contributionPercent,
      0
    ) || 0;

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
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Video Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <p className="text-white font-medium">
                    {video.metadata.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Size:</span>
                  <p className="text-white">
                    {formatFileSize(video.metadata.size)}
                  </p>
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
              <h4 className="text-sm font-medium text-slate-300">
                Basic Information
              </h4>

              <Input
                label="Title *"
                value={formData.title}
                onChange={(value) => updateField("title", value)}
                placeholder="Enter IP asset title"
                required
              />

              <Textarea
                label="Description"
                value={formData.description as string}
                onChange={(value) => updateField("description", value)}
                placeholder="Describe your IP asset"
                rows={3}
              />
            </div>

            {/* Creators */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300">Creators</h4>
                <Button variant="ghost" size="sm" onClick={addCreator}>
                  Add Creator
                </Button>
              </div>

              {formData.creators?.map((creator, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Input
                      label="Name"
                      value={creator.name}
                      onChange={(value) =>
                        updateCreatorField(index, "name", value)
                      }
                      placeholder="Creator name"
                    />
                    <Input
                      label="Address"
                      value={creator.address}
                      onChange={(value) =>
                        updateCreatorField(index, "address", value)
                      }
                      placeholder="0x..."
                    />
                    <Input
                      label="Contribution %"
                      type="number"
                      value={creator.contributionPercent.toString()}
                      onChange={(value) =>
                        updateCreatorField(
                          index,
                          "contributionPercent",
                          parseInt(value) || 0
                        )
                      }
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
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300">
                License Terms
              </h4>

              <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                {/* License Type Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-200">
                    License Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-3 rounded-lg border transition-all ${
                        licenseType === "nonCommercial"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                      }`}
                      onClick={() => handleLicenseTypeChange("nonCommercial")}
                    >
                      <div className="text-sm font-medium">Non-Commercial</div>
                      <div className="text-xs mt-1">Social Remixing</div>
                    </button>
                    <button
                      type="button"
                      className={`p-3 rounded-lg border transition-all ${
                        licenseType === "commercial"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                      }`}
                      onClick={() => handleLicenseTypeChange("commercial")}
                    >
                      <div className="text-sm font-medium">Commercial</div>
                      <div className="text-xs mt-1">Remix License</div>
                    </button>
                  </div>
                </div>

                {/* License Details */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-sm font-medium text-slate-200">
                    License Details
                  </h5>

                  {licenseType === "nonCommercial" ? (
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>Commercial Use:</span>
                        <span className="text-red-400">Not Allowed</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Derivatives:</span>
                        <span className="text-green-400">Allowed</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attribution Required:</span>
                        <span className="text-green-400">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reciprocal Licensing:</span>
                        <span className="text-green-400">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minting Fee:</span>
                        <span className="text-slate-400">Free</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Commercial Revenue Share %"
                          type="number"
                          value={commercialTerms.commercialRevShare.toString()}
                          onChange={(value) =>
                            updateCommercialTerms(
                              "commercialRevShare",
                              parseInt(value) || 0
                            )
                          }
                          placeholder="5"
                          min="0"
                          max="100"
                        />
                        <Input
                          label="Default Minting Fee (WIP)"
                          type="number"
                          value={commercialTerms.defaultMintingFee}
                          onChange={(value) =>
                            updateCommercialTerms("defaultMintingFee", value)
                          }
                          placeholder="1"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex justify-between">
                          <span>Commercial Use:</span>
                          <span className="text-green-400">Allowed</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Derivatives:</span>
                          <span className="text-green-400">Allowed</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attribution Required:</span>
                          <span className="text-green-400">Yes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reciprocal Licensing:</span>
                          <span className="text-green-400">Yes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Currency:</span>
                          <span className="text-slate-400">WIP Token</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* License Summary */}
                <div className="p-3 bg-slate-800/50 rounded border border-slate-600">
                  <h6 className="text-xs font-medium text-slate-300 mb-2">
                    Summary
                  </h6>
                  <p className="text-xs text-slate-400">
                    {licenseType === "nonCommercial"
                      ? "This license allows non-commercial sharing and remixing with attribution. Derivatives must be shared under similar terms."
                      : "This license allows commercial use and remixing. Revenue sharing and minting fees apply to commercial derivatives."}
                  </p>
                </div>
              </div>
            </div>

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
              <Button variant="ghost" className="flex-1" onClick={onClose}>
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
