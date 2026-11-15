import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Plus, CheckCircle2, Clock, Trash2 } from "lucide-react";
import "./App.css";

interface TimeboxItem {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
}

export default function App() {
  const [items, setItems] = useState<TimeboxItem[]>([
    { id: "1", title: "Setup Tauri & Tailwind Architecture", durationMinutes: 25, completed: true },
    { id: "2", title: "Core Timebox Timer & Event Loop", durationMinutes: 45, completed: false },
    { id: "3", title: "System Tray & Notifications Integration", durationMinutes: 30, completed: false },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("25");

  // Timer state
  const [activeItem, setActiveItem] = useState<TimeboxItem | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      if (activeItem) {
        toggleComplete(activeItem.id);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, activeItem]);

  const startBox = (item: TimeboxItem) => {
    setActiveItem(item);
    setSecondsRemaining(item.durationMinutes * 60);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    if (!activeItem && items.length > 0) {
      startBox(items[0]);
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (activeItem) {
      setSecondsRemaining(activeItem.durationMinutes * 60);
    } else {
      setSecondsRemaining(25 * 60);
    }
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: TimeboxItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      durationMinutes: parseInt(newDuration, 10) || 25,
      completed: false,
    };
    setItems((prev) => [...prev, item]);
    setNewTitle("");
  };

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (activeItem?.id === id) {
      setActiveItem(null);
      setIsRunning(false);
      setSecondsRemaining(25 * 60);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen w-screen bg-neutral-950 text-neutral-100 antialiased overflow-hidden">
      {/* Sidebar / Active Focus Zone */}
      <div className="w-80 border-r border-neutral-800 p-6 flex flex-col justify-between bg-neutral-900/40">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Timebox Desk
            </span>
          </div>

          <div className="my-8 text-center">
            <div className="text-5xl font-mono font-semibold tracking-tighter text-white">
              {formatTime(secondsRemaining)}
            </div>
            <div className="mt-2 text-xs font-medium text-neutral-400 truncate max-w-[240px] mx-auto">
              {activeItem ? activeItem.title : "Standby - Pilih box fokus"}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleTimer}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 transition active:scale-95 cursor-pointer shadow-md"
            >
              {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-neutral-800 hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-100 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 font-mono border-t border-neutral-850 pt-4">
          Engine: Tauri v2 (Rust) + React 19
        </div>
      </div>

      {/* Main Content: Timebox List */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">Today's Timeboxes</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Kunci fokus lo ke blok waktu tetap tanpa distraksi.</p>
            </div>
          </div>

          {/* New Item Form */}
          <form onSubmit={addItem} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Apa yang mau lo eksekusi sekarang?"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition"
            />
            <div className="relative">
              <input
                type="number"
                min="5"
                max="180"
                step="5"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-20 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 text-center font-mono focus:outline-none focus:border-neutral-600 transition"
              />
              <span className="absolute right-2 top-2.5 text-[10px] text-neutral-500 pointer-events-none">m</span>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 text-neutral-950 font-medium rounded-lg text-sm hover:bg-neutral-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Box
            </button>
          </form>

          {/* List Items */}
          <div className="space-y-2 flex-1">
            {items.map((item) => {
              const isItemActive = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                    isItemActive
                      ? "border-neutral-600 bg-neutral-900"
                      : "border-neutral-850 bg-neutral-900/30 hover:border-neutral-800"
                  } ${item.completed ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className="cursor-pointer text-neutral-400 hover:text-white transition"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          item.completed ? "text-emerald-500 fill-emerald-500/20" : "text-neutral-600"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm truncate ${
                        item.completed ? "line-through text-neutral-400" : "text-neutral-200 font-medium"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs font-mono text-neutral-400 bg-neutral-800/60 px-2 py-1 rounded">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {item.durationMinutes}m
                    </span>
                    {!item.completed && (
                      <button
                        onClick={() => startBox(item)}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                          isItemActive && isRunning
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                        }`}
                      >
                        {isItemActive && isRunning ? "Running" : "Start"}
                      </button>
                    )}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="cursor-pointer text-neutral-600 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
