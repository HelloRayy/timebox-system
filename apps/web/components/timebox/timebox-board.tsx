import React, { useState } from "react";
import { Flame, Sparkles, Timer, CheckCircle2, Clock, Play, Plus, X } from "lucide-react";
import { useTimebox } from "./timebox-context";
import type { TimeboxTask } from "./floating-corner-timer";

const COLUMNS: {
  id: TimeboxTask["slot"];
  label: string;
  subtitle: string;
  Icon: React.ElementType;
  accentClass: string;
}[] = [
  { id: "braindump", label: "Brain Dump", subtitle: "Siap dipilah", Icon: Sparkles, accentClass: "text-secondary" },
  { id: "top3", label: "Top 3 Gate", subtitle: "Maksimal 3 prioritas", Icon: Flame, accentClass: "text-amber-400" },
  { id: "now", label: "Timebox Now", subtitle: "Drop ke sini untuk popup timer", Icon: Timer, accentClass: "text-accent-primary" },
  { id: "done", label: "Completed", subtitle: "Selesai difokuskan", Icon: CheckCircle2, accentClass: "text-emerald-400" },
];

export const TimeboxBoard: React.FC = () => {
  const {
    tasks,
    activeTask,
    isRunning,
    isPopupVisible,
    addTask,
    moveTaskSlot,
    removeTask,
    startFocus,
    setIsPopupVisible,
  } = useTimebox();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<TimeboxTask["slot"] | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDuration, setQuickDuration] = useState(25);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask(quickTitle.trim(), quickDuration);
    setQuickTitle("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-canvas text-primary overflow-hidden">
      {/* Header Bar */}
      <div className="h-13 px-5 border-b border-subtle flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Timer className="w-4 h-4 text-accent-primary" />
          <span className="text-body-md-medium text-primary">Timebox Board</span>
          <span className="text-[11px] text-tertiary bg-surface-1 px-2 py-0.5 rounded-[4px] border border-subtle tabular-nums">
            {tasks.filter((t) => t.slot !== "done").length} aktif
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeTask && !isPopupVisible && (
            <button
              type="button"
              onClick={() => setIsPopupVisible(true)}
              className="h-7 px-2.5 rounded-[5px] bg-accent-primary/15 border border-accent-primary/40 text-accent-primary text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Buka Popup Timer</span>
            </button>
          )}

          <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Tambah task timebox..."
              className="h-7 w-56 px-2.5 rounded-[5px] bg-surface-1 border border-subtle text-[12px] text-primary placeholder:text-placeholder focus:outline-none focus:border-accent-primary/60"
            />
            <select
              value={quickDuration}
              onChange={(e) => setQuickDuration(Number(e.target.value))}
              className="h-7 px-2 rounded-[5px] bg-surface-1 border border-subtle text-[12px] text-secondary focus:outline-none cursor-pointer"
            >
              <option value={15}>15m</option>
              <option value={25}>25m</option>
              <option value={30}>30m</option>
              <option value={45}>45m</option>
              <option value={60}>60m</option>
            </select>
            <button
              type="submit"
              className="h-7 px-2.5 rounded-[5px] bg-accent-primary hover:bg-accent-primary/90 text-white text-[12px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 flex gap-3.5 vertical-scrollbar">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.slot === col.id);
          const Icon = col.Icon;
          const isOver = dragOverSlot === col.id;
          const isTop3Full = col.id === "top3" && colTasks.length >= 3;

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
                moveTaskSlot(draggedId, col.id);
                setDraggedId(null);
              }}
              className={`w-[300px] shrink-0 h-full flex flex-col rounded-[8px] transition-all ${
                isOver
                  ? col.id === "now"
                    ? "bg-accent-primary/[0.06] ring-1 ring-accent-primary/50"
                    : "bg-surface-1/80 ring-1 ring-subtle"
                  : "bg-transparent"
              }`}
            >
              <div className="px-2 py-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${col.accentClass}`} />
                    <span className="text-body-sm-medium text-primary">{col.label}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-[4px] border tabular-nums ${
                        isTop3Full
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-surface-1 border-subtle text-tertiary"
                      }`}
                    >
                      {col.id === "top3" ? `${colTasks.length}/3` : colTasks.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-placeholder mt-0.5">{col.subtitle}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-16 vertical-scrollbar">
                {colTasks.length === 0 ? (
                  <div
                    className={`rounded-[6px] border border-dashed p-5 text-center text-[11px] ${
                      col.id === "now"
                        ? "border-accent-primary/30 bg-accent-primary/[0.03] text-secondary"
                        : "border-subtle text-placeholder"
                    }`}
                  >
                    {col.id === "now"
                      ? "Drop task ke sini untuk memunculkan popup timer di pojok"
                      : "Kosong"}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isActive = activeTask?.id === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggedId(task.id)}
                        onDragEnd={() => setDraggedId(null)}
                        className={`group rounded-[6px] border p-3 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2 ${
                          draggedId === task.id
                            ? "opacity-40 scale-95"
                            : isActive
                            ? "border-subtle border-l-2 border-l-accent-primary bg-surface-1 ring-1 ring-accent-primary/20"
                            : "border-subtle bg-surface-1 hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-tertiary">
                            {task.identifier}
                          </span>
                          <div className="flex items-center gap-1">
                            {col.id !== "done" && (
                              <button
                                type="button"
                                onClick={() => startFocus(task, true)}
                                className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium flex items-center gap-1 transition cursor-pointer ${
                                  isActive && isRunning
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-accent-primary/15 text-accent-primary hover:bg-accent-primary hover:text-white"
                                }`}
                              >
                                <Play className="w-2.5 h-2.5" />
                                <span>{isActive && isRunning ? "Focusing" : "Focus"}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-tertiary hover:text-primary transition cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div
                          className={`text-body-sm-medium leading-snug ${
                            col.id === "done" ? "line-through text-tertiary" : "text-primary"
                          }`}
                        >
                          {task.title}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] uppercase tracking-wide text-secondary">
                            {task.priority}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-secondary">
                            <Clock className="w-3 h-3 text-tertiary" />
                            {task.durationMinutes}m
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
    </div>
  );
};
