import React, { useState } from "react";
import { Flame, Sparkles, Timer, CheckCircle2, Clock, Play, X } from "lucide-react";
import { TaskItem, TimeboxSlot } from "@/types/task";
import { PriorityBadge } from "@/components/board/PriorityBadge";

export interface TimeboxBoardViewProps {
  issues: TaskItem[];
  activeTimerTaskId: string | null;
  isTimerRunning: boolean;
  onMoveTimeboxSlot: (issueId: string, targetSlot: TimeboxSlot) => void;
  onSelectIssue: (issueId: string) => void;
  onRemoveFromTimebox: (issueId: string) => void;
  onStartFocus: (issue: TaskItem) => void;
}

const TIMEBOX_COLUMNS: {
  id: TimeboxSlot;
  label: string;
  subtitle: string;
  Icon: React.ElementType;
  accentClass: string;
}[] = [
  {
    id: "braindump",
    label: "Brain Dump",
    subtitle: "Siap dipilah",
    Icon: Sparkles,
    accentClass: "text-[#9EA3AE]",
  },
  {
    id: "top3",
    label: "Top 3 Gate",
    subtitle: "Maksimal 3 prioritas",
    Icon: Flame,
    accentClass: "text-amber-400",
  },
  {
    id: "now",
    label: "Timebox Now",
    subtitle: "Drop ke sini untuk mulai timer",
    Icon: Timer,
    accentClass: "text-[#3F76FF]",
  },
  {
    id: "done",
    label: "Completed",
    subtitle: "Selesai difokuskan",
    Icon: CheckCircle2,
    accentClass: "text-emerald-400",
  },
];

export const TimeboxBoardView: React.FC<TimeboxBoardViewProps> = ({
  issues,
  activeTimerTaskId,
  isTimerRunning,
  onMoveTimeboxSlot,
  onSelectIssue,
  onRemoveFromTimebox,
  onStartFocus,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<TimeboxSlot | null>(null);

  const timeboxIssues = issues.filter((i) => i.inTimebox);

  return (
    <div className="flex-1 h-full overflow-x-auto overflow-y-hidden p-4 flex gap-3.5 bg-[#131415] custom-scrollbar">
      {TIMEBOX_COLUMNS.map((col) => {
        const colIssues = timeboxIssues.filter((i) => i.timeboxSlot === col.id);
        const Icon = col.Icon;
        const isOver = dragOverSlot === col.id;
        const isTop3Full = col.id === "top3" && colIssues.length >= 3;

        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverSlot(col.id);
            }}
            onDragLeave={() => setDragOverSlot(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverSlot(null);
              if (!draggedId) return;
              onMoveTimeboxSlot(draggedId, col.id);
              setDraggedId(null);
            }}
            className={`w-[300px] shrink-0 h-full flex flex-col rounded-[8px] transition-all ${
              isOver
                ? col.id === "now"
                  ? "bg-[#3F76FF]/[0.06] ring-1 ring-[#3F76FF]/50"
                  : "bg-[#1C1D1F]/80 ring-1 ring-white/[0.15]"
                : "bg-transparent"
            }`}
          >
            {/* Header Kolom */}
            <div className="px-2 py-2 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${col.accentClass}`} />
                  <span className="text-[13px] font-medium text-[#F0F0F0] font-sans">
                    {col.label}
                  </span>
                  <span
                    className={`text-[11px] font-sans px-1.5 py-0.5 rounded-[4px] border tabular-nums ${
                      isTop3Full
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-[#1C1D1F] border-white/[0.06] text-[#6B7280]"
                    }`}
                  >
                    {col.id === "top3" ? `${colIssues.length}/3` : colIssues.length}
                  </span>
                </div>
                <span className="text-[10px] text-[#525866] font-sans mt-0.5">{col.subtitle}</span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-24 custom-scrollbar">
              {colIssues.length === 0 ? (
                <div
                  className={`rounded-[6px] border border-dashed p-5 text-center text-[11px] font-sans ${
                    col.id === "now"
                      ? "border-[#3F76FF]/30 bg-[#3F76FF]/[0.03] text-[#9EA3AE]"
                      : "border-white/[0.08] text-[#525866]"
                  }`}
                >
                  {col.id === "now"
                    ? "Geser tugas ke sini untuk memunculkan popup timer fokus"
                    : "Kosong"}
                </div>
              ) : (
                colIssues.map((issue) => {
                  const isActiveTimer = activeTimerTaskId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={() => setDraggedId(issue.id)}
                      onDragEnd={() => setDraggedId(null)}
                      onClick={() => onSelectIssue(issue.id)}
                      className={`group rounded-[6px] border p-3 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2 ${
                        draggedId === issue.id
                          ? "opacity-40 scale-95"
                          : isActiveTimer
                          ? "border-white/[0.1] border-l-2 border-l-[#3F76FF] bg-[#1C1D1F] ring-1 ring-[#3F76FF]/20"
                          : "border-white/[0.08] bg-[#1C1D1F] hover:bg-[#232427] hover:border-white/[0.14]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-[#6B7280] font-sans">
                          {issue.identifier}
                        </span>
                        <div className="flex items-center gap-1">
                          {col.id !== "done" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartFocus(issue);
                              }}
                              title="Fokus & Buka Timer Popup"
                              className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium font-sans flex items-center gap-1 transition cursor-pointer ${
                                isActiveTimer && isTimerRunning
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-[#3F76FF]/15 text-[#3F76FF] hover:bg-[#3F76FF] hover:text-white"
                              }`}
                            >
                              <Play className="w-2.5 h-2.5" />
                              <span>{isActiveTimer && isTimerRunning ? "Focusing" : "Focus"}</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromTimebox(issue.id);
                            }}
                            title="Keluarkan dari Timebox"
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#6B7280] hover:text-[#F0F0F0] transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div
                        className={`text-[13px] font-medium leading-snug font-sans ${
                          col.id === "done" ? "line-through text-[#6B7280]" : "text-[#F0F0F0]"
                        }`}
                      >
                        {issue.title}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <PriorityBadge priority={issue.priority} compact />
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#9EA3AE] font-sans">
                          <Clock className="w-3 h-3 text-[#6B7280]" />
                          {issue.durationMinutes}m
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
