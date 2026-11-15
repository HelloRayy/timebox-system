import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Flame,
  X,
} from "lucide-react";
import "./App.css";

export type Priority = "urgent" | "high" | "medium" | "low" | "none";

export interface TaskItem {
  id: string;
  title: string;
  durationMinutes: number;
  priority: Priority;
  completed: boolean;
  scheduledTime?: string; // e.g. "09:00"
}

const HOURS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30"
];

export default function App() {
  // 1. Brain Dump list (bank tugas mentah)
  const [brainDump, setBrainDump] = useState<TaskItem[]>([
    { id: "bd-1", title: "Review PR backend optimization", durationMinutes: 30, priority: "high", completed: false },
    { id: "bd-2", title: "Kirim update milestone ke klien", durationMinutes: 20, priority: "medium", completed: false },
    { id: "bd-3", title: "Tulis test case auth module", durationMinutes: 45, priority: "low", completed: false },
  ]);

  // 2. Top 3 Priorities (Gate Fokus)
  const [top3, setTop3] = useState<TaskItem[]>([
    { id: "t3-1", title: "Fix memory leak di Tauri WebKit backend", durationMinutes: 60, priority: "urgent", completed: false, scheduledTime: "09:00" },
    { id: "t3-2", title: "Design Floating Bar Timebox Desk", durationMinutes: 30, priority: "high", completed: true, scheduledTime: "10:30" },
  ]);

  // Floating Input State
  const [inputValue, setInputValue] = useState("");
  const inputDuration = 30;
  const inputPriority: Priority = "medium";

  // Timer State
  const [activeTask, setActiveTask] = useState<TaskItem | null>(top3[0] || null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hardStopDialog, setHardStopDialog] = useState<TaskItem | null>(null);

  // Timer Interval Loop
  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      if (activeTask) {
        setHardStopDialog(activeTask);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, activeTask]);

  // Submit from Floating Input Bar (Center-Bottom)
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let text = inputValue.trim();
    let duration = inputDuration;
    let priority: Priority = inputPriority;

    // Smart Syntax Parsing: /30m, /45m
    const durationMatch = text.match(/\/(\d+)m?/i);
    if (durationMatch) {
      duration = parseInt(durationMatch[1], 10);
      text = text.replace(durationMatch[0], "").trim();
    }

    // Smart Syntax Parsing: @urgent, @high, @med, @low
    if (/@urgent/i.test(text)) {
      priority = "urgent";
      text = text.replace(/@urgent/gi, "").trim();
    } else if (/@high/i.test(text)) {
      priority = "high";
      text = text.replace(/@high/gi, "").trim();
    } else if (/@med|@medium/i.test(text)) {
      priority = "medium";
      text = text.replace(/@med|@medium/gi, "").trim();
    } else if (/@low/i.test(text)) {
      priority = "low";
      text = text.replace(/@low/gi, "").trim();
    }

    const newTask: TaskItem = {
      id: "task-" + Date.now(),
      title: text || "Untitled Task",
      durationMinutes: duration,
      priority: priority,
      completed: false,
    };

    // Otomatis meluncur masuk ke Brain Dump
    setBrainDump((prev) => [newTask, ...prev]);
    setInputValue("");
  };

  // Move from Brain Dump -> Top 3 Gate
  const promoteToTop3 = (task: TaskItem) => {
    if (top3.length >= 3) {
      alert("Top 3 sudah penuh! Selesaikan atau turunkan 1 tugas dulu.");
      return;
    }
    setBrainDump((prev) => prev.filter((t) => t.id !== task.id));
    setTop3((prev) => [...prev, task]);
  };

  // Demote from Top 3 -> Brain Dump
  const demoteToBrainDump = (task: TaskItem) => {
    setTop3((prev) => prev.filter((t) => t.id !== task.id));
    setBrainDump((prev) => [{ ...task, scheduledTime: undefined }, ...prev]);
  };

  // Assign slot time
  const assignSchedule = (taskId: string, time: string) => {
    setTop3((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, scheduledTime: time } : t))
    );
  };

  // Start Focus Box
  const startFocusBox = (task: TaskItem) => {
    setActiveTask(task);
    setSecondsRemaining(task.durationMinutes * 60);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    if (!activeTask && top3.length > 0) {
      startFocusBox(top3[0]);
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (activeTask) {
      setSecondsRemaining(activeTask.durationMinutes * 60);
    }
  };

  // Format MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Helper Priority Badge
  const renderPriorityBadge = (p: Priority) => {
    switch (p) {
      case "urgent":
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/70 border border-red-800 text-red-300">Urgent</span>;
      case "high":
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950/70 border border-orange-800 text-orange-300">High</span>;
      case "medium":
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300">Med</span>;
      case "low":
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-800 text-indigo-300">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#151617] text-[#F1F2F4] text-[13px] antialiased select-none overflow-hidden relative">
      {/* 1. Header Bar Minimalis Khas Plane */}
      <header className="absolute top-0 left-0 right-0 h-11 border-b border-[#242528] bg-[#151617]/90 backdrop-blur z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#3E63DD]" />
            raditya-rayhan
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-400">Timebox Daily</span>
          <span className="text-[10px] font-mono bg-[#1E1F21] border border-[#2E3035] text-neutral-400 px-1.5 py-0.5 rounded">
            90% Compact
          </span>
        </div>

        {/* Mini Active Timer status di Header */}
        <div className="flex items-center gap-3">
          {activeTask && (
            <div className="flex items-center gap-2 bg-[#1E1F21] border border-[#2E3035] px-2.5 py-1 rounded text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
              <span className="font-mono font-medium text-white">{formatTimer(secondsRemaining)}</span>
              <span className="text-neutral-400 truncate max-w-[150px]">{activeTask.title}</span>
              <button
                onClick={toggleTimer}
                title={isRunning ? "Pause" : "Play"}
                className="ml-1 text-neutral-300 hover:text-white transition cursor-pointer"
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={resetTimer}
                title="Reset Timer"
                className="text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="text-[11px] font-mono text-neutral-500">
            {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>
      </header>

      {/* 2. Main 3-Column Working Board */}
      <main className="flex-1 flex pt-11 pb-24 w-full h-full overflow-hidden">
        
        {/* KOLOM 1: Brain Dump (Staging Pool) */}
        <section className="w-80 border-r border-[#242528] bg-[#18191B]/40 flex flex-col h-full">
          <div className="p-3 border-b border-[#242528] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-200 text-xs">Brain Dump</span>
              <span className="text-[11px] font-mono text-neutral-500 bg-[#1E1F21] px-1.5 py-0.2 rounded border border-[#2E3035]">
                {brainDump.length}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">Bank Tugas</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
            {brainDump.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                Isi kepala kosong. Ketik tugas di bar bawah lalu tekan Enter.
              </div>
            ) : (
              brainDump.map((task) => (
                <div
                  key={task.id}
                  className="group p-2 rounded bg-[#1E1F21] border border-[#2E3035] hover:border-neutral-600 transition flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-neutral-200 leading-snug line-clamp-2">
                      {task.title}
                    </span>
                    <button
                      onClick={() => promoteToTop3(task)}
                      title="Promosikan ke Top 3 Prioritas"
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-medium text-[#3E63DD] hover:text-[#5275EC] bg-[#3E63DD]/10 px-1.5 py-0.5 rounded transition cursor-pointer flex-shrink-0"
                    >
                      Top 3 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {task.durationMinutes}m
                    </span>
                    {renderPriorityBadge(task.priority)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* KOLOM 2: Top 3 Priorities Gate */}
        <section className="w-88 border-r border-[#242528] bg-[#161718] flex flex-col h-full">
          <div className="p-3 border-b border-[#242528] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-neutral-200 text-xs">Top 3 Priorities</span>
              <span className="text-[11px] font-mono text-neutral-400 bg-[#1E1F21] px-1.5 py-0.2 rounded border border-[#2E3035]">
                {top3.length}/3
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">Kunci Hari Ini</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {[0, 1, 2].map((index) => {
              const task = top3[index];
              return (
                <div
                  key={index}
                  className={`min-h-[110px] rounded border transition p-3 flex flex-col justify-between ${
                    task
                      ? task.completed
                        ? "bg-[#1A1B1D]/60 border-[#2A2B2E] opacity-50"
                        : activeTask?.id === task.id
                        ? "bg-[#1E2024] border-[#3E63DD] ring-1 ring-[#3E63DD]/30"
                        : "bg-[#1E1F21] border-[#2E3035] hover:border-neutral-600"
                      : "border-dashed border-[#2E3035] bg-[#18191B]/20 flex items-center justify-center"
                  }`}
                >
                  {task ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                            Priority #{index + 1}
                          </span>
                          <button
                            onClick={() => demoteToBrainDump(task)}
                            title="Kembalikan ke Brain Dump"
                            className="text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className={`text-xs font-medium leading-snug ${task.completed ? "line-through text-neutral-400" : "text-white"}`}>
                          {task.title}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#2A2B2E] text-[11px]">
                        <div className="flex items-center gap-1.5 font-mono text-neutral-400">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <span>{task.durationMinutes}m</span>
                          {task.scheduledTime && (
                            <span className="text-[#3E63DD] bg-[#3E63DD]/10 px-1 rounded">
                              @{task.scheduledTime}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!task.completed && (
                            <button
                              onClick={() => startFocusBox(task)}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                activeTask?.id === task.id && isRunning
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-[#26272B] hover:bg-[#33363D] text-neutral-200"
                              }`}
                            >
                              {activeTask?.id === task.id && isRunning ? "Running" : "Start"}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setTop3((prev) =>
                                prev.map((t) =>
                                  t.id === task.id ? { ...t, completed: !t.completed } : t
                                )
                              );
                            }}
                            className="text-neutral-400 hover:text-emerald-400 transition cursor-pointer"
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${task.completed ? "text-emerald-400 fill-emerald-400/20" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-xs text-neutral-600 font-mono">
                      Slot #{index + 1} Kosong
                      <div className="text-[10px] text-neutral-700 mt-0.5">Promosikan dari Brain Dump</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* KOLOM 3: Daily Time-Grid (Jadwal Jam Kaku) */}
        <section className="flex-1 bg-[#151617] flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-[#242528] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-200 text-xs">Today's Time Grid</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#3E63DD]" /> Scheduled</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-neutral-700" /> Open Slot</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="max-w-3xl mx-auto space-y-1">
              {HOURS.map((hour) => {
                const scheduledTask = top3.find((t) => t.scheduledTime === hour);
                const isCurrentActive = activeTask && activeTask.scheduledTime === hour;

                return (
                  <div
                    key={hour}
                    className="flex items-center group min-h-[44px] border-b border-[#242528]/60 hover:bg-[#18191B]/40 rounded transition px-2"
                  >
                    {/* Hour Label */}
                    <div className="w-14 font-mono text-[11px] text-neutral-500 select-none">
                      {hour}
                    </div>

                    {/* Time Slot Body */}
                    <div className="flex-1 pl-3">
                      {scheduledTask ? (
                        <div
                          className={`flex items-center justify-between p-2 rounded border transition ${
                            isCurrentActive && isRunning
                              ? "bg-[#3E63DD]/10 border-[#3E63DD] text-white"
                              : "bg-[#1E1F21] border-[#2E3035] text-neutral-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3E63DD]" />
                            <span className="text-xs font-medium">{scheduledTask.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                            <span>{scheduledTask.durationMinutes}m</span>
                            {renderPriorityBadge(scheduledTask.priority)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-neutral-600 text-xs">
                          <span className="text-[11px] font-mono opacity-0 group-hover:opacity-60 transition">
                            Slot Kosong
                          </span>
                          {/* Quick plot dropdown / button */}
                          <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                            {top3
                              .filter((t) => !t.scheduledTime && !t.completed)
                              .map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => assignSchedule(t.id, hour)}
                                  className="text-[10px] bg-[#1E1F21] border border-[#2E3035] hover:border-neutral-500 px-2 py-0.5 rounded text-neutral-300 transition cursor-pointer"
                                >
                                  + Plot "{t.title.slice(0, 14)}..."
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* 3. Floating Input Bar (Center-Bottom ala Cursor / Antigravity) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
        <form
          onSubmit={handleInputSubmit}
          className="bg-[#1A1B1D] border border-[#2E3035] rounded-xl shadow-2xl p-2 flex flex-col gap-1.5 backdrop-blur-md focus-within:border-neutral-500 transition-all"
        >
          <div className="flex items-center gap-2 px-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tulis tugas baru... ketik /30m untuk durasi atau @urgent untuk prioritas"
              className="flex-1 bg-transparent border-none text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-950 flex items-center justify-center hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-100 transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Helper Syntax Pills */}
          <div className="flex items-center justify-between pt-1 border-t border-[#242528] px-1 text-[11px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] bg-[#242528] px-1.5 py-0.5 rounded text-neutral-400">
                Enter
              </span>
              <span>masuk Brain Dump</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-neutral-400">/25m /45m</span>
              <span className="text-red-400">@urgent</span>
              <span className="text-amber-400">@high</span>
            </div>
          </div>
        </form>
      </div>

      {/* 4. Hard Stop Evaluation Modal (Saat Timer Habis) */}
      {hardStopDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1F21] border border-[#2E3035] w-full max-w-md rounded-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-sm text-white">Timebox Hard Stop!</h3>
            </div>
            <p className="text-xs text-neutral-300 mb-4">
              Waktu alokasi untuk <strong className="text-white">"{hardStopDialog.title}"</strong> sudah habis. 
              Sesuai aturan timebox: stop pekerjaan sekarang dan tentukan statusnya.
            </p>

            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  // Jadwalkan ulang (kembalikan ke Brain Dump)
                  demoteToBrainDump(hardStopDialog);
                  setHardStopDialog(null);
                  setActiveTask(null);
                }}
                className="px-3 py-1.5 rounded bg-[#26272B] hover:bg-[#33363D] text-neutral-200 transition cursor-pointer"
              >
                Belum Kelar (Jadwalkan Ulang)
              </button>
              <button
                onClick={() => {
                  // Tandai selesai
                  setTop3((prev) =>
                    prev.map((t) => (t.id === hardStopDialog.id ? { ...t, completed: true } : t))
                  );
                  setHardStopDialog(null);
                  setActiveTask(null);
                }}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer"
              >
                Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
