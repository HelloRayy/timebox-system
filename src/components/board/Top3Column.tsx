import React from "react";
import { Flame, GripVertical, X, Clock, CalendarCheck2, CheckCircle2 } from "lucide-react";
import { TaskItem, DragSource } from "@/types/task";
import { calculateEndTime } from "@/lib/time";

export interface Top3ColumnProps {
  top3: TaskItem[];
  selectedTop3Id: string | null;
  activeTask: TaskItem | null;
  isRunning: boolean;
  draggedTaskId: string | null;
  dragSource: DragSource;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (task: TaskItem, source: "top3") => void;
  onSelectTask: (taskId: string) => void;
  onDemoteTask: (task: TaskItem) => void;
  onStartFocus: (task: TaskItem) => void;
  onToggleComplete: (taskId: string) => void;
}

export const Top3Column: React.FC<Top3ColumnProps> = ({
  top3,
  selectedTop3Id,
  activeTask,
  isRunning,
  draggedTaskId,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onSelectTask,
  onDemoteTask,
  onStartFocus,
  onToggleComplete,
}) => {
  return (
    <section
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-80 border-r border-white/[0.08] bg-[#18191B] flex flex-col h-full flex-shrink-0 transition-all ${
        isDragOver ? "bg-[#1E2333]/40 border-l border-l-[#3F76FF]" : ""
      }`}
    >
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-[#F0F0F0] text-12 font-sans">Top 3 Priorities</span>
          <span className="text-[10px] font-sans text-[#9EA3AE] bg-[#1C1D1F] px-1.5 py-0.2 rounded border border-white/[0.08]">
            {top3.length}/3
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pb-32 space-y-2.5 custom-scrollbar">
        {[0, 1, 2].map((index) => {
          const task = top3[index];
          const isSelected = task && selectedTop3Id === task.id;
          const isTaskRunning = task && activeTask?.id === task.id && isRunning;
          const isDraggingThis = task && draggedTaskId === task.id;

          return (
            <div
              key={index}
              draggable={!!task}
              onDragStart={() => task && onDragStart(task, "top3")}
              onClick={() => {
                if (task) onSelectTask(task.id);
              }}
              className={`min-h-[110px] rounded-[6px] transition-all p-3 flex flex-col justify-between cursor-pointer ${
                task
                  ? isDraggingThis
                    ? "opacity-30 scale-95"
                    : task.completed
                    ? "bg-[#1C1D1F]/50 border border-white/[0.04] opacity-50"
                    : isTaskRunning
                    ? "border border-white/[0.1] border-l-2 border-l-[#3F76FF] bg-[#1C1D1F] ring-1 ring-[#3F76FF]/20"
                    : isSelected
                    ? "bg-[#212327] border border-white/[0.14] border-l-2 border-l-[#3F76FF]"
                    : "bg-[#1C1D1F] border border-white/[0.08] hover:bg-[#252629] hover:border-white/[0.12]"
                  : "border border-dashed border-white/[0.08] bg-[#151617]/50 flex items-center justify-center hover:border-white/[0.14]"
              }`}
            >
              {task ? (
                <>
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-sans text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <GripVertical className="w-3 h-3 text-[#6B7280] cursor-grab" />
                        #{index + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDemoteTask(task);
                        }}
                        className="text-[#6B7280] hover:text-[#F0F0F0] transition cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div
                      className={`text-13 font-sans font-medium leading-snug ${
                        task.completed ? "line-through text-[#6B7280]" : "text-[#F0F0F0]"
                      }`}
                    >
                      {task.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-11">
                    <div className="flex items-center gap-1.5 font-sans text-[#9EA3AE]">
                      <Clock className="w-3 h-3 text-[#6B7280]" />
                      <span>{task.durationMinutes}m</span>
                      {task.scheduledTime ? (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-[3px] flex items-center gap-1 text-[10px] font-sans">
                          <CalendarCheck2 className="w-3 h-3" />
                          {task.scheduledTime} -{" "}
                          {task.scheduledEndTime ||
                            calculateEndTime(task.scheduledTime, task.durationMinutes)}
                        </span>
                      ) : (
                        <span className="text-[#6B7280] bg-white/[0.04] px-1.5 py-0.2 rounded-[3px] text-[10px] font-sans">
                          Set Jam
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!task.completed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartFocus(task);
                          }}
                          className={`px-2 py-0.5 rounded-[4px] text-11 font-medium font-sans transition cursor-pointer ${
                            isTaskRunning
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-white/[0.06] hover:bg-white/[0.12] text-[#F0F0F0]"
                          }`}
                        >
                          {isTaskRunning ? "Running" : "Start"}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className="text-[#6B7280] hover:text-emerald-400 transition cursor-pointer"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            task.completed ? "text-emerald-400 fill-emerald-500/20" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-11 text-[#6B7280] font-sans py-4">
                  Slot #{index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
