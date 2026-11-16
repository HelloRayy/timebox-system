import React from "react";
import { Calendar, Clock, X, Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/types/task";
import { formatTimer, getCurrentTime12, formatTo24HourString, calculateEndTime } from "@/lib/time";

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
  selectedHour,
  selectedMinute,
  selectedPeriod,
  customDuration,
  onSetHour,
  onSetMinute,
  onSetPeriod,
  onSetDuration,
  onApplyTimeRange,
  onUnassignSchedule,
  onToggleTimer,
  onResetTimer,
  onStartFocus,
}) => {
  const formattedStartTime = formatTo24HourString(selectedHour, selectedMinute, selectedPeriod);
  const calculatedEndTime = calculateEndTime(formattedStartTime, customDuration);

  const setTimeToCurrent = () => {
    const cur = getCurrentTime12();
    onSetHour(cur.hour);
    onSetMinute(cur.minute);
    onSetPeriod(cur.period);
  };

  return (
    <section className="flex-1 bg-[#131415] flex flex-col h-full overflow-hidden transition-all">
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#9EA3AE]" />
          <span className="font-medium text-[#F0F0F0] text-12 font-sans">Time Range</span>
          {selectedTask && (
            <div className="flex items-center gap-1.5 text-12 text-[#F0F0F0] bg-[#1C1D1F] px-2 py-0.5 rounded-[4px] border border-white/[0.08] font-sans">
              <span className="text-[#3F76FF] font-medium truncate max-w-[180px]">
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

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-32">
        {!selectedTask ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto text-[#6B7280]">
            <Clock className="w-7 h-7 mb-2 text-[#525866]" />
            <div className="text-12 font-medium text-[#F0F0F0] font-sans">Pilih Kartu Top 3</div>
            <div className="text-11 text-[#6B7280] font-sans mt-1">
              Klik salah satu tugas di Top 3 untuk mengatur alokasi waktu fokus
            </div>
          </div>
        ) : (
          <div className="max-w-[340px] mx-auto space-y-3">
            {/* 1. Card Timer Picker & Duration */}
            <Card className="p-4 shadow-xl flex flex-col items-center border-white/[0.08] bg-[#1C1D1F] rounded-[14px]">
              {/* Header Time Card dengan tombol Set Jam Sekarang */}
              <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
                <span className="text-13 font-medium text-[#F0F0F0] font-sans">Mulai Dari</span>
                <button
                  onClick={setTimeToCurrent}
                  className="text-[11px] text-[#3F76FF] hover:text-[#5B8CFF] font-sans transition cursor-pointer flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" /> Jam Sekarang
                </button>
              </div>

              {/* Vertical Time Drum / Wheel Simulator */}
              <div className="relative w-full flex flex-col items-center justify-center py-1 select-none">
                {/* Faded Row Atas (Preview -1) */}
                <div className="flex items-center justify-center gap-6 text-[#525866] text-11 font-sans py-0.5 opacity-40">
                  <span className="w-8 text-center">{selectedHour === 1 ? 12 : selectedHour - 1}</span>
                  <span className="text-[#525866]">:</span>
                  <span className="w-8 text-center">
                    {selectedMinute === 0 ? "45" : (selectedMinute - 15).toString().padStart(2, "0")}
                  </span>
                  <span className="w-8 text-center">{selectedPeriod === "am" ? "pm" : "am"}</span>
                </div>

                {/* Active Selected Row */}
                <div className="flex items-center justify-center gap-4 bg-white/[0.06] border border-white/[0.08] rounded-[10px] py-1.5 px-6 my-1 w-full shadow-inner">
                  <button
                    onClick={() => onSetHour((prev) => (prev % 12) + 1)}
                    className="w-10 text-center text-18 font-semibold text-[#F0F0F0] font-sans hover:text-[#3F76FF] transition cursor-pointer"
                    title="Klik untuk ubah jam"
                  >
                    {selectedHour}
                  </button>

                  <span className="text-16 font-bold text-[#9EA3AE]">:</span>

                  <button
                    onClick={() => onSetMinute((prev) => (prev + 5) % 60)}
                    className="w-10 text-center text-18 font-semibold text-[#F0F0F0] font-sans hover:text-[#3F76FF] transition cursor-pointer"
                    title="Klik untuk ubah menit (+5m)"
                  >
                    {selectedMinute.toString().padStart(2, "0")}
                  </button>

                  <button
                    onClick={() => onSetPeriod((prev) => (prev === "am" ? "pm" : "am"))}
                    className="w-10 text-center text-14 font-medium text-[#9EA3AE] hover:text-[#3F76FF] uppercase transition cursor-pointer"
                    title="Klik untuk ganti AM / PM"
                  >
                    {selectedPeriod}
                  </button>
                </div>

                {/* Faded Row Bawah (Preview +1) */}
                <div className="flex items-center justify-center gap-6 text-[#525866] text-11 font-sans py-0.5 opacity-40">
                  <span className="w-8 text-center">{selectedHour === 12 ? 1 : selectedHour + 1}</span>
                  <span className="text-[#525866]">:</span>
                  <span className="w-8 text-center">
                    {(selectedMinute + 15) % 60 === 0
                      ? "00"
                      : ((selectedMinute + 15) % 60).toString().padStart(2, "0")}
                  </span>
                  <span className="w-8 text-center">{selectedPeriod}</span>
                </div>
              </div>

              {/* Shortcuts Jam Cepat */}
              <div className="w-full mt-2 pt-2 border-t border-white/[0.04]">
                <div className="text-[10px] text-[#6B7280] font-sans mb-1 text-left">Shortcut Jam:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { h: 9, m: 0, p: "am", label: "9 am" },
                    { h: 12, m: 0, p: "pm", label: "12 pm" },
                    { h: 4, m: 0, p: "pm", label: "4 pm" },
                    { h: 7, m: 0, p: "pm", label: "7 pm" },
                  ].map((item) => {
                    const isActivePreset =
                      selectedHour === item.h &&
                      selectedMinute === item.m &&
                      selectedPeriod === item.p;

                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          onSetHour(item.h);
                          onSetMinute(item.m);
                          onSetPeriod(item.p as "am" | "pm");
                        }}
                        className={`h-7 rounded-[4px] border text-11 font-sans transition cursor-pointer flex items-center justify-center ${
                          isActivePreset
                            ? "bg-white/[0.08] border-[#3F76FF] text-[#3F76FF] font-medium"
                            : "bg-[#161719] border-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0] hover:bg-white/[0.04]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pilihan & Tambah Durasi Pengerjaan */}
              <div className="w-full mt-2.5 pt-2.5 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-[11px] font-sans mb-1.5">
                  <span className="text-[#9EA3AE]">Mau fokus berapa lama:</span>
                  <span className="text-emerald-400 font-medium">{customDuration} menit</span>
                </div>

                <div className="grid grid-cols-5 gap-1 mb-2">
                  {[15, 25, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => onSetDuration(mins)}
                      className={`h-7 rounded-[4px] border text-11 font-sans transition cursor-pointer flex items-center justify-center ${
                        customDuration === mins
                          ? "bg-[#3F76FF] text-white font-medium border-[#3F76FF]"
                          : "bg-[#161719] border-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0]"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px] text-[#6B7280]">
                  <span className="text-[10px]">Tambah durasi:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSetDuration((prev) => prev + 5)}
                      className="px-2 py-0.5 rounded-[4px] bg-[#161719] border border-white/[0.06] hover:bg-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0] transition cursor-pointer"
                    >
                      +5m
                    </button>
                    <button
                      onClick={() => onSetDuration((prev) => prev + 15)}
                      className="px-2 py-0.5 rounded-[4px] bg-[#161719] border border-white/[0.06] hover:bg-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0] transition cursor-pointer"
                    >
                      +15m
                    </button>
                    <button
                      onClick={() => onSetDuration((prev) => Math.max(5, prev - 10))}
                      className="px-2 py-0.5 rounded-[4px] bg-[#161719] border border-white/[0.06] hover:bg-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0] transition cursor-pointer"
                    >
                      -10m
                    </button>
                  </div>
                </div>
              </div>

              {/* Tombol Kunci Jadwal */}
              <div className="w-full mt-3">
                <Button
                  onClick={() => onApplyTimeRange(formattedStartTime, customDuration)}
                  className="w-full h-9 rounded-[6px] bg-[#3F76FF] hover:bg-[#3364DB] active:scale-[0.98] text-white font-medium text-12 shadow-md transition"
                >
                  Kunci Jadwal ({formattedStartTime} - {calculatedEndTime})
                </Button>
              </div>
            </Card>

            {/* 2. Live Countdown Focus Card */}
            <Card className="p-4 shadow-xl border border-white/[0.08] bg-[#1C1D1F] rounded-[14px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-12 font-medium text-[#F0F0F0] font-sans">
                  <Timer className="w-3.5 h-3.5 text-[#3F76FF]" />
                  <span>Focus Countdown</span>
                </div>
                {activeTask?.id === selectedTask.id && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                )}
              </div>

              <div className="flex flex-col items-center justify-center py-3 bg-[#131415]/70 rounded-[10px] border border-white/[0.06]">
                <div className="font-mono text-32 font-bold tracking-wider text-[#F0F0F0]">
                  {activeTask?.id === selectedTask.id
                    ? formatTimer(secondsRemaining)
                    : formatTimer(customDuration * 60)}
                </div>
                <div className="text-11 text-[#6B7280] font-sans mt-0.5 truncate max-w-[240px]">
                  {activeTask?.id === selectedTask.id
                    ? isRunning
                      ? "Sedang berjalan..."
                      : "Timer dijeda"
                    : `Target alokasi: ${customDuration} menit`}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {activeTask?.id === selectedTask.id ? (
                  <>
                    <Button
                      onClick={onToggleTimer}
                      className={`flex-1 h-9 rounded-[6px] font-medium text-12 transition ${
                        isRunning
                          ? "bg-amber-500 hover:bg-amber-600 text-black"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {isRunning ? (
                        <span className="flex items-center gap-1.5">
                          <Pause className="w-3.5 h-3.5" /> Jeda Fokus
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5" /> Lanjutkan
                        </span>
                      )}
                    </Button>
                    <button
                      onClick={onResetTimer}
                      title="Reset Timer"
                      className="h-9 px-3 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.08] text-[#9EA3AE] hover:text-[#F0F0F0] border border-white/[0.06] transition cursor-pointer flex items-center justify-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      onApplyTimeRange(formattedStartTime, customDuration);
                      onStartFocus({
                        ...selectedTask,
                        durationMinutes: customDuration,
                        scheduledTime: formattedStartTime,
                        scheduledEndTime: calculatedEndTime,
                      });
                    }}
                    className="w-full h-9 rounded-[6px] bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-medium text-12 shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Mulai Fokus Sekarang
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};
