import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input, Textarea } from "../../../components/ui/Input2";
import { formatDate, formatFileSize } from "../utils/formatter";
import { RegisterIPModalProps, IPRegistrationData } from "../types";
import { PILFlavor, WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { RegisterIpAsset } from "../story/RegisterIpAsset";
import { client } from "../../../story/config";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { parseEther } from "viem";
import { Loader2, CheckCircle } from "lucide-react";
import { useToastContext } from "../../../components/common/Toast/ToastProvider";

export function RegisterIPModal({
  video,
  onClose,
  updateVideoIpRegistration,
}: RegisterIPModalProps) {
  // ============================================================================
  // Wallet Connection & Authentication
  // ============================================================================
  // The user must connect their wallet to register IP assets, as the registration
  // needs a blockchain address for the asset owner and creator attribution.
  const { user, primaryWallet } = useDynamicContext();
  const isConnected = !!user;
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    // Sync wallet address when connection status changes
    if (isConnected && primaryWallet?.address) {
      setWalletAddr(primaryWallet.address);
    } else {
      setWalletAddr(null);
    }
  }, [isConnected, primaryWallet]);

  // ============================================================================
  // UI & Form State
  // ============================================================================
  const [licenseType, setLicenseType] = useState<
    "nonCommercial" | "commercial"
  >("nonCommercial");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Commercial license terms that can be configured by the user
  const [commercialTerms, setCommercialTerms] = useState({
    commercialRevShare: 5, // Default 5% revenue share for commercial derivatives
    defaultMintingFee: 1, // Default 1 WIP token minting fee
  });

  // ============================================================================
  // Form Data Initialization
  // ============================================================================
  // Pre-fill form with video metadata to reduce user input
  const [formData, setFormData] = useState<IPRegistrationData>({
    title: video.metadata.name,
    video: video,
    description: video.metadata.name,
    // Default to current user as the sole creator with 100% contribution
    creators: [
      {
        name: "",
        address: walletAddr as `0x${string}`,
        contributionPercent: 100,
      },
    ],
    // Start with non-commercial license by default (most common for new creators)
    licenseTerms: PILFlavor.nonCommercialSocialRemixing(),
  });

  // ============================================================================
  // Toast Notifications
  // ============================================================================
  // Used for user feedback during registration process
  const toast = useToastContext();

  // ============================================================================
  // Effects & Data Syncing
  // ============================================================================

  // Update license terms when license type changes or commercial terms are modified
  useEffect(() => {
    if (licenseType === "commercial") {
      // Convert default minting fee to Wei (smallest ETH unit) for blockchain compatibility
      const terms = PILFlavor.commercialRemix({
        commercialRevShare: commercialTerms.commercialRevShare,
        defaultMintingFee:
          BigInt(parseEther(commercialTerms.defaultMintingFee.toString())) || 1,
        currency: WIP_TOKEN_ADDRESS,
      });
      setFormData((prev) => ({
        ...prev,
        licenseTerms: terms,
      }));
    }
  }, [commercialTerms, licenseType]);

  // ============================================================================
  // Form Field Handlers
  // ============================================================================

  // Generic handler for top-level form fields
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle updates to specific creator fields while maintaining array structure
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

  // Update commercial license configuration
  const updateCommercialTerms = (field: string, value: any) => {
    setCommercialTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================================
  // Creator Management
  // ============================================================================

  // Add a new creator to support collaborative works
  const addCreator = () => {
    setFormData((prev) => ({
      ...prev,
      creators: [
        ...(prev.creators || []),
        { name: "", address: "" as `0x${string}`, contributionPercent: 0 },
      ],
    }));
  };

  // Remove a creator while ensuring at least one creator remains
  const removeCreator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      creators: prev.creators?.filter((_, i) => i !== index),
    }));
  };

  // ============================================================================
  // License Type Handling
  // ============================================================================

  // Switch between license types and update corresponding blockchain terms
  const handleLicenseTypeChange = (type: "nonCommercial" | "commercial") => {
    setLicenseType(type);
    if (type === "commercial") {
      // Commercial license includes revenue sharing and minting fees
      const terms = PILFlavor.commercialRemix({
        commercialRevShare: commercialTerms.commercialRevShare,
        defaultMintingFee: BigInt(
          parseEther(commercialTerms.defaultMintingFee.toString())
        ),
        currency: WIP_TOKEN_ADDRESS,
      });
      setFormData((prev) => ({
        ...prev,
        licenseTerms: terms,
      }));
    } else {
      // Non-commercial license is free but restricts commercial use
      const terms = PILFlavor.nonCommercialSocialRemixing();
      setFormData((prev) => ({
        ...prev,
        licenseTerms: terms,
      }));
    }
  };

  // ============================================================================
  // Form Validation
  // ============================================================================

  // Calculate total contribution percentage for validation
  // Must equal 100% to ensure proper revenue distribution
  const totalContribution =
    formData.creators?.reduce(
      (sum, creator) => sum + creator.contributionPercent,
      0
    ) || 0;

  // ============================================================================
  // Form Submission & IP Registration
  // ============================================================================

  // Main submission handler that validates form and calls blockchain registration
  const handleSubmit = async () => {
    // Prevent submission with empty title
    if (!formData.title.trim()) {
      toast.error("Validation Error", "Title is required");
      return;
    }

    // Ensure contribution percentages are properly allocated
    if (totalContribution !== 100) {
      toast.error("Validation Error", "Total contribution must equal 100%");
      return;
    }

    setIsLoading(true);

    const registrationData: IPRegistrationData = {
      ...formData,
    };

    try {
      // Call Story Protocol SDK to register IP on blockchain
      const response = await RegisterIpAsset(client!, registrationData);
      
      if (response?.status === "registered") {
        // Successfully registered on blockchain
        const ipRegistration = {
          ipId: response.ipId,
          tokenId: response.tokenId,
          status: response.status,
        };

        // Update parent component to reflect new IP registration
        await updateVideoIpRegistration(video, ipRegistration);

        // Show success state before closing
        setIsSuccess(true);

        // Notify user with options to view their IP assets
        toast.success(
          "Registration Successful!",
          `Your video "${video.metadata.name}" has been registered as an IP Asset.`,
          {
            duration: 5000,
            action: {
              label: "View IP Assets",
              onClick: () => {
                window.open("/ip-assets", "_blank");
              },
            },
          }
        );

        // Brief delay to let user see success message before modal closes
        setTimeout(() => {
          setIsLoading(false);
          onClose();
        }, 1500);
      } else {
        throw new Error("Registration failed with unknown status");
      }

      return response;
    } catch (error: any) {
      console.error("IP registration failed:", error);
      setIsLoading(false);

      // Show error with retry option since blockchain transactions can fail
      toast.error(
        "Registration Failed",
        error?.message || "IP registration failed. Please try again.",
        {
          duration: 5000,
          isPersistent: true,
          action: {
            label: "Retry",
            onClick: handleSubmit,
          },
        }
      );
    }
  };

  // ============================================================================
  // Component Render
  // ============================================================================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {isSuccess ? "Registration Complete!" : "Register IP Asset"}
            </h3>
            
            {/* Close button disabled during loading to prevent accidental closure */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                ✕
              </button>
            )}
          </div>

          {/* Success State - Shown after successful blockchain registration */}
          {isSuccess ? (
            <div className="space-y-6 py-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    IP Asset Registered Successfully!
                  </h4>
                  
                  <p className="text-slate-400">
                    Your video has been registered as an IP Asset on the Story
                    Protocol.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={onClose}
                    className="min-w-[200px]"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Form State - Main registration form */
            <div className="space-y-6">
              {/* Video Information Card - Displays metadata of the video being registered */}
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

              {/* Basic Information Section - Core IP asset metadata */}
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

              {/* Creators Section - Supports multiple creators with percentage allocation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-300">
                    Creators
                  </h4>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addCreator}
                    disabled={isLoading}
                  >
                    Add Creator
                  </Button>
                </div>

                {/* Creator List - Each creator gets name, address, and contribution % */}
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
                        value={walletAddr as string}
                        onChange={(value) =>
                          updateCreatorField(index, "address", value)
                        }
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
                    
                    {/* Allow removal only if multiple creators exist */}
                    {formData.creators && formData.creators.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCreator(index)}
                        className="text-red-400 hover:text-red-300 mt-6"
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                {/* Contribution Validation - Helps users correct percentage allocations */}
                {totalContribution !== 100 && (
                  <p className="text-amber-400 text-sm">
                    Total contribution: {totalContribution}% (must equal 100%)
                  </p>
                )}
              </div>

              {/* License Terms Section - Determines how others can use this IP */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-300">
                  License Terms
                </h4>

                <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                  {/* License Type Selection - Commercial vs Non-commercial */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-200">
                      License Type
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Non-Commercial Option - Free, for sharing and remixing */}
                      <button
                        type="button"
                        className={`p-3 rounded-lg border transition-all ${
                          licenseType === "nonCommercial"
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleLicenseTypeChange("nonCommercial")}
                        disabled={isLoading}
                      >
                        <div className="text-sm font-medium">
                          Non-Commercial
                        </div>
                        <div className="text-xs mt-1">Social Remixing</div>
                      </button>

                      {/* Commercial Option - Monetizable with revenue sharing */}
                      <button
                        type="button"
                        className={`p-3 rounded-lg border transition-all ${
                          licenseType === "commercial"
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleLicenseTypeChange("commercial")}
                        disabled={isLoading}
                      >
                        <div className="text-sm font-medium">Commercial</div>
                        <div className="text-xs mt-1">Remix License</div>
                      </button>
                    </div>
                  </div>

                  {/* License Details - Show terms based on selected license type */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-sm font-medium text-slate-200">
                      License Details
                    </h5>

                    {licenseType === "nonCommercial" ? (
                      /* Non-Commercial Terms - Fixed terms, no configuration needed */
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
                      /* Commercial Terms - Configurable revenue share and minting fees */
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
                            value={commercialTerms.defaultMintingFee.toString()}
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

                  {/* License Summary - Plain English explanation of selected license */}
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

              {/* Action Buttons - Submit registration or cancel */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="primary"
                  className="flex-1 relative"
                  onClick={handleSubmit}
                  disabled={
                    !formData.title.trim() ||
                    totalContribution !== 100 ||
                    isLoading
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register IP Asset"
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}