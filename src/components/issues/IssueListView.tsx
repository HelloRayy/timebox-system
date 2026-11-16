import React, { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Timer } from "lucide-react";
import { TaskItem } from "@/types/task";
import { ISSUE_STATES, IssueStateIcon } from "./IssueStateIcon";
import { PriorityBadge } from "@/components/board/PriorityBadge";

export interface IssueListViewProps {
  issues: TaskItem[];
  onSelectIssue: (issueId: string) => void;
  onSendToTimebox: (issueId: string) => void;
}

export const IssueListView: React.FC<IssueListViewProps> = ({
  issues,
  onSelectIssue,
  onSendToTimebox,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#131415] custom-scrollbar pb-16">
      {ISSUE_STATES.map((group) => {
        const groupIssues = issues.filter((i) => i.state === group.id);
        const isCollapsed = !!collapsedGroups[group.id];

        return (
          <div key={group.id} className="border-b border-white/[0.06]">
            {/* Group Header ala Plane List */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full px-4 py-2.5 bg-[#161719] hover:bg-[#1C1D1F] flex items-center justify-between text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
                )}
                <IssueStateIcon state={group.id} className="w-4 h-4" />
                <span className="text-[13px] font-medium text-[#F0F0F0] font-sans">
                  {group.label}
                </span>
                <span className="text-[11px] text-[#6B7280] font-sans tabular-nums">
                  {groupIssues.length}
                </span>
              </div>
            </button>

            {/* Rows */}
            {!isCollapsed && (
              <div className="divide-y divide-white/[0.04]">
                {groupIssues.length === 0 ? (
                  <div className="px-10 py-3 text-[12px] text-[#525866] font-sans">
                    Belum ada work item di {group.label}.
                  </div>
                ) : (
                  groupIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue(issue.id)}
                      className="group px-4 py-2.5 hover:bg-[#1C1D1F] flex items-center justify-between gap-4 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <IssueStateIcon state={issue.state} className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-medium text-[#6B7280] font-sans w-14 shrink-0">
                          {issue.identifier}
                        </span>
                        <span className="text-[13px] font-medium text-[#F0F0F0] font-sans truncate">
                          {issue.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge priority={issue.priority} />
                        <span className="inline-flex items-center gap-1 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-[#9EA3AE] font-sans">
                          <Clock className="w-3 h-3 text-[#6B7280]" />
                          {issue.durationMinutes}m
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendToTimebox(issue.id);
                          }}
                          className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium font-sans flex items-center gap-1 transition cursor-pointer ${
                            issue.inTimebox
                              ? "bg-[#3F76FF]/15 text-[#3F76FF] border border-[#3F76FF]/30"
                              : "bg-white/[0.05] text-[#9EA3AE] hover:text-[#F0F0F0] hover:bg-white/[0.1]"
                          }`}
                        >
                          <Timer className="w-3 h-3" />
                          <span>{issue.inTimebox ? "In Timebox" : "Timebox"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
