import { FileVideo, Shield, DollarSign, Users } from "lucide-react";
import { Card } from "../../../components/ui/Card";

interface StatsGridProps {
  totalVideos: number;
  registeredVideos: number;
  totalRevenue: number;
  totalCollaborators: number;
}

export function StatsGrid({ 
  totalVideos, 
  registeredVideos, 
  totalRevenue, 
  totalCollaborators 
}: StatsGridProps) {
  const stats = [
    {
      label: "Total Videos",
      value: totalVideos,
      icon: FileVideo,
      color: "text-blue-400"
    },
    {
      label: "IP Registered",
      value: registeredVideos,
      icon: Shield,
      color: "text-emerald-400"
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue}`,
      icon: DollarSign,
      color: "text-amber-400"
    },
    {
      label: "Collaborators",
      value: totalCollaborators,
      icon: Users,
      color: "text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">{stat.label}</span>
            <stat.icon className={stat.color} size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}