import React from "react";
import { Sparkles, Clock, ArrowRight, GripVertical } from "lucide-react";
import { TaskItem, DragSource } from "@/types/task";
import { PriorityBadge } from "./PriorityBadge";

export interface BrainDumpColumnProps {
  tasks: TaskItem[];
  dragSource: DragSource;
  draggedTaskId: string | null;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (task: TaskItem, source: "braindump") => void;
  onPromoteToTop3: (task: TaskItem) => void;
}

export const BrainDumpColumn: React.FC<BrainDumpColumnProps> = ({
  tasks,
  draggedTaskId,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onPromoteToTop3,
}) => {
  return (
    <section
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-76 border-r border-white/[0.08] bg-[#161719] flex flex-col h-full flex-shrink-0 transition-all ${
        isDragOver ? "bg-[#201c1f]/40 border-r-[#F87171]/50" : ""
      }`}
    >
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#9EA3AE]" />
          <span className="font-medium text-[#F0F0F0] text-12 font-sans">Brain Dump</span>
          <span className="text-[10px] font-sans text-[#9EA3AE] bg-[#1C1D1F] px-1.5 py-0.2 rounded border border-white/[0.08]">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 pb-32 space-y-1.5 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-12 text-[#6B7280] font-sans">
            Semua tugas sudah terorganisir ke Top 3.
          </div>
        ) : (
          tasks.map((task) => {
            const isDraggingThis = draggedTaskId === task.id;

            return (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task, "braindump")}
                className={`group relative rounded-[6px] border border-white/[0.08] bg-[#1C1D1F] p-2.5 hover:bg-[#232427] hover:border-white/[0.14] transition-all cursor-grab active:cursor-grabbing ${
                  isDraggingThis ? "opacity-30 scale-95" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="flex items-start gap-1.5 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-[#6B7280] opacity-40 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                    <span className="text-13 font-medium text-[#F0F0F0] leading-snug font-sans">
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onPromoteToTop3(task)}
                    title="Pindahkan ke Top 3"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-11 text-[#3F76FF] hover:text-[#5B8CFF] flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 rounded bg-[#3F76FF]/10 font-sans cursor-pointer"
                  >
                    Top 3 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between pl-5 text-11 text-[#9EA3AE] font-sans">
                  <span className="flex items-center gap-1 font-sans text-[11px]">
                    <Clock className="w-3 h-3 text-[#6B7280]" />
                    {task.durationMinutes}m
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
