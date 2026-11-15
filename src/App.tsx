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
  CalendarCheck2,
  Check
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
  scheduledEndTime?: string; // e.g. "10:00"
}

// 24 Hour Slots
const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

// Helper kalkulasi end time berdasarkan durasi menit
const calculateEndTime = (start: string, durationMin: number) => {
  const [h, m] = start.split(":").map(Number);
  const totalMin = h * 60 + m + durationMin;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
};

export default function App() {
  // 1. Brain Dump list
  const [brainDump, setBrainDump] = useState<TaskItem[]>([
    { id: "bd-1", title: "Review PR backend optimization", durationMinutes: 30, priority: "high", completed: false },
    { id: "bd-2", title: "Kirim update milestone ke klien", durationMinutes: 20, priority: "medium", completed: false },
    { id: "bd-3", title: "Tulis test case auth module", durationMinutes: 45, priority: "low", completed: false },
  ]);

  // 2. Top 3 Priorities
  const [top3, setTop3] = useState<TaskItem[]>([
    { id: "t3-1", title: "Fix memory leak di Tauri WebKit backend", durationMinutes: 60, priority: "urgent", completed: false, scheduledTime: "09:00", scheduledEndTime: "10:00" },
    { id: "t3-2", title: "Design Floating Bar Timebox Desk", durationMinutes: 30, priority: "high", completed: false },
  ]);

  // Selected card di Top 3 untuk scheduling
  const [selectedTop3Id, setSelectedTop3Id] = useState<string | null>("t3-2");

  // Date selection state (Interactive mini calendar ala referensi)
  const [selectedDate, setSelectedDate] = useState<number>(15);

  // Time Range Picker State untuk kartu yang dipilih
  const [customStartTime, setCustomStartTime] = useState<string>("10:00");
  const [customDuration, setCustomDuration] = useState<number>(30);

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

  // Sync state picker saat card selected berganti
  useEffect(() => {
    const task = top3.find((t) => t.id === selectedTop3Id);
    if (task) {
      if (task.scheduledTime) {
        setCustomStartTime(task.scheduledTime);
      }
      setCustomDuration(task.durationMinutes);
    }
  }, [selectedTop3Id, top3]);

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

    const durationMatch = text.match(/\/(\d+)m?/i);
    if (durationMatch) {
      duration = parseInt(durationMatch[1], 10);
      text = text.replace(durationMatch[0], "").trim();
    }

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

    setBrainDump((prev) => [newTask, ...prev]);
    setInputValue("");
  };

  const promoteToTop3 = (task: TaskItem) => {
    if (top3.length >= 3) {
      alert("Top 3 sudah penuh! Selesaikan atau turunkan 1 tugas dulu.");
      return;
    }
    setBrainDump((prev) => prev.filter((t) => t.id !== task.id));
    setTop3((prev) => [...prev, task]);
    setSelectedTop3Id(task.id);
  };

  const demoteToBrainDump = (task: TaskItem) => {
    setTop3((prev) => prev.filter((t) => t.id !== task.id));
    setBrainDump((prev) => [{ ...task, scheduledTime: undefined, scheduledEndTime: undefined }, ...prev]);
    if (selectedTop3Id === task.id) {
      setSelectedTop3Id(null);
    }
  };

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

  // Simpan Time Range ke kartu terpilih
  const applyTimeRange = (startTime: string, duration: number) => {
    if (!selectedTop3Id) return;
    const endTime = calculateEndTime(startTime, duration);

    setTop3((prev) =>
      prev.map((t) =>
        t.id === selectedTop3Id
          ? { ...t, scheduledTime: startTime, scheduledEndTime: endTime, durationMinutes: duration }
          : t
      )
    );
  };

  const unassignSchedule = (taskId: string) => {
    setTop3((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, scheduledTime: undefined, scheduledEndTime: undefined } : t
      )
    );
  };

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

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Redesigned Priority Indicator: Minimal Dot + Clean Label (Tanpa badge kotak tebal)
  const renderPriorityBadge = (p: Priority) => {
    switch (p) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Med
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const selectedTask = top3.find((t) => t.id === selectedTop3Id);
  const calculatedEndTime = calculateEndTime(customStartTime, customDuration);

  // Mini calendar grid numbers (November 2026)
  const calendarDays = [
    { day: 26, isOtherMonth: true }, { day: 27, isOtherMonth: true }, { day: 28, isOtherMonth: true }, { day: 29, isOtherMonth: true }, { day: 30, isOtherMonth: true }, { day: 31, isOtherMonth: true }, { day: 1 },
    { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 },
    { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 }, { day: 15 },
    { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 },
    { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 },
    { day: 30 }, { day: 1, isOtherMonth: true }, { day: 2, isOtherMonth: true }, { day: 3, isOtherMonth: true }, { day: 4, isOtherMonth: true }, { day: 5, isOtherMonth: true }, { day: 6, isOtherMonth: true }
  ];

  return (
    <div className="flex h-screen w-screen bg-[#131415] text-[#F0F0F0] text-[13px] antialiased select-none overflow-hidden relative font-sans">
      
      {/* 1. Header Bar Minimalis Khas Plane */}
      <header className="absolute top-0 left-0 right-0 h-10 border-b border-white/[0.08] bg-[#131415] z-20 flex items-center justify-between px-3.5">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-[#F0F0F0]">
            <span className="w-2 h-2 rounded-full bg-[#3F76FF]" />
            raditya-rayhan
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-[#9EA3AE]">Timebox Daily</span>
        </div>

        {/* Mini Active Timer status di Header */}
        <div className="flex items-center gap-2.5">
          {activeTask && (
            <div className="flex items-center gap-2 bg-[#1C1D1F] border border-white/[0.08] px-2.5 py-1 rounded-[4px] text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-[#6B7280]"}`} />
              <span className="font-sans font-medium text-[#F0F0F0] text-[12px] tabular-nums tracking-wide">{formatTimer(secondsRemaining)}</span>
              <span className="text-[#9EA3AE] truncate max-w-[140px] font-sans text-[12px]">{activeTask.title}</span>
              <button
                onClick={toggleTimer}
                title={isRunning ? "Pause" : "Play"}
                className="ml-1 text-[#9EA3AE] hover:text-[#F0F0F0] transition cursor-pointer"
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={resetTimer}
                title="Reset Timer"
                className="text-[#6B7280] hover:text-[#F0F0F0] transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="text-[11px] text-[#6B7280] font-sans">
            {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>
      </header>

      {/* 2. Main 3-Column Working Board */}
      <main className="flex-1 flex pt-10 pb-20 w-full h-full overflow-hidden">
        
        {/* KOLOM 1: Brain Dump (Staging Pool) */}
        <section className="w-76 border-r border-white/[0.08] bg-[#161719] flex flex-col h-full flex-shrink-0">
          <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9EA3AE]" />
              <span className="font-medium text-[#F0F0F0] text-12 font-sans">Brain Dump</span>
              <span className="text-11 font-sans text-[#9EA3AE] bg-[#1C1D1F] px-1.5 py-0.2 rounded border border-white/[0.08]">
                {brainDump.length}
              </span>
            </div>
            <span className="text-11 text-[#6B7280] font-sans">Tarik ke Top 3</span>
          </div>

          {/* List Task Brain Dump */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
            {brainDump.length === 0 ? (
              <div className="p-6 text-center text-12 text-[#6B7280] font-sans">
                Isi kepala kosong. Ketik tugas di bar bawah lalu tekan Enter.
              </div>
            ) : (
              brainDump.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, "braindump")}
                  className="group p-2.5 rounded-[6px] border border-white/[0.08] bg-[#1C1D1F] hover:bg-[#252629] hover:border-white/[0.14] transition-all cursor-grab active:cursor-grabbing flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#9EA3AE] flex-shrink-0 mt-0.5" />
                      <span className="text-13 font-sans text-[#F0F0F0] leading-snug line-clamp-2">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => promoteToTop3(task)}
                      title="Klik untuk pindahkan ke Top 3"
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-11 font-medium font-sans text-[#3F76FF] hover:text-[#5B8CFF] bg-[#3F76FF]/10 px-1.5 py-0.5 rounded-[4px] transition cursor-pointer flex-shrink-0"
                    >
                      Top 3 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pl-5 text-11 text-[#9EA3AE] font-sans">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#6B7280]" />
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
          className={`w-80 border-r border-white/[0.08] bg-[#18191B] flex flex-col h-full flex-shrink-0 transition-colors ${
            isDragOverTop3 ? "bg-[#1E2333]/30 border-l border-l-[#3F76FF]" : ""
          }`}
        >
          <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-[#F0F0F0] text-12 font-sans">Top 3 Priorities</span>
              <span className="text-11 font-sans text-[#9EA3AE] bg-[#1C1D1F] px-1.5 py-0.2 rounded border border-white/[0.08]">
                {top3.length}/3
              </span>
            </div>
            <span className="text-11 text-[#6B7280] font-sans">Klik kartu untuk set jam</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {[0, 1, 2].map((index) => {
              const task = top3[index];
              const isSelected = task && selectedTop3Id === task.id;
              const isTaskRunning = task && activeTask?.id === task.id && isRunning;

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (task) {
                      setSelectedTop3Id(task.id);
                    }
                  }}
                  className={`min-h-[114px] rounded-[6px] transition-all p-3 flex flex-col justify-between cursor-pointer ${
                    task
                      ? task.completed
                        ? "bg-[#1C1D1F]/50 border border-white/[0.04] opacity-50"
                        : isTaskRunning
                        ? "border border-white/[0.1] border-l-2 border-l-[#3F76FF] bg-[#1C1D1F] ring-1 ring-[#3F76FF]/20"
                        : isSelected
                        ? "bg-[#212327] border border-white/[0.14] border-l-2 border-l-[#3F76FF] shadow-sm"
                        : "bg-[#1C1D1F] border border-white/[0.08] hover:bg-[#252629] hover:border-white/[0.12]"
                      : "border border-dashed border-white/[0.08] bg-[#151617]/50 flex items-center justify-center hover:border-white/[0.14]"
                  }`}
                >
                  {task ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-sans text-amber-400 font-semibold uppercase tracking-wider">
                              Slot #{index + 1}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-sans text-[#3F76FF] bg-[#3F76FF]/10 px-1.5 py-0.2 rounded-[3px] border border-[#3F76FF]/25">
                                Aktif Mengatur Waktu
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              demoteToBrainDump(task);
                            }}
                            title="Kembalikan ke Brain Dump"
                            className="text-[#6B7280] hover:text-[#F0F0F0] transition cursor-pointer p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className={`text-13 font-sans font-medium leading-snug ${task.completed ? "line-through text-[#6B7280]" : "text-[#F0F0F0]"}`}>
                          {task.title}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-11">
                        <div className="flex items-center gap-1.5 font-sans text-[#9EA3AE]">
                          <Clock className="w-3 h-3 text-[#6B7280]" />
                          <span>{task.durationMinutes}m</span>
                          {task.scheduledTime ? (
                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-[3px] flex items-center gap-1 text-[11px]">
                              <CalendarCheck2 className="w-3 h-3" />
                              {task.scheduledTime} - {task.scheduledEndTime || calculateEndTime(task.scheduledTime, task.durationMinutes)}
                            </span>
                          ) : (
                            <span className="text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-[3px] text-[10px]">
                              Pilih Range Jam
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
                              setTop3((prev) =>
                                prev.map((t) =>
                                  t.id === task.id ? { ...t, completed: !t.completed } : t
                                )
                              );
                            }}
                            className="text-[#6B7280] hover:text-emerald-400 transition cursor-pointer"
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${task.completed ? "text-emerald-400 fill-emerald-500/20" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-12 text-[#6B7280] font-sans py-4">
                      Slot #{index + 1} Kosong
                      <div className="text-11 text-[#6B7280] mt-1">
                        Drag task dari Brain Dump ke sini
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* KOLOM 3: Time Range Picker & Calendar Scheduler (Mengadopsi UI Referensi User) */}
        <section className="flex-1 bg-[#131415] flex flex-col h-full overflow-hidden transition-all">
          <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#9EA3AE]" />
              <span className="font-medium text-[#F0F0F0] text-12 font-sans">Time Range & Date Scheduler</span>
              {selectedTask && (
                <div className="flex items-center gap-1.5 text-12 text-[#F0F0F0] bg-[#1C1D1F] px-2 py-0.5 rounded-[4px] border border-white/[0.08]">
                  <span className="text-[#6B7280]">Target:</span>
                  <span className="text-[#3F76FF] font-medium truncate max-w-[180px]">
                    {selectedTask.title}
                  </span>
                </div>
              )}
            </div>

            {selectedTask?.scheduledTime && (
              <button
                onClick={() => unassignSchedule(selectedTask.id)}
                className="text-11 text-red-400 hover:text-red-300 font-sans cursor-pointer transition flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Lepas Jadwal
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {!selectedTask ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto text-[#6B7280]">
                <Clock className="w-8 h-8 mb-3 text-[#525866]" />
                <div className="text-13 font-medium text-[#F0F0F0] font-sans">Pilih Kartu di Kolom Top 3</div>
                <p className="text-11 text-[#9EA3AE] mt-1 font-sans">
                  Klik salah satu kartu prioritas untuk mengatur tanggal dan rentang jam mulai-selesai timebox.
                </p>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-6">
                
                {/* 1. Time Range Box (Start Time -> End Time) */}
                <div className="bg-[#1C1D1F] border border-white/[0.08] rounded-[8px] p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3 text-12 font-sans">
                    <span className="font-medium text-[#F0F0F0]">Rentang Jam Timebox (Start & End Time)</span>
                    <span className="text-11 text-[#9EA3AE]">Durasi: {customDuration} Menit</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Start Time Select */}
                    <div>
                      <label className="block text-[11px] text-[#6B7280] font-sans mb-1">Mulai (Start Time)</label>
                      <select
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="w-full bg-[#161719] border border-white/[0.08] text-[#F0F0F0] font-sans text-12 rounded-[4px] px-2.5 py-1.5 focus:border-[#3F76FF] focus:outline-none transition cursor-pointer"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time} className="bg-[#1C1D1F] text-white">
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End Time Display (Calculated) */}
                    <div>
                      <label className="block text-[11px] text-[#6B7280] font-sans mb-1">Selesai (End Time)</label>
                      <div className="w-full bg-[#161719] border border-white/[0.08] text-emerald-400 font-sans text-12 rounded-[4px] px-2.5 py-1.5 select-none flex items-center justify-between">
                        <span>{calculatedEndTime}</span>
                        <span className="text-[10px] text-[#6B7280] font-sans">Otomatis</span>
                      </div>
                    </div>
                  </div>

                  {/* Preset Durasi Cepat */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-[11px] text-[#6B7280] font-sans mr-1">Preset Durasi:</span>
                    {[15, 25, 30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setCustomDuration(mins)}
                        className={`px-2 py-0.5 rounded-[3px] text-11 font-sans transition cursor-pointer ${
                          customDuration === mins
                            ? "bg-[#3F76FF] text-white font-medium"
                            : "bg-white/[0.04] text-[#9EA3AE] hover:bg-white/[0.08]"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => applyTimeRange(customStartTime, customDuration)}
                    className="w-full mt-3.5 py-2 rounded-[4px] bg-[#3F76FF] hover:bg-[#3364DB] text-white font-medium text-12 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Kunci Jadwal {customStartTime} - {calculatedEndTime}
                  </button>
                </div>

                {/* 2. Mini Calendar UI (Mengikuti Layout Desain Gambar Referensi User) */}
                <div className="bg-[#1C1D1F] border border-white/[0.08] rounded-[8px] p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3 text-12 font-sans">
                    <span className="font-medium text-[#F0F0F0]">Pilih Tanggal Timebox</span>
                    <span className="text-11 text-[#9EA3AE]">November 2026</span>
                  </div>

                  {/* Day Headers (Mo, Tu, We, Th, Fr, Sa, Su) */}
                  <div className="grid grid-cols-7 gap-1 text-center text-11 text-[#6B7280] font-sans mb-1.5">
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                    <span>Su</span>
                  </div>

                  {/* Calendar Days Matrix */}
                  <div className="grid grid-cols-7 gap-1 text-center text-12 font-sans">
                    {calendarDays.map((item, idx) => {
                      const isSelected = selectedDate === item.day && !item.isOtherMonth;
                      const isToday = item.day === 15 && !item.isOtherMonth;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!item.isOtherMonth) {
                              setSelectedDate(item.day);
                            }
                          }}
                          className={`h-8 rounded-[4px] flex items-center justify-center transition cursor-pointer ${
                            item.isOtherMonth
                              ? "text-white/20 hover:bg-transparent cursor-default"
                              : isSelected
                              ? "bg-[#3F76FF] text-white font-semibold shadow-sm"
                              : isToday
                              ? "bg-white/[0.08] text-[#F0F0F0] font-medium border border-[#3F76FF]/40"
                              : "text-[#9EA3AE] hover:bg-white/[0.04] hover:text-[#F0F0F0]"
                          }`}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

      </main>
 
      {/* 3. Floating Input Bar (Center-Bottom Sesuai Permintaan User) */}
      <div className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
        <form
          onSubmit={handleInputSubmit}
          className="bg-[#1C1D1F] border border-white/[0.12] rounded-[8px] shadow-2xl p-2 flex flex-col gap-1.5 backdrop-blur-md focus-within:border-[#3F76FF] transition-all"
        >
          <div className="flex items-center gap-2 px-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tulis tugas baru... ketik /30m untuk durasi atau @urgent untuk prioritas"
              className="flex-1 bg-transparent border-none text-12 text-[#F0F0F0] placeholder:text-[#525866] focus:outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-6 h-6 rounded-[4px] bg-[#3F76FF] text-white flex items-center justify-center hover:bg-[#3364DB] disabled:opacity-30 disabled:hover:bg-[#3F76FF] transition cursor-pointer flex-shrink-0"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] px-1 text-10 text-[#6B7280] font-sans">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-[10px] bg-white/[0.06] px-1.5 py-0.2 rounded text-[#9EA3AE]">
                Enter
              </span>
              <span>masuk Brain Dump</span>
            </div>
            <div className="flex items-center gap-2 font-sans text-[10px]">
              <span className="text-[#9EA3AE]">/25m /45m</span>
              <span className="text-red-400">@urgent</span>
              <span className="text-amber-400">@high</span>
            </div>
          </div>
        </form>
      </div>

      {/* 4. Hard Stop Evaluation Modal (Saat Timer Habis) */}
      {hardStopDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1D1F] border border-white/[0.12] w-full max-w-md rounded-[8px] p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-14 text-[#F0F0F0] font-sans">Timebox Hard Stop!</h3>
            </div>
            <p className="text-12 text-[#9EA3AE] mb-4 font-sans leading-relaxed">
              Waktu alokasi untuk <strong className="text-[#F0F0F0]">"{hardStopDialog.title}"</strong> sudah habis. 
              Sesuai aturan timebox: stop pekerjaan sekarang dan tentukan statusnya.
            </p>

            <div className="flex items-center justify-end gap-2 text-11 font-sans">
              <button
                onClick={() => {
                  demoteToBrainDump(hardStopDialog);
                  setHardStopDialog(null);
                  setActiveTask(null);
                }}
                className="px-3 py-1.5 rounded-[4px] bg-white/[0.06] hover:bg-white/[0.1] text-[#F0F0F0] transition cursor-pointer"
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
                className="px-3 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer"
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
