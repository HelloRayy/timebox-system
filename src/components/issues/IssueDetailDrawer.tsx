import React, { useState } from "react";
import { X, Timer, Play, Plus, CheckSquare, Square, Trash2 } from "lucide-react";
import { IssueState, Priority, TaskItem } from "@/types/task";
import { ISSUE_STATES, IssueStateIcon } from "./IssueStateIcon";

export interface IssueDetailDrawerProps {
  issue: TaskItem;
  onClose: () => void;
  onUpdate: (issueId: string, patch: Partial<TaskItem>) => void;
  onDelete: (issueId: string) => void;
  onSendToTimebox: (issueId: string) => void;
  onStartFocusNow: (issue: TaskItem) => void;
}

const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "urgent", label: "Urgent" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "none", label: "None" },
];

export const IssueDetailDrawer: React.FC<IssueDetailDrawerProps> = ({
  issue,
  onClose,
  onUpdate,
  onDelete,
  onSendToTimebox,
  onStartFocusNow,
}) => {
  const [newSubTitle, setNewSubTitle] = useState("");

  const handleAddSubIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;
    const nextSubs = [
      ...issue.subIssues,
      { id: "sub-" + Date.now(), title: newSubTitle.trim(), completed: false },
    ];
    onUpdate(issue.id, { subIssues: nextSubs });
    setNewSubTitle("");
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[440px] max-w-full bg-[#161719] border-l border-white/[0.08] shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-150">
      {/* Top Bar */}
      <div className="h-12 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <IssueStateIcon state={issue.state} className="w-4 h-4" />
          <span className="text-[12px] font-medium text-[#9EA3AE] font-sans">
            {issue.identifier}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onDelete(issue.id)}
            title="Hapus Work Item"
            className="p-1.5 rounded-[4px] text-[#6B7280] hover:text-red-400 hover:bg-white/[0.05] transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-[#6B7280] hover:text-[#F0F0F0] hover:bg-white/[0.05] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Editable Title */}
        <input
          type="text"
          value={issue.title}
          onChange={(e) => onUpdate(issue.id, { title: e.target.value })}
          className="w-full bg-transparent text-[18px] font-semibold text-[#F0F0F0] focus:outline-none font-sans"
          placeholder="Work item title..."
        />

        {/* Timebox Actions Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartFocusNow(issue)}
            className="flex-1 h-8 px-3 rounded-[6px] bg-[#3F76FF] hover:bg-[#3364DB] text-white text-[12px] font-medium font-sans flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Focus Now ({issue.durationMinutes}m)</span>
          </button>
          <button
            onClick={() => onSendToTimebox(issue.id)}
            className={`h-8 px-3 rounded-[6px] border text-[12px] font-medium font-sans flex items-center gap-1.5 transition cursor-pointer ${
              issue.inTimebox
                ? "bg-[#3F76FF]/15 border-[#3F76FF]/40 text-[#3F76FF]"
                : "bg-[#1C1D1F] border-white/[0.08] text-[#9EA3AE] hover:text-[#F0F0F0]"
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{issue.inTimebox ? "In Timebox" : "Add to Timebox"}</span>
          </button>
        </div>

        {/* Properties Grid ala Plane */}
        <div className="grid grid-cols-[100px_1fr] gap-y-3 items-center text-[12px] font-sans py-3 border-y border-white/[0.06]">
          <span className="text-[#6B7280]">State</span>
          <select
            value={issue.state}
            onChange={(e) => {
              const newState = e.target.value as IssueState;
              onUpdate(issue.id, { state: newState, completed: newState === "done" });
            }}
            className="h-7 px-2 rounded-[4px] bg-[#1C1D1F] border border-white/[0.08] text-[#F0F0F0] focus:outline-none cursor-pointer"
          >
            {ISSUE_STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <span className="text-[#6B7280]">Priority</span>
          <select
            value={issue.priority}
            onChange={(e) => onUpdate(issue.id, { priority: e.target.value as Priority })}
            className="h-7 px-2 rounded-[4px] bg-[#1C1D1F] border border-white/[0.08] text-[#F0F0F0] focus:outline-none cursor-pointer"
          >
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <span className="text-[#6B7280]">Duration</span>
          <div className="flex items-center gap-1.5">
            {[15, 25, 30, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => onUpdate(issue.id, { durationMinutes: m })}
                className={`px-2 py-1 rounded-[4px] border text-[11px] font-sans transition cursor-pointer ${
                  issue.durationMinutes === m
                    ? "bg-[#3F76FF] border-[#3F76FF] text-white font-medium"
                    : "bg-[#1C1D1F] border-white/[0.08] text-[#9EA3AE] hover:text-[#F0F0F0]"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-medium text-[#6B7280] font-sans mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            value={issue.description}
            onChange={(e) => onUpdate(issue.id, { description: e.target.value })}
            placeholder="Tambahkan deskripsi atau catatan teknis..."
            className="w-full rounded-[6px] bg-[#1C1D1F] border border-white/[0.08] p-2.5 text-[13px] text-[#F0F0F0] placeholder:text-[#525866] focus:outline-none focus:border-[#3F76FF]/50 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Sub-issues */}
        <div>
          <div className="text-[11px] font-medium text-[#6B7280] font-sans mb-2">
            Sub-issues ({issue.subIssues.filter((s) => s.completed).length}/{issue.subIssues.length})
          </div>
          <div className="space-y-1.5 mb-2">
            {issue.subIssues.map((sub) => (
              <div
                key={sub.id}
                onClick={() => {
                  const next = issue.subIssues.map((s) =>
                    s.id === sub.id ? { ...s, completed: !s.completed } : s
                  );
                  onUpdate(issue.id, { subIssues: next });
                }}
                className="flex items-center gap-2 p-2 rounded-[5px] bg-[#1C1D1F] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition"
              >
                {sub.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                )}
                <span
                  className={`text-[12px] font-sans ${
                    sub.completed ? "line-through text-[#6B7280]" : "text-[#F0F0F0]"
                  }`}
                >
                  {sub.title}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubIssue} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newSubTitle}
              onChange={(e) => setNewSubTitle(e.target.value)}
              placeholder="Tambah sub-issue..."
              className="flex-1 h-7 px-2.5 rounded-[5px] bg-[#1C1D1F] border border-white/[0.08] text-[12px] text-[#F0F0F0] placeholder:text-[#525866] focus:outline-none focus:border-[#3F76FF]/50 font-sans"
            />
            <button
              type="submit"
              className="h-7 px-2.5 rounded-[5px] bg-white/[0.06] hover:bg-white/[0.12] text-[#F0F0F0] text-[11px] font-medium font-sans flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
