import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FloatingCornerTimer, type TimeboxTask } from "./floating-corner-timer";

interface TimeboxContextValue {
  tasks: TimeboxTask[];
  activeTask: TimeboxTask | null;
  totalSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  isPopupVisible: boolean;
  addTask: (title: string, durationMinutes?: number, identifier?: string) => void;
  moveTaskSlot: (id: string, slot: TimeboxTask["slot"]) => void;
  removeTask: (id: string) => void;
  startFocus: (task: TimeboxTask, autoStart?: boolean) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  adjustMinutes: (delta: number) => void;
  setIsPopupVisible: (v: boolean) => void;
}

const STORAGE_KEY = "plane_timebox_tasks_v1";

const DEFAULT_TIMEBOX_TASKS: TimeboxTask[] = [
  {
    id: "tb-1",
    identifier: "TIME-1",
    title: "Fix memory leak di Tauri WebKit backend",
    durationMinutes: 45,
    priority: "urgent",
    slot: "top3",
  },
  {
    id: "tb-2",
    identifier: "TIME-2",
    title: "Integrasi Timebox Board & Corner Timer Popup",
    durationMinutes: 25,
    priority: "high",
    slot: "now",
  },
  {
    id: "tb-3",
    identifier: "TIME-3",
    title: "Review PR backend optimization",
    durationMinutes: 30,
    priority: "medium",
    slot: "braindump",
  },
];

const TimeboxContext = createContext<TimeboxContextValue | null>(null);

export const TimeboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TimeboxTask[]>(() => {
    if (typeof window === "undefined") return DEFAULT_TIMEBOX_TASKS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_TIMEBOX_TASKS;
    } catch {
      return DEFAULT_TIMEBOX_TASKS;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const [activeTask, setActiveTask] = useState<TimeboxTask | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const startFocus = useCallback((task: TimeboxTask, autoStart = true) => {
    const secs = (task.durationMinutes || 25) * 60;
    setActiveTask(task);
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(autoStart);
    setIsPopupVisible(true);
  }, []);

  const addTask = useCallback((title: string, durationMinutes = 25, identifier?: string) => {
    setTasks((prev) => [
      {
        id: `tb-${Date.now()}`,
        identifier: identifier || `TIME-${prev.length + 1}`,
        title,
        durationMinutes,
        priority: "medium",
        slot: "braindump",
      },
      ...prev,
    ]);
  }, []);

  const moveTaskSlot = useCallback(
    (id: string, slot: TimeboxTask["slot"]) => {
      setTasks((prev) => {
        if (slot === "top3") {
          const top3Count = prev.filter((t) => t.slot === "top3" && t.id !== id).length;
          if (top3Count >= 3) {
            alert("Top 3 Gate penuh! Selesaikan atau geser 1 task dulu.");
            return prev;
          }
        }
        const target = prev.find((t) => t.id === id);
        if (slot === "now" && target) {
          startFocus({ ...target, slot: "now" }, false);
        }
        return prev.map((t) => (t.id === id ? { ...t, slot } : t));
      });
    },
    [startFocus]
  );

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTimer = useCallback(() => {
    if (!activeTask) return;
    setIsRunning((prev) => !prev);
  }, [activeTask]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    const secs = (activeTask?.durationMinutes || 25) * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  }, [activeTask]);

  const adjustMinutes = useCallback((delta: number) => {
    setTotalSeconds((prev) => Math.max(5 * 60, prev + delta * 60));
    setSecondsRemaining((prev) => Math.max(60, prev + delta * 60));
  }, []);

  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) return;
    const id = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, secondsRemaining]);

  return (
    <TimeboxContext.Provider
      value={{
        tasks,
        activeTask,
        totalSeconds,
        secondsRemaining,
        isRunning,
        isPopupVisible,
        addTask,
        moveTaskSlot,
        removeTask,
        startFocus,
        toggleTimer,
        resetTimer,
        adjustMinutes,
        setIsPopupVisible,
      }}
    >
      {children}
      {activeTask && isPopupVisible && (
        <FloatingCornerTimer
          task={activeTask}
          totalSeconds={totalSeconds}
          secondsRemaining={secondsRemaining}
          isRunning={isRunning}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onAdjustMinutes={adjustMinutes}
          onMinimize={() => setIsPopupVisible(false)}
          onClose={() => {
            setIsPopupVisible(false);
            setActiveTask(null);
          }}
        />
      )}
    </TimeboxContext.Provider>
  );
};

export const useTimebox = () => {
  const ctx = useContext(TimeboxContext);
  if (!ctx) throw new Error("useTimebox must be used inside TimeboxProvider");
  return ctx;
};
