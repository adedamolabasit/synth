import { FileText } from "lucide-react";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { Badge } from "../../../ui/Badge";
import { formatDate } from "../utils/formatter";
import type { Video, LicenseTerm } from "../types";

interface LicenseModalProps {
  video: Video;
  onAddLicense: (video: Video, license: LicenseTerm) => void;
  onClose: () => void;
}

export function LicenseModal({
  video,
  onAddLicense,
  onClose,
}: LicenseModalProps) {
  const handleAddMockLicense = () => {
    const newLicense: LicenseTerm = {
      id: Date.now().toString(),
      name: "Commercial License",
      type: "commercial",
      duration: "1 year",
      terms: "Full commercial rights for digital distribution",
      createdAt: new Date().toISOString(),
    };
    onAddLicense(video, newLicense);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            License Terms - {video.metadata.name}
          </h3>

          {video.licenseTerms && video.licenseTerms.length > 0 ? (
            <div className="space-y-3 mb-6">
              {video.licenseTerms.map((license) => (
                <Card key={license.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{license.name}</h4>
                    <Badge variant="info" size="sm">
                      {license.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Duration: {license.duration}</p>
                    <p>Terms: {license.terms}</p>
                    <p>Created: {formatDate(license.createdAt)}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-400">No license terms attached</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleAddMockLicense}
            >
              Attach License Terms
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
