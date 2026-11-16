import React, { useState, useEffect } from "react";
import "./App.css";

// Modular Types & Utilities
import { TaskItem, Priority, DragSource } from "@/types/task";
import { getCurrentTime12, calculateEndTime } from "@/lib/time";
import { useTimeboxTimer } from "@/hooks/useTimeboxTimer";

// Modular Components
import { Header } from "@/components/layout/Header";
import { FloatingPromptBar } from "@/components/layout/FloatingPromptBar";
import { BrainDumpColumn } from "@/components/board/BrainDumpColumn";
import { Top3Column } from "@/components/board/Top3Column";
import { TimeRangeColumn } from "@/components/board/TimeRangeColumn";
import { HardStopDialog } from "@/components/dialogs/HardStopDialog";

export default function App() {
  // 1. Data State (Brain Dump & Top 3)
  const [brainDump, setBrainDump] = useState<TaskItem[]>([
    { id: "bd-1", title: "Review PR backend optimization", durationMinutes: 30, priority: "high", completed: false },
    { id: "bd-2", title: "Kirim update milestone ke klien", durationMinutes: 20, priority: "medium", completed: false },
    { id: "bd-3", title: "Tulis test case auth module", durationMinutes: 45, priority: "low", completed: false },
  ]);

  const [top3, setTop3] = useState<TaskItem[]>([
    {
      id: "t3-1",
      title: "Fix memory leak di Tauri WebKit backend",
      durationMinutes: 60,
      priority: "urgent",
      completed: false,
      scheduledTime: "09:00",
      scheduledEndTime: "10:00",
    },
    { id: "t3-2", title: "Design Floating Bar Timebox Desk", durationMinutes: 30, priority: "high", completed: false },
  ]);

  // 2. Selection & Time Picker State
  const initialTime = getCurrentTime12();
  const [selectedTop3Id, setSelectedTop3Id] = useState<string | null>("t3-2");
  const [selectedHour, setSelectedHour] = useState<number>(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(initialTime.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"am" | "pm">(initialTime.period);
  const [customDuration, setCustomDuration] = useState<number>(30);

  // 3. Drag and Drop Interaction State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<DragSource>(null);
  const [isDragOverTop3, setIsDragOverTop3] = useState<boolean>(false);
  const [isDragOverBrainDump, setIsDragOverBrainDump] = useState<boolean>(false);

  // 4. Prompt Input State
  const [inputValue, setInputValue] = useState("");
  const [hardStopDialog, setHardStopDialog] = useState<TaskItem | null>(null);

  // 5. Timer Hook
  const {
    activeTask,
    setActiveTask,
    secondsRemaining,
    isRunning,
    startFocusBox,
    toggleTimer,
    resetTimer,
  } = useTimeboxTimer({
    initialTask: top3[0] || null,
    onTimeUp: (task) => setHardStopDialog(task),
  });

  // Sync Timer Drum saat kartu Top 3 dipilih
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
      } else {
        const cur = getCurrentTime12();
        setSelectedHour(cur.hour);
        setSelectedMinute(cur.minute);
        setSelectedPeriod(cur.period);
      }
      setCustomDuration(task.durationMinutes);
    }
  }, [selectedTop3Id, top3]);

  // Global Keyboard Shortcuts (Space = Play/Pause, Esc = Deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer(top3[0] || null);
      } else if (e.code === "Escape") {
        setSelectedTop3Id(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Task Actions
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let text = inputValue.trim();
    let duration = 30;
    let priority: Priority = "medium";

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
      priority,
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
    setBrainDump((prev) => [
      { ...task, scheduledTime: undefined, scheduledEndTime: undefined },
      ...prev,
    ]);
    if (selectedTop3Id === task.id) setSelectedTop3Id(null);
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

  // Drag and Drop
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

  const selectedTask = top3.find((t) => t.id === selectedTop3Id);

  return (
    <div className="flex h-screen w-screen bg-[#131415] text-[#F0F0F0] text-[13px] antialiased select-none overflow-hidden relative font-sans">
      {/* 1. Header Bar */}
      <Header
        activeTask={activeTask}
        isRunning={isRunning}
        secondsRemaining={secondsRemaining}
        onToggleTimer={() => toggleTimer(top3[0] || null)}
        onResetTimer={resetTimer}
      />

      {/* 2. Main 3-Column Working Board */}
      <main className="flex-1 flex pt-10 pb-0 w-full h-full overflow-hidden">
        {/* Kolom 1: Brain Dump */}
        <BrainDumpColumn
          tasks={brainDump}
          dragSource={dragSource}
          draggedTaskId={draggedTaskId}
          isDragOver={isDragOverBrainDump}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragSource === "top3") setIsDragOverBrainDump(true);
          }}
          onDragLeave={() => setIsDragOverBrainDump(false)}
          onDrop={handleDropOnBrainDump}
          onDragStart={handleDragStart}
          onPromoteToTop3={promoteToTop3}
        />

        {/* Kolom 2: Top 3 Priorities */}
        <Top3Column
          top3={top3}
          selectedTop3Id={selectedTop3Id}
          activeTask={activeTask}
          isRunning={isRunning}
          draggedTaskId={draggedTaskId}
          dragSource={dragSource}
          isDragOver={isDragOverTop3}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragSource === "braindump") setIsDragOverTop3(true);
          }}
          onDragLeave={() => setIsDragOverTop3(false)}
          onDrop={handleDropOnTop3}
          onDragStart={handleDragStart}
          onSelectTask={(id) => setSelectedTop3Id(id)}
          onDemoteTask={demoteToBrainDump}
          onStartFocus={startFocusBox}
          onToggleComplete={(id) =>
            setTop3((prev) =>
              prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
            )
          }
        />

        {/* Kolom 3: Time Range & Live Focus */}
        <TimeRangeColumn
          selectedTask={selectedTask}
          activeTask={activeTask}
          isRunning={isRunning}
          secondsRemaining={secondsRemaining}
          selectedHour={selectedHour}
          selectedMinute={selectedMinute}
          selectedPeriod={selectedPeriod}
          customDuration={customDuration}
          onSetHour={setSelectedHour}
          onSetMinute={setSelectedMinute}
          onSetPeriod={setSelectedPeriod}
          onSetDuration={setCustomDuration}
          onApplyTimeRange={applyTimeRange}
          onUnassignSchedule={unassignSchedule}
          onToggleTimer={() => toggleTimer(top3[0] || null)}
          onResetTimer={resetTimer}
          onStartFocus={startFocusBox}
        />
      </main>

      {/* 3. Floating Prompt Bar */}
      <FloatingPromptBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleInputSubmit}
      />

      {/* 4. Hard Stop Dialog */}
      {hardStopDialog && (
        <HardStopDialog
          task={hardStopDialog}
          onReschedule={(task) => {
            demoteToBrainDump(task);
            setHardStopDialog(null);
            setActiveTask(null);
          }}
          onComplete={(task) => {
            setTop3((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
            );
            setHardStopDialog(null);
            setActiveTask(null);
          }}
        />
      )}
    </div>
  );
}
