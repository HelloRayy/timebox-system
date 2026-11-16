import React, { useState, useRef, useEffect } from "react";
import { Eye, Play, Pause, RotateCcw, Minus, Plus, X, GripHorizontal, Minimize2 } from "lucide-react";

export interface TimeboxTask {
  id: string;
  identifier: string;
  title: string;
  durationMinutes: number;
  priority: "urgent" | "high" | "medium" | "low" | "none";
  slot: "braindump" | "top3" | "now" | "done";
}

export interface FloatingCornerTimerProps {
  task: TimeboxTask;
  totalSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onAdjustMinutes: (delta: number) => void;
  onMinimize: () => void;
  onClose: () => void;
}

const formatMMSS = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

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
  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== "undefined" ? Math.max(16, window.innerWidth - 268) : 900,
    y: typeof window !== "undefined" ? Math.max(56, window.innerHeight - 318) : 450,
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

  const size = 148;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsRemaining / totalSeconds)) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className={`fixed z-50 w-[240px] rounded-[20px] bg-canvas/95 backdrop-blur-xl border border-subtle shadow-2xl p-3.5 flex flex-col items-center select-none transition-shadow ${
        isDragging ? "shadow-[0_0_30px_rgba(63,118,255,0.2)] cursor-grabbing" : ""
      }`}
    >
      {/* Top Drag Handle Bar */}
      <div
        onMouseDown={startDrag}
        className="w-full flex items-center justify-between pb-1.5 mb-1 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-placeholder shrink-0" />
          <span className="text-[11px] font-medium text-secondary truncate">
            {task.identifier}
          </span>
        </div>

        <div className="flex items-center gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onMinimize}
            title="Minimize"
            className="p-1 rounded-[4px] text-tertiary hover:text-primary hover:bg-layer-1 transition cursor-pointer"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="p-1 rounded-[4px] text-tertiary hover:text-red-400 hover:bg-layer-1 transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <div className="w-full text-center text-[11px] font-medium text-primary truncate px-2 mb-2">
        {task.title}
      </div>

      {/* Circular Ring */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="planeCornerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
            stroke="url(#planeCornerRingGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-[stroke-dashoffset] duration-700 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Eye className="w-4 h-4 text-secondary mb-1 opacity-80" />
          <div className="text-[28px] font-semibold tracking-tight text-primary leading-none tabular-nums">
            {formatMMSS(secondsRemaining)}
          </div>
          <span className="text-[9px] uppercase tracking-widest text-tertiary font-medium mt-1.5">
            {isRunning ? "Focusing" : "Paused"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-between gap-2 mt-3 pt-2 border-t border-subtle">
        <button
          type="button"
          onClick={onReset}
          title="Reset"
          className="w-8 h-8 rounded-full bg-layer-1 hover:bg-layer-2 border border-subtle text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className={`flex-1 h-8 rounded-full font-medium text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer ${
            isRunning
              ? "bg-layer-1 border border-subtle hover:bg-layer-2 text-primary"
              : "bg-accent-primary hover:bg-accent-primary/90 text-white"
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
            type="button"
            onClick={() => onAdjustMinutes(-5)}
            title="-5m"
            className="w-7 h-8 rounded-[6px] bg-layer-1 hover:bg-layer-2 border border-subtle text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onAdjustMinutes(5)}
            title="+5m"
            className="w-7 h-8 rounded-[6px] bg-layer-1 hover:bg-layer-2 border border-subtle text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
