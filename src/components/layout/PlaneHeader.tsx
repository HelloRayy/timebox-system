import React from "react";
import {
  ChevronRight,
  PanelLeftOpen,
  LayoutGrid,
  List,
  Plus,
  Search,
  Timer,
} from "lucide-react";
import { ActiveNavView, IssueLayoutMode, TaskItem } from "@/types/task";
import { formatTimer } from "@/lib/time";

export interface PlaneHeaderProps {
  activeNav: ActiveNavView;
  issueLayout: IssueLayoutMode;
  isSidebarCollapsed: boolean;
  searchQuery: string;
  activeTimerTask: TaskItem | null;
  secondsRemaining: number;
  isRunning: boolean;
  isPopupVisible: boolean;
  onExpandSidebar: () => void;
  onChangeIssueLayout: (mode: IssueLayoutMode) => void;
  onSearchChange: (q: string) => void;
  onOpenNewIssue: () => void;
  onShowPopup: () => void;
}

export const PlaneHeader: React.FC<PlaneHeaderProps> = ({
  activeNav,
  issueLayout,
  isSidebarCollapsed,
  searchQuery,
  activeTimerTask,
  secondsRemaining,
  isRunning,
  isPopupVisible,
  onExpandSidebar,
  onChangeIssueLayout,
  onSearchChange,
  onOpenNewIssue,
  onShowPopup,
}) => {
  return (
    <header className="h-12 border-b border-white/[0.08] bg-[#131415] px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left: Sidebar Toggle + Plane Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-sans">
        {isSidebarCollapsed && (
          <button
            onClick={onExpandSidebar}
            title="Buka Sidebar"
            className="p-1.5 rounded-[4px] text-[#9EA3AE] hover:text-[#F0F0F0] hover:bg-white/[0.05] transition cursor-pointer mr-1"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        <span className="text-[#9EA3AE] font-medium">Timebox Core</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#525866]" />
        <span className="text-[#F0F0F0] font-medium">
          {activeNav === "issues" ? "Issues" : "Timebox Board"}
        </span>
      </div>

      {/* Right: Search, Active Mini Timer Pill, View Switcher, Add Button */}
      <div className="flex items-center gap-2.5">
        {/* Mini Timer Indicator saat popup di-minimize */}
        {activeTimerTask && !isPopupVisible && (
          <button
            onClick={onShowPopup}
            title="Tampilkan Popup Timer"
            className="flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-[#1C1D1F] border border-white/[0.08] hover:border-[#3F76FF]/50 text-[12px] font-sans transition cursor-pointer"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <Timer className="w-3.5 h-3.5 text-[#3F76FF]" />
            <span className="font-medium text-[#F0F0F0] tabular-nums">
              {formatTimer(secondsRemaining)}
            </span>
          </button>
        )}

        {/* Search Box ala Plane */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter issues..."
            className="h-7 w-44 pl-8 pr-2.5 rounded-[5px] bg-[#1C1D1F] border border-white/[0.08] text-[12px] text-[#F0F0F0] placeholder:text-[#525866] focus:outline-none focus:border-[#3F76FF]/60 font-sans transition"
          />
        </div>

        {/* Layout Switcher (Kanban / List) hanya tampil di Issues */}
        {activeNav === "issues" && (
          <div className="flex items-center bg-[#1C1D1F] border border-white/[0.08] rounded-[5px] p-0.5">
            <button
              onClick={() => onChangeIssueLayout("kanban")}
              title="Kanban View"
              className={`px-2 py-1 rounded-[4px] flex items-center gap-1 text-[11px] font-medium font-sans transition cursor-pointer ${
                issueLayout === "kanban"
                  ? "bg-white/[0.08] text-[#F0F0F0]"
                  : "text-[#9EA3AE] hover:text-[#F0F0F0]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => onChangeIssueLayout("list")}
              title="List View"
              className={`px-2 py-1 rounded-[4px] flex items-center gap-1 text-[11px] font-medium font-sans transition cursor-pointer ${
                issueLayout === "list"
                  ? "bg-white/[0.08] text-[#F0F0F0]"
                  : "text-[#9EA3AE] hover:text-[#F0F0F0]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        )}

        {/* Primary CTA ala Plane */}
        <button
          onClick={onOpenNewIssue}
          className="h-7 px-2.5 rounded-[5px] bg-[#3F76FF] hover:bg-[#3364DB] active:scale-95 text-white text-[12px] font-medium font-sans flex items-center gap-1 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Work Item</span>
        </button>
      </div>
    </header>
  );
};
