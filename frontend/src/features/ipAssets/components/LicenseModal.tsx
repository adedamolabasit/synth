import { FileText, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { formatDate } from "../utils/formatter";
import type { Video } from "../types";
import { useIp } from "../../../provider/IpContext";
import { useStory } from "../hooks/useStory";


interface LicenseModalProps {
  video: Video;
  onClose: () => void;
}

export function LicenseModal({ video, onClose }: LicenseModalProps) {
  const { ipId } = useIp();
  const { licenses, loading, error } = useStory(ipId);

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
    return (parseInt(wei) / 1e18).toString();
  };

  const formatBasisPoints = (bps: number) => {
    return bps / 1000000;
  };

  const handleViewLicenseTerms = (license: any) => {
    if (license.terms.uri) {
      window.open(license.terms.uri, "_blank");
    } else if (license.templateMetadataUri) {
      window.open(license.templateMetadataUri, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-lg font-semibold text-white">
              Loading Licenses
            </h3>
            <p className="text-slate-400 text-center text-sm">
              Fetching license information for {video.metadata.name}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-white text-center">
              Failed to Load Licenses
            </h3>
            <p className="text-slate-400 text-center text-sm">
              {error || "An error occurred while fetching license information"}
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                License Terms - {video.metadata.name}
              </h3>
              {licenses && licenses.length > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  {licenses.length} license{licenses.length !== 1 ? "s" : ""}{" "}
                  attached
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Close
            </Button>
          </div>

          {licenses && licenses.length > 0 ? (
            <div className="space-y-4 mb-6">
              {licenses.map((license, index) => (
                <Card
                  key={license.licenseTermsId || index}
                  className="p-4 border border-slate-700 relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white text-base">
                        {getLicenseName(license)}
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Template: {license.templateName}
                      </p>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h5 className="font-medium text-white">
                        Financial Terms
                      </h5>
                      {license.terms.defaultMintingFee && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Minting Fee:</span>
                          <span className="text-white">
                            {formatWeiToIp(license.terms.defaultMintingFee)} IP{" "}
                          </span>
                        </div>
                      )}
                      {license.terms.commercialRevShare > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Revenue Share:</span>
                          <span className="text-white">
                            {formatBasisPoints(
                              license.terms.commercialRevShare
                            )}
                            %
                          </span>
                        </div>
                      )}
                      {license.terms.commercialRevCeiling &&
                        parseInt(license.terms.commercialRevCeiling) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Revenue Ceiling:
                            </span>
                            <span className="text-white">
                              {formatWeiToIp(
                                license.terms.commercialRevCeiling
                              )}{" "}
                              {formatCurrency(license.terms.currency)}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-white">Usage Rights</h5>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Derivatives Allowed:
                        </span>
                        <span
                          className={
                            license.terms.derivativesAllowed
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {license.terms.derivativesAllowed ? "Yes" : "No"}
                        </span>
                      </div>
                      {license.terms.derivativesAllowed && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Derivatives Approval:
                            </span>
                            <span
                              className={
                                license.terms.derivativesApproval
                                  ? "text-green-400"
                                  : "text-yellow-400"
                              }
                            >
                              {license.terms.derivativesApproval
                                ? "Required"
                                : "Not Required"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Reciprocal Terms:
                            </span>
                            <span
                              className={
                                license.terms.derivativesReciprocal
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {license.terms.derivativesReciprocal
                                ? "Yes"
                                : "No"}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transferable:</span>
                        <span
                          className={
                            license.terms.transferable
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {license.terms.transferable ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <h5 className="font-medium text-white">
                        Additional Information
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs w-3/4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Attribution:</span>
                          <span
                            className={
                              license.terms.commercialAttribution
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {license.terms.commercialAttribution
                              ? "Required"
                              : "Not Required"}
                          </span>
                        </div>
                        {license.terms.expiration &&
                          parseInt(license.terms.expiration) > 0 && (
                            <div className="flex gap-3">
                              <span className="text-slate-400">
                                Expiration:
                              </span>
                              <span className="text-white">
                                {parseInt(license.terms.expiration) === 0
                                  ? "Never"
                                  : `${license.terms.expiration} blocks`}
                              </span>
                            </div>
                          )}
                        <div className="flex gap-3">
                          <span className="text-slate-400">Created:</span>
                          <span className="text-white">
                            {formatDate(license.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-slate-400">License ID:</span>
                          <span className="text-white font-mono text-xs">
                            {license.licenseTermsId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-400 mb-2">No license terms attached</p>
              <p className="text-slate-500 text-sm">
                Attach license terms to define how others can use your IP
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button variant="primary" className="flex-1">
              Mint License
            </Button>
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
