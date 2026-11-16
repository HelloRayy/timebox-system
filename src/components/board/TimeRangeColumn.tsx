import React, { useState } from "react";
import {
  Calendar,
  Clock,
  X,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/types/task";
import { formatTimer, calculateEndTime } from "@/lib/time";

export interface TimeRangeColumnProps {
  selectedTask: TaskItem | null | undefined;
  activeTask: TaskItem | null;
  isRunning: boolean;
  secondsRemaining: number;
  selectedHour: number;
  selectedMinute: number;
  selectedPeriod: "am" | "pm";
  customDuration: number;
  onSetHour: React.Dispatch<React.SetStateAction<number>>;
  onSetMinute: React.Dispatch<React.SetStateAction<number>>;
  onSetPeriod: React.Dispatch<React.SetStateAction<"am" | "pm">>;
  onSetDuration: React.Dispatch<React.SetStateAction<number>>;
  onApplyTimeRange: (startTime: string, duration: number) => void;
  onUnassignSchedule: (taskId: string) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onStartFocus: (task: TaskItem) => void;
}

export const TimeRangeColumn: React.FC<TimeRangeColumnProps> = ({
  selectedTask,
  activeTask,
  isRunning,
  secondsRemaining,
  customDuration,
  onSetDuration,
  onApplyTimeRange,
  onUnassignSchedule,
  onToggleTimer,
  onResetTimer,
  onStartFocus,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // SVG Circular Ring Constants
  const size = 230;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Hitung persentase durasi tersisa
  const totalSeconds = (selectedTask?.durationMinutes || customDuration || 25) * 60;
  const currentSeconds =
    activeTask?.id === selectedTask?.id ? secondsRemaining : customDuration * 60;

  // Progress berkurang seiring berjalannya countdown (0 saat habis, 1 saat penuh)
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, currentSeconds / totalSeconds)) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <section className="flex-1 bg-[#131415] flex flex-col h-full overflow-hidden transition-all">
      {/* Header Kolom */}
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#9EA3AE]" />
          <span className="font-medium text-[#F0F0F0] text-12 font-sans">Focus Timer</span>
          {selectedTask && (
            <div className="flex items-center gap-1.5 text-12 text-[#F0F0F0] bg-[#1C1D1F] px-2 py-0.5 rounded-[4px] border border-white/[0.08] font-sans">
              <span className="text-[#3F76FF] font-medium truncate max-w-[170px]">
                {selectedTask.title}
              </span>
            </div>
          )}
        </div>

        {selectedTask?.scheduledTime && (
          <button
            onClick={() => onUnassignSchedule(selectedTask.id)}
            className="text-11 text-red-400 hover:text-red-300 font-sans cursor-pointer transition flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Hapus Jam
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-32 flex flex-col items-center justify-center">
        {!selectedTask ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto text-[#6B7280]">
            <Clock className="w-7 h-7 mb-2 text-[#525866]" />
            <div className="text-12 font-medium text-[#F0F0F0] font-sans">Pilih Kartu Top 3</div>
            <div className="text-11 text-[#6B7280] font-sans mt-1">
              Pilih salah satu tugas dari Top 3 untuk memulai sesi fokus Timebox
            </div>
          </div>
        ) : (
          <Card className="relative w-full max-w-[340px] p-6 shadow-2xl flex flex-col items-center border-white/[0.08] bg-[#1C1D1F] rounded-[24px] overflow-hidden transition-all">
            
            {/* Header Mini Kartu Focus */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3F76FF]" />
                <span className="text-11 font-medium tracking-wide uppercase text-[#9EA3AE] font-sans">
                  Timebox Focus
                </span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Pengaturan Durasi"
                className={`p-1.5 rounded-[6px] border transition cursor-pointer ${
                  isSettingsOpen
                    ? "bg-[#3F76FF]/20 border-[#3F76FF]/40 text-[#3F76FF]"
                    : "bg-white/[0.04] border-white/[0.08] text-[#9EA3AE] hover:text-[#F0F0F0] hover:bg-white/[0.08]"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Progress Ring Area */}
            <div className="relative flex items-center justify-center my-3 select-none">
              <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                  {/* Gradien Aksen Halus Sesuai Palet Plane / Crimson Ring */}
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3F76FF" />
                    <stop offset="100%" stopColor="#5B8CFF" />
                  </linearGradient>
                </defs>

                {/* Background Ring Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {/* Animated Dynamic Progress Stroke */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="url(#ringGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-[stroke-dashoffset] duration-700 ease-linear"
                />
              </svg>

              {/* Konten Tengah Lingkaran Ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {/* Icon Eye Minimalis Khas Referensi */}
                <Eye className="w-5 h-5 text-[#9EA3AE] mb-2 opacity-80" />

                {/* Angka Countdown Besar (Wajib Monospace sesuai design.md) */}
                <div className="font-mono text-38 font-semibold tracking-tight text-[#F0F0F0] leading-none mb-2">
                  {activeTask?.id === selectedTask.id
                    ? formatTimer(secondsRemaining)
                    : formatTimer(customDuration * 60)}
                </div>

                {/* Label Status Bawah */}
                <span className="text-[11px] font-sans uppercase tracking-widest text-[#6B7280] font-medium">
                  {activeTask?.id === selectedTask.id && isRunning ? "Focusing" : "Focus Session"}
                </span>

                {/* Indikator Alokasi Waktu Selesai */}
                <span className="text-[10px] text-[#525866] font-sans mt-1">
                  {customDuration}m target
                </span>
              </div>
            </div>

            {/* Bottom Controls Bar (Reset, Start/Pause, Settings) */}
            <div className="w-full flex items-center justify-center gap-3 mt-4 pt-3 border-t border-white/[0.04]">
              {/* Tombol Reset Timer */}
              <button
                onClick={onResetTimer}
                title="Reset Timer"
                className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[#9EA3AE] hover:text-[#F0F0F0] flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Tombol Utama Start / Pause berbentuk Pill Lebar Elegan */}
              {activeTask?.id === selectedTask.id ? (
                <Button
                  onClick={onToggleTimer}
                  className={`min-w-[130px] h-11 rounded-full font-medium text-13 px-6 shadow-lg transition active:scale-95 cursor-pointer ${
                    isRunning
                      ? "bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] text-[#F0F0F0]"
                      : "bg-[#3F76FF] hover:bg-[#3364DB] text-white"
                  }`}
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <Pause className="w-4 h-4" /> PAUSE
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4 ml-0.5" /> RESUME
                    </span>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const now = new Date();
                    const startStr = `${now.getHours().toString().padStart(2, "0")}:${now
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`;
                    const endStr = calculateEndTime(startStr, customDuration);

                    onApplyTimeRange(startStr, customDuration);
                    onStartFocus({
                      ...selectedTask,
                      durationMinutes: customDuration,
                      scheduledTime: startStr,
                      scheduledEndTime: endStr,
                    });
                  }}
                  className="min-w-[130px] h-11 rounded-full bg-[#3F76FF] hover:bg-[#3364DB] text-white font-medium text-13 px-6 shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 ml-0.5" /> START
                </Button>
              )}

              {/* Tombol Toggle Setting */}
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Atur Durasi Sesi"
                className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[#9EA3AE] hover:text-[#F0F0F0] flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Durasi di Bawah Tombol Utama */}
            <div className="w-full grid grid-cols-4 gap-1.5 mt-3 pt-2">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onSetDuration(mins)}
                  className={`h-7 rounded-[4px] border text-11 font-sans transition cursor-pointer flex items-center justify-center ${
                    customDuration === mins
                      ? "bg-[#3F76FF] text-white font-medium border-[#3F76FF]"
                      : "bg-[#161719] border-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0] hover:bg-white/[0.04]"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Modal / Overlay Drawer Settings Durasi Sesuai Referensi Gambar */}
            {isSettingsOpen && (
              <div className="absolute inset-0 bg-[#1C1D1F]/95 backdrop-blur-md z-20 p-5 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="font-semibold text-13 text-[#F0F0F0] font-sans">
                      Focus Duration Settings
                    </span>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1 rounded-full hover:bg-white/[0.08] text-[#6B7280] hover:text-[#F0F0F0] transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pengatur Durasi +/- Sesuai Gambar Referensi Kanan Bawah */}
                  <div className="flex flex-col items-center justify-center py-6">
                    <span className="text-11 text-[#9EA3AE] font-sans mb-3">Focus Session</span>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => onSetDuration((prev) => Math.max(5, prev - 5))}
                        className="w-10 h-10 rounded-full border border-white/[0.1] bg-[#161719] hover:bg-white/[0.06] flex items-center justify-center text-[#F0F0F0] transition cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="flex flex-col items-center">
                        <span className="font-mono text-32 font-bold text-[#F0F0F0]">
                          {customDuration}
                        </span>
                        <span className="text-[11px] text-[#6B7280] font-sans">min</span>
                      </div>

                      <button
                        onClick={() => onSetDuration((prev) => Math.min(180, prev + 5))}
                        className="w-10 h-10 rounded-full border border-white/[0.1] bg-[#161719] hover:bg-white/[0.06] flex items-center justify-center text-[#F0F0F0] transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full h-9 rounded-[6px] bg-[#3F76FF] hover:bg-[#3364DB] text-white font-medium text-12 shadow flex items-center justify-center gap-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" /> Selesai
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </section>
  );
};
