import React from "react";
import { ChevronRight, Play, Pause, RotateCcw } from "lucide-react";
import { TaskItem } from "@/types/task";
import { formatTimer } from "@/lib/time";

export interface HeaderProps {
  activeTask: TaskItem | null;
  isRunning: boolean;
  secondsRemaining: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTask,
  isRunning,
  secondsRemaining,
  onToggleTimer,
  onResetTimer,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 h-10 border-b border-white/[0.08] bg-[#131415] z-20 flex items-center justify-between px-3.5">
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-[#F0F0F0]">
          <span className="w-2 h-2 rounded-full bg-[#3F76FF]" />
          raditya-rayhan
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[#9EA3AE]">Timebox</span>
      </div>

      {/* Stopwatch Active Timer */}
      <div className="flex items-center gap-2.5">
        {activeTask && (
          <div className="flex items-center gap-2 bg-[#1C1D1F] border border-white/[0.08] px-2.5 py-1 rounded-[4px] text-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRunning ? "bg-emerald-400 animate-pulse" : "bg-[#6B7280]"
              }`}
            />
            <span className="font-sans font-medium text-[#F0F0F0] text-[12px] tabular-nums">
              {formatTimer(secondsRemaining)}
            </span>
            <span className="text-[#9EA3AE] truncate max-w-[140px] font-sans text-[12px]">
              {activeTask.title}
            </span>
            <button
              onClick={onToggleTimer}
              title={isRunning ? "Pause (Space)" : "Play (Space)"}
              className="ml-1 text-[#9EA3AE] hover:text-[#F0F0F0] transition cursor-pointer"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              onClick={onResetTimer}
              title="Reset Timer"
              className="text-[#6B7280] hover:text-[#F0F0F0] transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="text-[11px] text-[#6B7280] font-sans">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </div>
      </div>
    </header>
  );
};
