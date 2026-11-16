import React from "react";
import {
  Layers,
  Timer,
  Plus,
  PanelLeftClose,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import { ActiveNavView } from "@/types/task";

export interface PlaneSidebarProps {
  activeNav: ActiveNavView;
  isCollapsed: boolean;
  issuesCount: number;
  timeboxCount: number;
  onSelectNav: (nav: ActiveNavView) => void;
  onToggleCollapse: () => void;
  onOpenNewIssue: () => void;
}

export const PlaneSidebar: React.FC<PlaneSidebarProps> = ({
  activeNav,
  isCollapsed,
  issuesCount,
  timeboxCount,
  onSelectNav,
  onToggleCollapse,
  onOpenNewIssue,
}) => {
  if (isCollapsed) return null;

  return (
    <aside className="w-[240px] h-full bg-[#161719] border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col">
        {/* Workspace Header ala Plane */}
        <div className="h-12 px-3 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-[5px] bg-[#3F76FF] text-white font-semibold text-12 flex items-center justify-center shrink-0">
              R
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#F0F0F0] truncate font-sans">
                raditya-rayhan
              </span>
            </div>
          </div>

          <button
            onClick={onToggleCollapse}
            title="Tutup Sidebar"
            className="p-1 rounded-[4px] text-[#6B7280] hover:text-[#F0F0F0] hover:bg-white/[0.05] transition cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action: New Work Item */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={onOpenNewIssue}
            className="w-full h-8 px-2.5 rounded-[6px] bg-[#1C1D1F] hover:bg-[#252629] border border-white/[0.08] text-[#F0F0F0] text-[12px] font-medium font-sans flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#9EA3AE]" />
            <span>New Work Item</span>
          </button>
        </div>

        {/* Workspace Navigation */}
        <div className="px-2 py-1.5 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] font-sans">
            Workspace
          </div>

          <button
            onClick={() => onSelectNav("issues")}
            className={`w-full px-2.5 py-1.5 rounded-[5px] flex items-center justify-between text-[13px] font-sans transition cursor-pointer ${
              activeNav === "issues"
                ? "bg-[#3F76FF]/15 text-[#3F76FF] font-medium"
                : "text-[#9EA3AE] hover:bg-white/[0.04] hover:text-[#F0F0F0]"
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Issues</span>
            </span>
            <span className="text-[11px] text-[#6B7280] tabular-nums">{issuesCount}</span>
          </button>

          <button
            onClick={() => onSelectNav("timebox")}
            className={`w-full px-2.5 py-1.5 rounded-[5px] flex items-center justify-between text-[13px] font-sans transition cursor-pointer ${
              activeNav === "timebox"
                ? "bg-[#3F76FF]/15 text-[#3F76FF] font-medium"
                : "text-[#9EA3AE] hover:bg-white/[0.04] hover:text-[#F0F0F0]"
            }`}
          >
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>Timebox Board</span>
            </span>
            <span className="text-[11px] text-[#6B7280] tabular-nums">{timeboxCount}</span>
          </button>
        </div>

        {/* Projects Section ala Plane */}
        <div className="px-2 py-2 mt-2 border-t border-white/[0.06] space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] font-sans">
            Projects
          </div>
          <div className="px-2.5 py-1.5 rounded-[5px] bg-white/[0.03] text-[#F0F0F0] flex items-center gap-2 text-[12px] font-medium font-sans">
            <FolderKanban className="w-3.5 h-3.5 text-[#3F76FF]" />
            <span className="truncate">TIME &bull; Timebox Core</span>
          </div>
        </div>
      </div>

      {/* Footer Offline Status */}
      <div className="p-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#6B7280] font-sans">
        <span className="flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          Local Tauri Mode
        </span>
        <span className="text-[10px] text-[#525866]">v0.2</span>
      </div>
    </aside>
  );
};
