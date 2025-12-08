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

/**
 * LicenseModal
 * 
 * Displays license information for a video IP asset, showing how others can use, remix,
 * or commercialize the content. Handles loading, error, and empty states for better UX.
 * 
 * This modal is critical for transparency in IP licensing, allowing creators to see
 * exactly what permissions they've granted to others.
 */
export function LicenseModal({ video, onClose }: LicenseModalProps) {
  // ============================================================================
  // Data Fetching & State Management
  // ============================================================================
  
  // The IP ID is required to fetch specific license information from the blockchain
  // Without a valid IP ID, we cannot retrieve accurate license data
  const { ipId } = useIp();
  
  // Fetch licenses associated with this IP asset from Story Protocol
  // This hook abstracts the complexity of blockchain interactions
  const { licenses, loading, error } = useStory(ipId);

  // ============================================================================
  // License Data Formatting & Helper Functions
  // ============================================================================
  
  // Determine a user-friendly name for different license types
  // Story Protocol has specific license templates (like PIL) that need readable names
  const getLicenseName = (license: any) => {
    if (license.templateName === "pil") {
      // PIL (Programmable IP License) can be commercial or non-commercial
      // This distinction affects how the IP can be monetized
      return license.terms.commercialUse
        ? "Commercial Remix License"
        : "Non-Commercial License";
    }
    return license.templateName || "Custom License";
  };

  // Convert blockchain currency addresses to human-readable names
  // Some addresses (like IP token) are hard to recognize in raw form
  const formatCurrency = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      "0x1514000000000000000000000000000000000000": "IP",
    };
    return currencyMap[currency] || currency;
  };

  // Convert Wei (smallest ETH unit) to IP tokens for display
  // Blockchain stores values in Wei, but users think in whole tokens
  const formatWeiToIp = (wei: string) => {
    return (parseInt(wei) / 1e18).toString();
  };

  // Convert basis points (used in revenue sharing) to percentages
  // Story Protocol uses basis points (1/10000) for precision in revenue calculations
  const formatBasisPoints = (bps: number) => bps / 1000000;

  // Open the full license terms in a new tab for detailed viewing
  // Many licenses have comprehensive legal documents stored at URIs
  const handleViewLicenseTerms = (license: any) => {
    const uri = license.terms.uri || license.templateMetadataUri;
    if (uri) window.open(uri, "_blank");
  };

  // ============================================================================
  // Loading State
  // ============================================================================
  // Show loading indicator while fetching blockchain data
  // Blockchain queries can take variable time depending on network conditions
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

  // ============================================================================
  // Error State
  // ============================================================================
  // Handle errors gracefully - blockchain calls can fail due to network issues,
  // invalid IP IDs, or smart contract problems
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

  // ============================================================================
  // Main Modal Content
  // ============================================================================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header with license count */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                License Terms - {video.metadata.name}
              </h3>
              {/* Show license count to help users understand the scope of permissions */}
              {licenses?.length > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  {licenses.length} license{licenses.length !== 1 ? "s" : ""} attached
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

          {/* License List - Show all licenses attached to this IP asset */}
          {/* A single IP can have multiple licenses for different use cases */}
          {licenses && licenses.length > 0 ? (
            <div className="space-y-4 mb-6">
              {licenses.map((license, index) => (
                <Card
                  key={license.licenseTermsId || index}
                  className="p-4 border border-slate-700 relative"
                >
                  {/* License Header with type and actions */}
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
                      {/* Badge shows commercial vs non-commercial at a glance */}
                      <Badge
                        variant={license.terms.commercialUse ? "success" : "info"}
                        size="sm"
                      >
                        {license.terms.commercialUse ? "Commercial" : "Non-Commercial"}
                      </Badge>
                      {/* View button opens full license terms for legal review */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLicenseTerms(license)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink size={14} /> View
                      </Button>
                    </div>
                  </div>

                  {/* License Details Grid - Organized by category for clarity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Financial Terms - Shows monetization aspects of the license */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-white">Financial Terms</h5>
                      {/* Minting fee is what someone pays to create a derivative */}
                      {license.terms.defaultMintingFee && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Minting Fee:</span>
                          <span className="text-white">
                            {formatWeiToIp(license.terms.defaultMintingFee)} IP
                          </span>
                        </div>
                      )}
                      {/* Revenue share is percentage the original creator gets from sales */}
                      {license.terms.commercialRevShare > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Revenue Share:</span>
                          <span className="text-white">
                            {formatBasisPoints(license.terms.commercialRevShare)}%
                          </span>
                        </div>
                      )}
                      {/* Revenue ceiling caps total payments for high-volume usage */}
                      {license.terms.commercialRevCeiling &&
                        parseInt(license.terms.commercialRevCeiling) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Revenue Ceiling:</span>
                            <span className="text-white">
                              {formatWeiToIp(license.terms.commercialRevCeiling)}{" "}
                              {formatCurrency(license.terms.currency)}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Usage Rights - Defines what can be done with the licensed content */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-white">Usage Rights</h5>
                      {/* Derivatives allowed - Can others create remixes/adaptations? */}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Derivatives Allowed:</span>
                        <span className={license.terms.derivativesAllowed ? "text-green-400" : "text-red-400"}>
                          {license.terms.derivativesAllowed ? "Yes" : "No"}
                        </span>
                      </div>
                      {/* Show derivative-specific terms only if derivatives are allowed */}
                      {license.terms.derivativesAllowed && (
                        <>
                          {/* Approval required - Does original creator need to approve each derivative? */}
                          <div className="flex justify-between">
                            <span className="text-slate-400">Derivatives Approval:</span>
                            <span className={license.terms.derivativesApproval ? "text-green-400" : "text-yellow-400"}>
                              {license.terms.derivativesApproval ? "Required" : "Not Required"}
                            </span>
                          </div>
                          {/* Reciprocal terms - Must derivatives use same license? */}
                          <div className="flex justify-between">
                            <span className="text-slate-400">Reciprocal Terms:</span>
                            <span className={license.terms.derivativesReciprocal ? "text-green-400" : "text-red-400"}>
                              {license.terms.derivativesReciprocal ? "Yes" : "No"}
                            </span>
                          </div>
                        </>
                      )}
                      {/* Transferable - Can the license be sold or transferred to others? */}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transferable:</span>
                        <span className={license.terms.transferable ? "text-green-400" : "text-red-400"}>
                          {license.terms.transferable ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    {/* Additional Information - Metadata and technical details */}
                    <div className="space-y-2 md:col-span-2">
                      <h5 className="font-medium text-white">Additional Information</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs w-3/4">
                        {/* Attribution - Must derivative creators credit the original? */}
                        <div className="flex justify-between">
                          <span className="text-slate-400">Attribution:</span>
                          <span className={license.terms.commercialAttribution ? "text-green-400" : "text-red-400"}>
                            {license.terms.commercialAttribution ? "Required" : "Not Required"}
                          </span>
                        </div>
                        {/* Expiration - Does the license expire after certain time/blocks? */}
                        {license.terms.expiration && parseInt(license.terms.expiration) > 0 && (
                          <div className="flex gap-3">
                            <span className="text-slate-400">Expiration:</span>
                            <span className="text-white">
                              {parseInt(license.terms.expiration) === 0
                                ? "Never"
                                : `${license.terms.expiration} blocks`}
                            </span>
                          </div>
                        )}
                        {/* Creation date - When was this license created on-chain? */}
                        <div className="flex gap-3">
                          <span className="text-slate-400">Created:</span>
                          <span className="text-white">{formatDate(license.createdAt)}</span>
                        </div>
                        {/* License ID - Unique blockchain identifier for this license */}
                        <div className="flex gap-3">
                          <span className="text-slate-400">License ID:</span>
                          <span className="text-white font-mono text-xs">{license.licenseTermsId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // ============================================================================
            // Empty State - No licenses attached to this IP
            // ============================================================================
            // This state encourages users to add licenses if they want to enable usage
            <div className="text-center py-8 mb-6">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-400 mb-2">No license terms attached</p>
              <p className="text-slate-500 text-sm">
                Attach license terms to define how others can use your IP
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            {/* Mint License button - Future functionality to create new licenses */}
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