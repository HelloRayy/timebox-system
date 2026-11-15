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
  GripVertical,
  Sliders,
  CalendarCheck2
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
    { id: "t3-2", title: "Design Floating Bar Timebox Desk", durationMinutes: 30, priority: "high", completed: false },
  ]);

  // Selected card di Top 3 untuk scheduling
  const [selectedTop3Id, setSelectedTop3Id] = useState<string | null>("t3-2");

  // Dragging State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<"braindump" | "top3" | null>(null);
  const [isDragOverTop3, setIsDragOverTop3] = useState<boolean>(false);

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
    setSelectedTop3Id(task.id);
  };

  // Demote from Top 3 -> Brain Dump
  const demoteToBrainDump = (task: TaskItem) => {
    setTop3((prev) => prev.filter((t) => t.id !== task.id));
    setBrainDump((prev) => [{ ...task, scheduledTime: undefined }, ...prev]);
    if (selectedTop3Id === task.id) {
      setSelectedTop3Id(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (task: TaskItem, source: "braindump" | "top3") => {
    setDraggedTaskId(task.id);
    setDragSource(source);
  };

  const handleDropOnTop3 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTop3(false);
    if (!draggedTaskId || dragSource !== "braindump") return;

    const task = brainDump.find((t) => t.id === draggedTaskId);
    if (task) {
      promoteToTop3(task);
    }
    setDraggedTaskId(null);
    setDragSource(null);
  };

  // Assign slot time
  const assignSchedule = (taskId: string, time: string) => {
    setTop3((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, scheduledTime: time } : t))
    );
  };

  // Remove schedule from card
  const unassignSchedule = (taskId: string) => {
    setTop3((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, scheduledTime: undefined } : t))
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

  const selectedTask = top3.find((t) => t.id === selectedTop3Id);

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
            Interactive Flow
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

      {/* 2. Main Multi-Column Working Board */}
      <main className="flex-1 flex pt-11 pb-24 w-full h-full overflow-hidden">
        
        {/* KOLOM 1: Brain Dump (Staging Pool) */}
        <section className="w-80 border-r border-[#242528] bg-[#18191B]/40 flex flex-col h-full flex-shrink-0">
          <div className="p-3 border-b border-[#242528] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-200 text-xs">Brain Dump</span>
              <span className="text-[11px] font-mono text-neutral-500 bg-[#1E1F21] px-1.5 py-0.2 rounded border border-[#2E3035]">
                {brainDump.length}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">Tarik ke Top 3</span>
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
                  draggable
                  onDragStart={() => handleDragStart(task, "braindump")}
                  className="group p-2.5 rounded bg-[#1E1F21] border border-[#2E3035] hover:border-neutral-500 transition flex flex-col gap-1.5 cursor-grab active:cursor-grabbing hover:bg-[#232428]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-neutral-200 leading-snug line-clamp-2">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => promoteToTop3(task)}
                      title="Klik untuk pindahkan ke Top 3"
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-medium text-[#3E63DD] hover:text-[#5275EC] bg-[#3E63DD]/10 px-1.5 py-0.5 rounded transition cursor-pointer flex-shrink-0"
                    >
                      Top 3 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pl-5 text-[11px] text-neutral-400 font-mono">
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
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverTop3(true);
          }}
          onDragLeave={() => setIsDragOverTop3(false)}
          onDrop={handleDropOnTop3}
          className={`w-88 border-r border-[#242528] bg-[#161718] flex flex-col h-full flex-shrink-0 transition-colors ${
            isDragOverTop3 ? "bg-[#1E2333]/40 border-l border-l-[#3E63DD]" : ""
          }`}
        >
          <div className="p-3 border-b border-[#242528] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-neutral-200 text-xs">Top 3 Priorities</span>
              <span className="text-[11px] font-mono text-neutral-400 bg-[#1E1F21] px-1.5 py-0.2 rounded border border-[#2E3035]">
                {top3.length}/3
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">Klik kartu untuk set waktu</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {[0, 1, 2].map((index) => {
              const task = top3[index];
              const isSelected = task && selectedTop3Id === task.id;

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (task) {
                      setSelectedTop3Id(task.id);
                    }
                  }}
                  className={`min-h-[118px] rounded border transition p-3 flex flex-col justify-between cursor-pointer ${
                    task
                      ? task.completed
                        ? "bg-[#1A1B1D]/60 border-[#2A2B2E] opacity-50"
                        : isSelected
                        ? "bg-[#1E2024] border-[#3E63DD] ring-2 ring-[#3E63DD]/40 shadow-lg shadow-[#3E63DD]/5"
                        : activeTask?.id === task.id
                        ? "bg-[#1E2024] border-amber-500/60 ring-1 ring-amber-500/20"
                        : "bg-[#1E1F21] border-[#2E3035] hover:border-neutral-500"
                      : "border-dashed border-[#2E3035] bg-[#18191B]/20 flex items-center justify-center hover:border-neutral-600"
                  }`}
                >
                  {task ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                              Slot #{index + 1}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-mono text-[#3E63DD] bg-[#3E63DD]/15 px-1.5 py-0.2 rounded border border-[#3E63DD]/30">
                                Active Set Waktu
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              demoteToBrainDump(task);
                            }}
                            title="Kembalikan ke Brain Dump"
                            className="text-neutral-500 hover:text-neutral-300 transition cursor-pointer p-0.5"
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
                          {task.scheduledTime ? (
                            <span className="text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-1.5 py-0.2 rounded flex items-center gap-1">
                              <CalendarCheck2 className="w-3 h-3" />
                              {task.scheduledTime}
                            </span>
                          ) : (
                            <span className="text-amber-400/80 bg-amber-950/30 border border-amber-800/40 px-1 rounded text-[10px]">
                              Belum Dijadwal
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!task.completed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startFocusBox(task);
                              }}
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
                            onClick={(e) => {
                              e.stopPropagation();
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
                    <div className="text-center text-xs text-neutral-600 font-mono py-4">
                      Slot #{index + 1} Kosong
                      <div className="text-[10px] text-neutral-600 mt-1">
                        Drag task dari Brain Dump ke sini
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* KOLOM 3: Daily Time-Grid (Hanya terlihat atau aktif saat ada kartu Top 3 yang diklik) */}
        <section className="flex-1 bg-[#151617] flex flex-col h-full overflow-hidden transition-all">
          <div className="p-3 border-b border-[#242528] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-200 text-xs">Daily Time Grid</span>
              {selectedTask ? (
                <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-[#1E1F21] px-2 py-0.5 rounded border border-[#2E3035]">
                  <span className="text-neutral-500">Target:</span>
                  <span className="text-[#3E63DD] font-medium truncate max-w-[200px]">
                    {selectedTask.title}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">({selectedTask.durationMinutes}m)</span>
                </div>
              ) : (
                <span className="text-xs text-neutral-500 font-mono">Pilih kartu di Top 3 untuk mengatur jam</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#3E63DD]" /> Terjadwal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-neutral-700" /> Slot Bebas</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {!selectedTask ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto text-neutral-500">
                <Sliders className="w-8 h-8 mb-3 text-neutral-700" />
                <div className="text-xs font-medium text-neutral-300">Pilih Salah Satu Tugas di Top 3</div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Klik salah satu kartu di kolom Top 3 Priorities untuk membuka dan menaruh jadwalnya ke slot jam Time Grid.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-1">
                {HOURS.map((hour) => {
                  const scheduledTask = top3.find((t) => t.scheduledTime === hour);
                  const isCurrentActive = activeTask && activeTask.scheduledTime === hour;
                  const isSelectedTaskHere = selectedTask.scheduledTime === hour;

                  return (
                    <div
                      key={hour}
                      className={`flex items-center group min-h-[44px] border-b border-[#242528]/60 rounded transition px-2.5 ${
                        isSelectedTaskHere
                          ? "bg-[#3E63DD]/10 border-[#3E63DD]/60"
                          : "hover:bg-[#18191B]/60"
                      }`}
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
                                ? "bg-[#3E63DD]/20 border-[#3E63DD] text-white"
                                : scheduledTask.id === selectedTask.id
                                ? "bg-[#3E63DD]/15 border-[#3E63DD] text-white"
                                : "bg-[#1E1F21] border-[#2E3035] text-neutral-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3E63DD]" />
                              <span className="text-xs font-medium">{scheduledTask.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-mono">
                              <span className="text-neutral-400">{scheduledTask.durationMinutes}m</span>
                              {scheduledTask.id === selectedTask.id && (
                                <button
                                  onClick={() => unassignSchedule(scheduledTask.id)}
                                  title="Lepas jam"
                                  className="text-neutral-400 hover:text-red-400 transition cursor-pointer p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-neutral-600 text-xs">
                            <span className="text-[11px] font-mono opacity-0 group-hover:opacity-40 transition">
                              Slot Kosong
                            </span>
                            {/* Tombol Assign Langsung ke Kartu Top 3 yang Sedang Aktif */}
                            <button
                              onClick={() => assignSchedule(selectedTask.id, hour)}
                              className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-[11px] font-medium bg-[#3E63DD] hover:bg-[#4E73ED] text-white px-2.5 py-1 rounded transition cursor-pointer shadow-sm"
                            >
                              Jadwalkan jam {hour}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
