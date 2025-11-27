import { Box } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ 
  title = "IP Assets Management", 
  subtitle = "Manage your video IP assets" 
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Box className="text-blue-400" size={20} /> 
        {title}
      </h2>
      <div className="text-sm text-slate-400">
        {subtitle}
      </div>
    </div>
  );
}