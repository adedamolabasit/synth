import { Home, Video, Box, FileText } from "lucide-react";
import { ReactNode } from "react";

interface NavItem {
  icon: ReactNode;
  label: string;
  id: string;
  active?: boolean;
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems: NavItem[] = [
    { icon: <Home size={20} />, label: "Workspace", id: "workspace" },
    { icon: <Video size={20} />, label: "Media", id: "media" },
    { icon: <Box size={20} />, label: "IP Assets", id: "ip" },
    { icon: <FileText size={20} />, label: "Import", id: "import" },
  ];

  return (
    <aside className="w-20 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col items-center py-6 gap-2">
      <div className="mb-8 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
        <span className="text-white font-bold text-xl">S</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              group relative w-full aspect-square rounded-xl
              flex flex-col items-center justify-center gap-1
              transition-all duration-250
              ${
                activeView === item.id
                  ? "bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }
            `}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>

            {activeView === item.id && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-l-full" />
            )}
          </button>
        ))}
      </nav>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-magenta-500 to-purple-500 border-2 border-slate-700 cursor-pointer hover:scale-110 transition-transform" />
    </aside>
  );
}
