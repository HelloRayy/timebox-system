import React, { useState, useRef, useEffect } from "react";
import { Eye, Play, Pause, RotateCcw, Minus, Plus, X, GripHorizontal, Minimize2 } from "lucide-react";
import { TaskItem } from "@/types/task";
import { formatTimer } from "@/lib/time";

export interface FloatingCornerTimerProps {
  task: TaskItem;
  totalSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onAdjustMinutes: (delta: number) => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const FloatingCornerTimer: React.FC<FloatingCornerTimerProps> = ({
  task,
  totalSeconds,
  secondsRemaining,
  isRunning,
  onToggle,
  onReset,
  onAdjustMinutes,
  onMinimize,
  onClose,
}) => {
  // Posisi default di pojok kanan bawah, bisa digeser bebas
  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: Math.max(16, window.innerWidth - 268),
    y: Math.max(56, window.innerHeight - 318),
  }));
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const nextX = Math.min(Math.max(12, e.clientX - dragOffset.current.x), window.innerWidth - 252);
      const nextY = Math.min(Math.max(52, e.clientY - dragOffset.current.y), window.innerHeight - 300);
      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Compact Circular SVG Ring
  const size = 148;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsRemaining / totalSeconds)) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className={`fixed z-50 w-[240px] rounded-[20px] bg-[#131415]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl p-3.5 flex flex-col items-center select-none transition-shadow ${
        isDragging ? "shadow-[0_0_30px_rgba(63,118,255,0.2)] cursor-grabbing" : ""
      }`}
    >
      {/* Top Drag Handle Bar */}
      <div
        onMouseDown={startDrag}
        className="w-full flex items-center justify-between pb-1.5 mb-1 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-[#525866] shrink-0" />
          <span className="text-[11px] font-medium text-[#9EA3AE] truncate font-sans">
            {task.identifier}
          </span>
        </div>

        <div className="flex items-center gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={onMinimize}
            title="Minimize ke Header"
            className="p-1 rounded-[4px] text-[#6B7280] hover:text-[#F0F0F0] hover:bg-white/[0.06] transition cursor-pointer"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            title="Tutup Timer"
            className="p-1 rounded-[4px] text-[#6B7280] hover:text-red-400 hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Task Title (Ringkas 1 Baris) */}
      <div className="w-full text-center text-[11px] font-medium text-[#F0F0F0] truncate px-2 mb-2 font-sans">
        {task.title}
      </div>

      {/* Circular Ring */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="cornerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3F76FF" />
              <stop offset="100%" stopColor="#5B8CFF" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#cornerRingGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-[stroke-dashoffset] duration-700 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Eye className="w-4 h-4 text-[#9EA3AE] mb-1 opacity-80" />
          <div className="font-sans text-[28px] font-semibold tracking-tight text-[#F0F0F0] leading-none tabular-nums">
            {formatTimer(secondsRemaining)}
          </div>
          <span className="text-[9px] font-sans uppercase tracking-widest text-[#6B7280] font-medium mt-1.5">
            {isRunning ? "Focusing" : "Paused"}
          </span>
        </div>
      </div>

      {/* Controls: Reset, Start/Pause, +/-5m */}
      <div className="w-full flex items-center justify-between gap-2 mt-3 pt-2 border-t border-white/[0.06]">
        <button
          onClick={onReset}
          title="Reset"
          className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#9EA3AE] hover:text-[#F0F0F0] flex items-center justify-center transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggle}
          className={`flex-1 h-8 rounded-full font-medium text-[11px] font-sans flex items-center justify-center gap-1.5 transition cursor-pointer ${
            isRunning
              ? "bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.14] text-[#F0F0F0]"
              : "bg-[#3F76FF] hover:bg-[#3364DB] text-white"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3 h-3" /> PAUSE
            </>
          ) : (
            <>
              <Play className="w-3 h-3 ml-0.5" /> START
            </>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onAdjustMinutes(-5)}
            title="Kurangi 5 menit"
            className="w-7 h-8 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0] flex items-center justify-center transition cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => onAdjustMinutes(5)}
            title="Tambah 5 menit"
            className="w-7 h-8 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0] flex items-center justify-center transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
