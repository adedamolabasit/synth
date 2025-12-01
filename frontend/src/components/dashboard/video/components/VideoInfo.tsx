import { Button } from "../../../ui/Button";
import { Card } from "../../../ui/Card";
import { Video } from "..";
import {
  Download,
  Eye,
  FileText,
  Coins,
  BadgeCheck,
  BadgeX,
  Loader2,
  ExternalLink,
  Users,
  Share2,
  DollarSign,
} from "lucide-react";
import {
  formatFileSize,
  formatDate,
  formatDuration,
} from "../utils/videoUtils";
import { useState } from "react";
import { Badge } from "../../../ui/Badge";
import { useStory } from "../../ipAssets/hooks/useStory";
import { useStoryClient } from "../../../../story/client/storyClient";
import { MintIpLicense } from "../../ipAssets/actions/MintIpLicense";

interface VideoInfoProps {
  video: Video;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  const [activeTab, setActiveTab] = useState<"info" | "licenses">("info");
  const [tipAmount, setTipAmount] = useState("0.1");
  const [showTipInput, setShowTipInput] = useState(false);
  const { licenses, loading, error } = useStory(video.ipRegistration?.ipId);
  const isIpRegistered = video.ipRegistration?.status === "registered";
  const hasLicenses = licenses && licenses.length > 0;
  const client = useStoryClient();

  const getLicenseName = (license: any) => {
    if (license.templateName === "pil") {
      if (license.terms.commercialUse) {
        return "Commercial Remix License";
      } else {
        return "Non-Commercial License";
      }
    }
    return license.templateName || "Custom License";
  };

  const formatCurrency = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      "0x1514000000000000000000000000000000000000": "IP",
    };
    return currencyMap[currency] || currency;
  };

  const formatWeiToIp = (wei: string) => {
    return parseInt(wei) / 1e18;
  };

  const formatBasisPoints = (bps: number) => {
    return bps / 1000000;
  };

  const formatExpiration = (expiration: string) => {
    if (expiration === "0" || parseInt(expiration) === 0) {
      return "Never";
    }
    return `${expiration} blocks`;
  };

  const handleViewLicenseTerms = (license: any) => {
    if (license.terms.uri) {
      window.open(license.terms.uri, "_blank");
    } else if (license.templateMetadataUri) {
      window.open(license.templateMetadataUri, "_blank");
    }
  };

  const handleTipCreator = () => {
    if (tipAmount && parseFloat(tipAmount) > 0) {
      setShowTipInput(false);
      setTipAmount("0.1");
    }
  };

  const handleMintLicense = async (mintFee: number, licenseId: number) => {
    try {
      const amount = formatWeiToIp(mintFee.toString());
      console.log(amount, "fs");
      const mintData = {
        ipId: video.ipRegistration?.ipId as `0x${string}`,
        licensstermId: licenseId,
      };
      const response = await MintIpLicense(client!, mintData);
    } catch (error) {}
  };

  if (activeTab === "licenses" && loading) {
    return (
      <Card className="h-auto flex flex-col">
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-white">
              Video Information
            </h4>
            <div className="flex items-center gap-2">
              {isIpRegistered ? (
                <BadgeCheck className="text-green-400" size={20} />
              ) : (
                <BadgeX className="text-amber-400" size={20} />
              )}
              <span
                className={`text-sm font-medium ${
                  isIpRegistered ? "text-green-400" : "text-amber-400"
                }`}
              >
                {isIpRegistered ? "IP Registered" : "IP Not Registered"}
              </span>
            </div>
          </div>

          <div className="flex border-b border-slate-700 -mx-4 -mb-4">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors `}
              onClick={() => setActiveTab("info")}
            >
              Information
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "licenses"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
              onClick={() => setActiveTab("licenses")}
            >
              Licenses ({hasLicenses ? licenses.length : 0})
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 bg-slate-800/50 h-96 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-lg font-semibold text-white">
              Loading Licenses
            </h3>
            <p className="text-slate-400 text-center text-sm">
              Fetching license information...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (activeTab === "licenses" && error) {
    return (
      <Card className="h-auto flex flex-col">
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-white">
              Video Information
            </h4>
            <div className="flex items-center gap-2">
              {isIpRegistered ? (
                <BadgeCheck className="text-green-400" size={20} />
              ) : (
                <BadgeX className="text-amber-400" size={20} />
              )}
              <span
                className={`text-sm font-medium ${
                  isIpRegistered ? "text-green-400" : "text-amber-400"
                }`}
              >
                {isIpRegistered ? "IP Registered" : "IP Not Registered"}
              </span>
            </div>
          </div>

          <div className="flex border-b border-slate-700 -mx-4 -mb-4">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors `}
              onClick={() => setActiveTab("info")}
            >
              Information
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "licenses"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
              onClick={() => setActiveTab("licenses")}
            >
              Licenses ({hasLicenses ? licenses.length : 0})
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 bg-slate-800/50 h-96 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-white text-center">
              Failed to Load Licenses
            </h3>
            <p className="text-slate-400 text-center text-sm">
              {error || "An error occurred while fetching license information"}
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-auto flex flex-col">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-semibold text-white">
            Video Information
          </h4>
          <div className="flex items-center gap-2">
            {isIpRegistered ? (
              <BadgeCheck className="text-green-400" size={20} />
            ) : (
              <BadgeX className="text-amber-400" size={20} />
            )}
            <span
              className={`text-sm font-medium ${
                isIpRegistered ? "text-green-400" : "text-amber-400"
              }`}
            >
              {isIpRegistered ? "IP Registered" : "IP Not Registered"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 -mx-4 -mb-4">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "info"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Information
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "licenses"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("licenses")}
          >
            Licenses ({hasLicenses ? licenses.length : 0})
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 bg-slate-800/50 h-96 overflow-y-auto">
        {activeTab === "info" ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Status:</span>
              <span
                className={`text-sm font-medium ${
                  video.publication === "published"
                    ? "text-green-400"
                    : "text-amber-400"
                }`}
              >
                {video.publication === "published" ? "Published" : "Draft"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">IP Status:</span>
              <span
                className={`text-sm font-medium ${
                  isIpRegistered ? "text-green-400" : "text-amber-400"
                }`}
              >
                {isIpRegistered ? "Registered" : "Not Registered"}
              </span>
            </div>

            {isIpRegistered && video.ipRegistration?.ipId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">IP ID:</span>
                <span className="text-white text-sm font-mono">
                  {video.ipRegistration.ipId.slice(0, 8)}...
                  {video.ipRegistration.ipId.slice(-6)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Size:</span>
              <span className="text-white text-sm">
                {formatFileSize(video.metadata.size)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Type:</span>
              <span className="text-white text-sm uppercase">
                {video.metadata.type?.split("/")[1] || "video"}
              </span>
            </div>

            {video.metadata.duration && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Duration:</span>
                <span className="text-white text-sm">
                  {formatDuration(video.metadata.duration)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Uploaded:</span>
              <span className="text-white text-sm">
                {formatDate(video.createdAt)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Creator:</span>
              <span className="text-white text-sm font-mono">
                {video.walletAddress.slice(0, 8)}...
                {video.walletAddress.slice(-6)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Support Creator:</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTipInput(!showTipInput)}
                  className="flex items-center gap-1"
                >
                  <Coins size={14} />
                  Tip
                </Button>
              </div>

              {showTipInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    placeholder="0.1"
                  />
                  <span className="text-slate-400 text-sm self-center">IP</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleTipCreator}
                  >
                    Send
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <h5 className="text-sm font-medium text-slate-300 mb-2">
                IPFS Hash
              </h5>
              <div className="bg-slate-800/50 rounded-lg p-2">
                <code className="text-xs text-slate-300 break-all">
                  {video.videoHash}
                </code>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-800/50">
              <Button
                variant="secondary"
                className="flex-1"
                icon={<Download size={16} />}
                onClick={() => window.open(video.videoUrl, "_blank")}
              >
                Download
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                icon={<Eye size={16} />}
                onClick={() => window.open(video.videoUrl, "_blank")}
              >
                View Original
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!isIpRegistered ? (
              <div className="text-center py-8">
                <FileText className="mx-auto text-slate-400 mb-3" size={32} />
                <p className="text-slate-400 text-sm mb-4">
                  Video hasn't been licensed
                </p>
              </div>
            ) : !hasLicenses ? (
              <div className="text-center py-8">
                <FileText className="mx-auto text-slate-400 mb-3" size={32} />
                <p className="text-slate-400 text-sm mb-4">
                  Video hasn't been licensed
                </p>
                <div className="flex gap-3">
                  <Button variant="primary" size="sm">
                    Mint License
                  </Button>
                  <Button variant="secondary" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              licenses.map((license, index) => (
                <div
                  key={license.licenseTermsId || index}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-400" size={20} />
                      <div>
                        <h4 className="font-semibold text-white text-base">
                          {getLicenseName(license)}
                        </h4>
                        <p className="text-sm text-slate-400">
                          License Terms ID: {license.licenseTermsId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          license.terms.commercialUse ? "success" : "info"
                        }
                        size="sm"
                      >
                        {license.terms.commercialUse
                          ? "Commercial"
                          : "Non-Commercial"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLicenseTerms(license)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        View
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <DollarSign size={14} />
                        Financial Terms
                      </h5>
                      <div className="space-y-2 ml-6">
                        {license.terms.defaultMintingFee && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">
                              Minting Fee:
                            </span>
                            <span className="text-white text-sm">
                              {formatWeiToIp(license.terms.defaultMintingFee)}{" "}
                              IP
                            </span>
                          </div>
                        )}
                        {license.terms.commercialRevShare > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">
                              Revenue Share:
                            </span>
                            <span className="text-white text-sm">
                              {formatBasisPoints(
                                license.terms.commercialRevShare
                              )}
                              %
                            </span>
                          </div>
                        )}
                        {license.terms.commercialRevCeiling &&
                          parseInt(license.terms.commercialRevCeiling) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">
                                Revenue Ceiling:
                              </span>
                              <span className="text-white text-sm">
                                {formatWeiToIp(
                                  license.terms.commercialRevCeiling
                                )}{" "}
                                IP
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Share2 size={14} />
                        Usage Rights
                      </h5>
                      <div className="space-y-2 ml-6">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">
                            Derivatives Allowed:
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              license.terms.derivativesAllowed
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {license.terms.derivativesAllowed ? "Yes" : "No"}
                          </span>
                        </div>
                        {license.terms.derivativesAllowed && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">
                                Derivatives Approval:
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  license.terms.derivativesApproval
                                    ? "text-amber-400"
                                    : "text-green-400"
                                }`}
                              >
                                {license.terms.derivativesApproval
                                  ? "Required"
                                  : "Not Required"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">
                                Reciprocal Terms:
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  license.terms.derivativesReciprocal
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {license.terms.derivativesReciprocal
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">
                            Transferable:
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              license.terms.transferable
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {license.terms.transferable ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Users size={14} />
                        Additional Terms
                      </h5>
                      <div className="space-y-2 ml-6">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">
                            Attribution Required:
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              license.terms.commercialAttribution
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {license.terms.commercialAttribution ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">
                            Expiration:
                          </span>
                          <span className="text-white text-sm">
                            {formatExpiration(license.terms.expiration)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">
                            Currency:
                          </span>
                          <span className="text-white text-sm">
                            {formatCurrency(license.terms.currency)}
                          </span>
                        </div>
                        {license.createdAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">
                              Created:
                            </span>
                            <span className="text-white text-sm">
                              {formatDate(license.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-700">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() =>
                        handleMintLicense(
                          license.terms.defaultMintingFee,
                          license.licenseTermsId
                        )
                      }
                    >
                      Mint License
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      Download license
                    </Button>
                  </div>

                  {index < licenses.length - 1 && (
                    <div className="border-t border-slate-700 pt-4"></div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
