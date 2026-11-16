import React, { useState } from "react";
import { Plus, Timer, Clock } from "lucide-react";
import { IssueState, TaskItem } from "@/types/task";
import { ISSUE_STATES, IssueStateIcon } from "./IssueStateIcon";
import { PriorityBadge } from "@/components/board/PriorityBadge";

export interface IssueKanbanViewProps {
  issues: TaskItem[];
  onSelectIssue: (issueId: string) => void;
  onMoveIssueState: (issueId: string, newState: IssueState) => void;
  onSendToTimebox: (issueId: string) => void;
  onQuickCreate: (state: IssueState, title: string) => void;
}

export const IssueKanbanView: React.FC<IssueKanbanViewProps> = ({
  issues,
  onSelectIssue,
  onMoveIssueState,
  onSendToTimebox,
  onQuickCreate,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverState, setDragOverState] = useState<IssueState | null>(null);
  const [addingState, setAddingState] = useState<IssueState | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  const handleQuickAddSubmit = (e: React.FormEvent, state: IssueState) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickCreate(state, quickTitle.trim());
    setQuickTitle("");
    setAddingState(null);
  };

  return (
    <div className="flex-1 h-full overflow-x-auto overflow-y-hidden p-4 flex gap-3.5 bg-[#131415] custom-scrollbar">
      {ISSUE_STATES.map((col) => {
        const colIssues = issues.filter((i) => i.state === col.id);
        const isOver = dragOverState === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverState(col.id);
            }}
            onDragLeave={() => setDragOverState(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverState(null);
              if (draggedId) {
                onMoveIssueState(draggedId, col.id);
                setDraggedId(null);
              }
            }}
            className={`w-[300px] shrink-0 h-full flex flex-col rounded-[8px] transition-colors ${
              isOver ? "bg-[#1C1D1F]/80 ring-1 ring-[#3F76FF]/40" : "bg-transparent"
            }`}
          >
            {/* Column Header ala Plane */}
            <div className="px-1.5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IssueStateIcon state={col.id} className="w-4 h-4" />
                <span className="text-[13px] font-medium text-[#F0F0F0] font-sans">
                  {col.label}
                </span>
                <span className="text-[11px] font-sans text-[#6B7280] bg-[#1C1D1F] px-1.5 py-0.5 rounded-[4px] border border-white/[0.06] tabular-nums">
                  {colIssues.length}
                </span>
              </div>

              <button
                onClick={() => {
                  setAddingState(col.id);
                  setQuickTitle("");
                }}
                title={`Tambah ke ${col.label}`}
                className="p-1 rounded-[4px] text-[#6B7280] hover:text-[#F0F0F0] hover:bg-white/[0.06] transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-6 custom-scrollbar">
              {addingState === col.id && (
                <form
                  onSubmit={(e) => handleQuickAddSubmit(e, col.id)}
                  className="p-2.5 rounded-[6px] border border-[#3F76FF]/50 bg-[#1C1D1F]"
                >
                  <input
                    autoFocus
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setAddingState(null);
                    }}
                    placeholder="Judul work item..."
                    className="w-full bg-transparent text-[13px] text-[#F0F0F0] placeholder:text-[#525866] focus:outline-none font-sans mb-2"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAddingState(null)}
                      className="px-2 py-1 text-[11px] text-[#9EA3AE] hover:text-[#F0F0F0] cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded-[4px] bg-[#3F76FF] text-white text-[11px] font-medium cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}

              {colIssues.map((issue) => (
                <div
                  key={issue.id}
                  draggable
                  onDragStart={() => setDraggedId(issue.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onClick={() => onSelectIssue(issue.id)}
                  className={`group/kanban-block rounded-[6px] border border-white/[0.08] bg-[#1C1D1F] p-3 hover:bg-[#232427] hover:border-white/[0.14] transition-all cursor-pointer flex flex-col gap-2 ${
                    draggedId === issue.id ? "opacity-40 scale-95" : ""
                  }`}
                >
                  {/* Top row: Identifier + Quick Timebox action */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#6B7280] font-sans">
                      {issue.identifier}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendToTimebox(issue.id);
                      }}
                      title={issue.inTimebox ? "Sudah di Timebox Board" : "Kirim ke Timebox Board"}
                      className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium font-sans flex items-center gap-1 transition cursor-pointer ${
                        issue.inTimebox
                          ? "bg-[#3F76FF]/15 text-[#3F76FF] border border-[#3F76FF]/30"
                          : "opacity-0 group-hover/kanban-block:opacity-100 bg-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0]"
                      }`}
                    >
                      <Timer className="w-3 h-3" />
                      <span>{issue.inTimebox ? "In Timebox" : "Timebox"}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <div className="text-[13px] font-medium text-[#F0F0F0] leading-snug font-sans break-words">
                    {issue.title}
                  </div>

                  {/* Properties Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <PriorityBadge priority={issue.priority} />
                    <span className="inline-flex items-center gap-1 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-[#9EA3AE] font-sans">
                      <Clock className="w-3 h-3 text-[#6B7280]" />
                      {issue.durationMinutes}m
                    </span>
                    {issue.labels.slice(0, 2).map((lbl) => (
                      <span
                        key={lbl}
                        className="rounded-[4px] border border-white/[0.06] bg-[#161719] px-1.5 py-0.5 text-[10px] text-[#9EA3AE] font-sans"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
