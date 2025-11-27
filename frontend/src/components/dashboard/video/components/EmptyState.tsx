import { FileVideo } from "lucide-react";

interface EmptyStateProps {
  activeTab: "all" | "your";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
  return (
    <div className="text-center py-12">
      <FileVideo className="mx-auto text-slate-400 mb-4" size={48} />
      <h3 className="text-lg text-slate-300 mb-2">No videos found</h3>
      <p className="text-slate-500">
        {activeTab === "all"
          ? "No published videos available."
          : "You haven't uploaded any videos yet."}
      </p>
    </div>
  );
};