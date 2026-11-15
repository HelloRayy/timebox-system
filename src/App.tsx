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
  CalendarCheck2
} from "lucide-react";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type Priority = "urgent" | "high" | "medium" | "low" | "none";

export interface TaskItem {
  id: string;
  title: string;
  durationMinutes: number;
  priority: Priority;
  completed: boolean;
  scheduledTime?: string;
  scheduledEndTime?: string;
}

const calculateEndTime = (start: string, durationMin: number) => {
  const [h, m] = start.split(":").map(Number);
  const totalMin = h * 60 + m + durationMin;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
};

export default function App() {
  const [brainDump, setBrainDump] = useState<TaskItem[]>([
    { id: "bd-1", title: "Review PR backend optimization", durationMinutes: 30, priority: "high", completed: false },
    { id: "bd-2", title: "Kirim update milestone ke klien", durationMinutes: 20, priority: "medium", completed: false },
    { id: "bd-3", title: "Tulis test case auth module", durationMinutes: 45, priority: "low", completed: false },
  ]);

  const [top3, setTop3] = useState<TaskItem[]>([
    { id: "t3-1", title: "Fix memory leak di Tauri WebKit backend", durationMinutes: 60, priority: "urgent", completed: false, scheduledTime: "09:00", scheduledEndTime: "10:00" },
    { id: "t3-2", title: "Design Floating Bar Timebox Desk", durationMinutes: 30, priority: "high", completed: false },
  ]);

  const [selectedTop3Id, setSelectedTop3Id] = useState<string | null>("t3-2");
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"am" | "pm">("am");
  const [customDuration, setCustomDuration] = useState<number>(30);

  // Micro-behavior Drag States
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<"braindump" | "top3" | null>(null);
  const [isDragOverTop3, setIsDragOverTop3] = useState<boolean>(false);
  const [isDragOverBrainDump, setIsDragOverBrainDump] = useState<boolean>(false);

  const [inputValue, setInputValue] = useState("");
  const inputDuration = 30;
  const inputPriority: Priority = "medium";

  const [activeTask, setActiveTask] = useState<TaskItem | null>(top3[0] || null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hardStopDialog, setHardStopDialog] = useState<TaskItem | null>(null);

  useEffect(() => {
    const task = top3.find((t) => t.id === selectedTop3Id);
    if (task) {
      if (task.scheduledTime) {
        const [h, m] = task.scheduledTime.split(":").map(Number);
        const isPm = h >= 12;
        const displayH = h % 12 === 0 ? 12 : h % 12;
        setSelectedHour(displayH);
        setSelectedMinute(m);
        setSelectedPeriod(isPm ? "pm" : "am");
      }
      setCustomDuration(task.durationMinutes);
    }
  }, [selectedTop3Id, top3]);

  // Global Keyboard Shortcuts (Space = Play/Pause, Esc = Deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan shortcut jika sedang mengetik di input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === "Escape") {
        setSelectedTop3Id(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = window.setInterval(() => setSecondsRemaining((prev) => prev - 1), 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      if (activeTask) setHardStopDialog(activeTask);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, activeTask]);

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
    if (selectedTop3Id === task.id) setSelectedTop3Id(null);
  };

  // Two-way Drag and Drop handlers
  const handleDragStart = (task: TaskItem, source: "braindump" | "top3") => {
    setDraggedTaskId(task.id);
    setDragSource(source);
  };

  const handleDropOnTop3 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTop3(false);
    if (!draggedTaskId) return;

    if (dragSource === "braindump") {
      const task = brainDump.find((t) => t.id === draggedTaskId);
      if (task) promoteToTop3(task);
    }
    setDraggedTaskId(null);
    setDragSource(null);
  };

  const handleDropOnBrainDump = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBrainDump(false);
    if (!draggedTaskId) return;

    if (dragSource === "top3") {
      const task = top3.find((t) => t.id === draggedTaskId);
      if (task) demoteToBrainDump(task);
    }
    setDraggedTaskId(null);
    setDragSource(null);
  };

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
    if (activeTask) setSecondsRemaining(activeTask.durationMinutes * 60);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const renderPriorityBadge = (p: Priority) => {
    switch (p) {
      case "urgent":
        return (
          <Badge variant="urgent">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge variant="high">
            <span className="w-1 h-1 rounded-full bg-orange-400" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="medium">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            Med
          </Badge>
        );
      case "low":
        return (
          <Badge variant="low">
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  const selectedTask = top3.find((t) => t.id === selectedTop3Id);
  
  // Format 24h start time string dari 12h wheel picker
  const hour24 = selectedPeriod === "pm" 
    ? (selectedHour === 12 ? 12 : selectedHour + 12) 
    : (selectedHour === 12 ? 0 : selectedHour);
  const formattedStartTime = `${hour24.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
  const calculatedEndTime = calculateEndTime(formattedStartTime, customDuration);

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
          <span className="text-[#9EA3AE]">Timebox</span>
        </div>

        {/* Stopwatch Active Timer: SATU-SATUNYA TEMPAT FONT MONO DIIZINKAN */}
        <div className="flex items-center gap-2.5">
          {activeTask && (
            <div className="flex items-center gap-2 bg-[#1C1D1F] border border-white/[0.08] px-2.5 py-1 rounded-[4px] text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-[#6B7280]"}`} />
              <span className="font-mono font-medium text-[#F0F0F0] text-[12px]">{formatTimer(secondsRemaining)}</span>
              <span className="text-[#9EA3AE] truncate max-w-[140px] font-sans text-[12px]">{activeTask.title}</span>
              <button
                onClick={toggleTimer}
                title={isRunning ? "Pause (Space)" : "Play (Space)"}
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
      <main className="flex-1 flex pt-10 pb-0 w-full h-full overflow-hidden">
        
        {/* KOLOM 1: Brain Dump */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            if (dragSource === "top3") setIsDragOverBrainDump(true);
          }}
          onDragLeave={() => setIsDragOverBrainDump(false)}
          onDrop={handleDropOnBrainDump}
          className={`w-76 border-r border-white/[0.08] bg-[#161719] flex flex-col h-full flex-shrink-0 transition-all ${
            isDragOverBrainDump ? "bg-[#201c1f]/40 border-r-[#F87171]/50" : ""
          }`}
        >
          <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9EA3AE]" />
              <span className="font-medium text-[#F0F0F0] text-12 font-sans">Brain Dump</span>
              <span className="text-[10px] font-sans text-[#9EA3AE] bg-[#1C1D1F] px-1.5 py-0.2 rounded border border-white/[0.08]">
                {brainDump.length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 pb-32 space-y-1.5 custom-scrollbar">
            {brainDump.length === 0 ? (
              <div className="p-6 text-center text-12 text-[#6B7280] font-sans">
                Kosong
              </div>
            ) : (
              brainDump.map((task) => {
                const isDraggingThis = draggedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, "braindump")}
                    className={`group p-2.5 rounded-[6px] border border-white/[0.08] bg-[#1C1D1F] hover:bg-[#252629] hover:border-white/[0.14] transition-all cursor-grab active:cursor-grabbing flex flex-col gap-1.5 ${
                      isDraggingThis ? "opacity-30 scale-95" : ""
                    }`}
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
                        title="Pindahkan ke Top 3"
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-medium font-sans text-[#3F76FF] hover:text-[#5B8CFF] bg-[#3F76FF]/10 px-1.5 py-0.5 rounded-[3px] transition cursor-pointer flex-shrink-0"
                      >
                        Top 3 <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pl-5 text-11 text-[#9EA3AE] font-sans">
                      <span className="flex items-center gap-1 font-sans text-[11px]">
                        <Clock className="w-3 h-3 text-[#6B7280]" />
                        {task.durationMinutes}m
                      </span>
                      {renderPriorityBadge(task.priority)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* KOLOM 2: Top 3 Priorities Gate */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            if (dragSource === "braindump") setIsDragOverTop3(true);
          }}
          onDragLeave={() => setIsDragOverTop3(false)}
          onDrop={handleDropOnTop3}
          className={`w-80 border-r border-white/[0.08] bg-[#18191B] flex flex-col h-full flex-shrink-0 transition-all ${
            isDragOverTop3 ? "bg-[#1E2333]/40 border-l border-l-[#3F76FF]" : ""
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
                  onDragStart={() => task && handleDragStart(task, "top3")}
                  onClick={() => {
                    if (task) setSelectedTop3Id(task.id);
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
                              demoteToBrainDump(task);
                            }}
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
                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-[3px] flex items-center gap-1 text-[10px] font-sans">
                              <CalendarCheck2 className="w-3 h-3" />
                              {task.scheduledTime} - {task.scheduledEndTime || calculateEndTime(task.scheduledTime, task.durationMinutes)}
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
                    <div className="text-center text-11 text-[#6B7280] font-sans py-4">
                      Slot #{index + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* KOLOM 3: Time Range Picker */}
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
                onClick={() => unassignSchedule(selectedTask.id)}
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
              </div>
            ) : (
              <Card className="max-w-[340px] mx-auto p-5 shadow-xl flex flex-col items-center border-white/[0.08] bg-[#1C1D1F] rounded-[14px]">
                
                {/* Judul Bersih Khas Gambar 2 */}
                <div className="text-14 font-medium text-[#F0F0F0] font-sans mb-4">
                  Time
                </div>

                {/* Vertical Time Drum / Wheel Simulator */}
                <div className="relative w-full flex flex-col items-center justify-center py-2 select-none">
                  {/* Faded Row Atas (Preview -1) */}
                  <div className="flex items-center justify-center gap-6 text-[#525866] text-12 font-sans py-1 opacity-40">
                    <span className="w-8 text-center">{selectedHour === 1 ? 12 : selectedHour - 1}</span>
                    <span className="text-[#525866]">:</span>
                    <span className="w-8 text-center">{selectedMinute === 0 ? "45" : (selectedMinute - 15).toString().padStart(2, "0")}</span>
                    <span className="w-8 text-center">{selectedPeriod === "am" ? "pm" : "am"}</span>
                  </div>

                  {/* Active Selected Row (Tengah dengan Highlight Capsule Lembut) */}
                  <div className="flex items-center justify-center gap-4 bg-white/[0.06] border border-white/[0.08] rounded-[10px] py-2 px-6 my-1 w-full shadow-inner">
                    {/* Hour Select Button/Scroll */}
                    <button
                      onClick={() => setSelectedHour((prev) => (prev % 12) + 1)}
                      className="w-10 text-center text-20 font-semibold text-[#F0F0F0] font-sans hover:text-[#3F76FF] transition cursor-pointer"
                    >
                      {selectedHour}
                    </button>

                    <span className="text-18 font-bold text-[#9EA3AE]">:</span>

                    {/* Minute Select Button/Scroll */}
                    <button
                      onClick={() => setSelectedMinute((prev) => (prev + 15) % 60)}
                      className="w-10 text-center text-20 font-semibold text-[#F0F0F0] font-sans hover:text-[#3F76FF] transition cursor-pointer"
                    >
                      {selectedMinute.toString().padStart(2, "0")}
                    </button>

                    {/* AM / PM Toggle */}
                    <button
                      onClick={() => setSelectedPeriod((prev) => (prev === "am" ? "pm" : "am"))}
                      className="w-10 text-center text-16 font-medium text-[#9EA3AE] hover:text-[#3F76FF] uppercase transition cursor-pointer"
                    >
                      {selectedPeriod}
                    </button>
                  </div>

                  {/* Faded Row Bawah (Preview +1) */}
                  <div className="flex items-center justify-center gap-6 text-[#525866] text-12 font-sans py-1 opacity-40">
                    <span className="w-8 text-center">{selectedHour === 12 ? 1 : selectedHour + 1}</span>
                    <span className="text-[#525866]">:</span>
                    <span className="w-8 text-center">{(selectedMinute + 15) % 60 === 0 ? "00" : ((selectedMinute + 15) % 60).toString().padStart(2, "0")}</span>
                    <span className="w-8 text-center">{selectedPeriod}</span>
                  </div>
                </div>

                {/* Presets Jam Cepat (9 am, 12 pm, 4 pm, 6 pm - Sesuai Gambar 2) */}
                <div className="w-full mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="text-[11px] text-[#6B7280] font-sans mb-1.5 text-left">Presets Jam:</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { h: 9, m: 0, p: "am", label: "9 am" },
                      { h: 12, m: 0, p: "pm", label: "12 pm" },
                      { h: 4, m: 0, p: "pm", label: "4 pm" },
                      { h: 6, m: 0, p: "pm", label: "6 pm" },
                    ].map((item) => {
                      const isActivePreset =
                        selectedHour === item.h &&
                        selectedMinute === item.m &&
                        selectedPeriod === item.p;

                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            setSelectedHour(item.h);
                            setSelectedMinute(item.m);
                            setSelectedPeriod(item.p as "am" | "pm");
                          }}
                          className={`h-8 rounded-[6px] border text-11 font-sans transition cursor-pointer flex items-center justify-center ${
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

                {/* Pilihan Durasi Pengerjaan (+ Waktu Akhir Terhitung) */}
                <div className="w-full mt-2.5 pt-2.5 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between text-[11px] font-sans mb-1.5">
                    <span className="text-[#6B7280]">Durasi Pengerjaan:</span>
                    <span className="text-emerald-400 font-medium">Selesai jam {calculatedEndTime}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[15, 25, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setCustomDuration(mins)}
                        className={`h-7 rounded-[4px] border text-11 font-sans transition cursor-pointer flex items-center justify-center ${
                          customDuration === mins
                            ? "bg-[#3F76FF] text-white font-medium border-[#3F76FF]"
                            : "bg-[#161719] border-white/[0.06] text-[#9EA3AE] hover:text-[#F0F0F0]"
                        }`}
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tombol Done Biru Lebar Sesuai Gambar 2 */}
                <div className="w-full mt-4">
                  <Button
                    onClick={() => applyTimeRange(formattedStartTime, customDuration)}
                    className="w-full h-10 rounded-[8px] bg-[#3F76FF] hover:bg-[#3364DB] active:scale-[0.98] text-white font-medium text-13 shadow-md transition"
                  >
                    Done ({formattedStartTime} - {calculatedEndTime})
                  </Button>
                </div>

              </Card>
            )}
          </div>
        </section>

      </main>
 
      {/* 3. Floating Prompt Box (Berdiri Sendiri, Tinggi, & Elegan Tanpa Container Strip Gelap) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none">
        <form
          onSubmit={handleInputSubmit}
          className="pointer-events-auto bg-[#1C1D1F]/90 backdrop-blur-xl border border-white/[0.14] rounded-[12px] shadow-2xl p-3 flex flex-col justify-between min-h-[105px] focus-within:border-[#3F76FF] focus-within:ring-1 focus-within:ring-[#3F76FF]/30 transition-all"
        >
          {/* Textarea Multi-line atau Text Input yang Lega */}
          <textarea
            value={inputValue}
            rows={2}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleInputSubmit(e);
              }
            }}
            placeholder="Tulis tugas baru untuk Brain Dump... ketik /30m untuk durasi atau @urgent"
            className="w-full bg-transparent border-none text-13 text-[#F0F0F0] placeholder:text-[#6B7280] focus:outline-none resize-none font-sans leading-relaxed"
          />

          {/* Bottom Toolbar Box (Mirip Gambar 2) */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-sans text-[#9EA3AE] bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1 rounded-[4px] border border-white/[0.06] transition cursor-pointer">
                <Clock className="w-3 h-3 text-[#6B7280]" />
                30m default
              </span>
              <span className="text-[10px] text-[#6B7280] font-sans">
                Enter kirim
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-7 h-7 rounded-full bg-[#3F76FF] hover:bg-[#3364DB] active:scale-95 disabled:opacity-20 disabled:hover:bg-[#3F76FF] text-white flex items-center justify-center transition cursor-pointer shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 4. Hard Stop Evaluation Modal */}
      {hardStopDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1D1F] border border-white/[0.12] w-full max-w-md rounded-[6px] p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              <h3 className="font-semibold text-13 text-[#F0F0F0] font-sans">Timebox Selesai</h3>
            </div>
            <p className="text-12 text-[#9EA3AE] mb-4 font-sans leading-relaxed">
              Waktu alokasi untuk <strong className="text-[#F0F0F0]">"{hardStopDialog.title}"</strong> habis.
            </p>

            <div className="flex items-center justify-end gap-2 text-11 font-sans">
              <button
                onClick={() => {
                  demoteToBrainDump(hardStopDialog);
                  setHardStopDialog(null);
                  setActiveTask(null);
                }}
                className="px-3 py-1.5 rounded-[4px] bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-[#F0F0F0] transition cursor-pointer"
              >
                Jadwalkan Ulang
              </button>
              <button
                onClick={() => {
                  setTop3((prev) =>
                    prev.map((t) => (t.id === hardStopDialog.id ? { ...t, completed: true } : t))
                  );
                  setHardStopDialog(null);
                  setActiveTask(null);
                }}
                className="px-3 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium transition cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
