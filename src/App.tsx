import { useState, useEffect, useMemo } from "react";
import "./App.css";

import {
  ActiveNavView,
  IssueLayoutMode,
  IssueState,
  Priority,
  TaskItem,
  TimeboxSlot,
} from "@/types/task";
import { INITIAL_ISSUES } from "@/data/initialIssues";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTimeboxTimer } from "@/hooks/useTimeboxTimer";

import { PlaneSidebar } from "@/components/layout/PlaneSidebar";
import { PlaneHeader } from "@/components/layout/PlaneHeader";
import { IssueKanbanView } from "@/components/issues/IssueKanbanView";
import { IssueListView } from "@/components/issues/IssueListView";
import { IssueDetailDrawer } from "@/components/issues/IssueDetailDrawer";
import { TimeboxBoardView } from "@/components/timebox/TimeboxBoardView";
import { FloatingCornerTimer } from "@/components/timebox/FloatingCornerTimer";
import { NewIssueModal } from "@/components/dialogs/NewIssueModal";
import { HardStopDialog } from "@/components/dialogs/HardStopDialog";

export default function App() {
  const [issues, setIssues] = useLocalStorage<TaskItem[]>("timebox-ray:issues:v1", INITIAL_ISSUES);
  const [activeNav, setActiveNav] = useLocalStorage<ActiveNavView>("timebox-ray:nav:v1", "timebox");
  const [issueLayout, setIssueLayout] = useLocalStorage<IssueLayoutMode>("timebox-ray:layout:v1", "kanban");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [hardStopDialog, setHardStopDialog] = useState<TaskItem | null>(null);

  const {
    activeTask,
    setActiveTask,
    totalSeconds,
    secondsRemaining,
    isRunning,
    isPopupVisible,
    setIsPopupVisible,
    startFocusBox,
    loadTaskIntoPopup,
    toggleTimer,
    resetTimer,
    adjustMinutes,
  } = useTimeboxTimer({
    onTimeUp: (task) => setHardStopDialog(task),
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.code === "Escape") {
        setSelectedIssueId(null);
        setIsNewIssueOpen(false);
      } else if (e.code === "Space" && activeTask) {
        e.preventDefault();
        toggleTimer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTask, toggleTimer]);

  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) return issues;
    const q = searchQuery.toLowerCase();
    return issues.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.identifier.toLowerCase().includes(q) ||
        i.labels.some((l) => l.toLowerCase().includes(q))
    );
  }, [issues, searchQuery]);

  const selectedIssue = useMemo(
    () => issues.find((i) => i.id === selectedIssueId) || null,
    [issues, selectedIssueId]
  );

  // Actions
  const createIssue = (payload: {
    title: string;
    description: string;
    state: IssueState;
    priority: Priority;
    durationMinutes: number;
    inTimebox: boolean;
  }) => {
    const nextNum = issues.length + 1;
    const newIssue: TaskItem = {
      id: "issue-" + Date.now(),
      identifier: `TIME-${nextNum}`,
      title: payload.title,
      description: payload.description,
      state: payload.state,
      priority: payload.priority,
      labels: [],
      durationMinutes: payload.durationMinutes,
      inTimebox: payload.inTimebox,
      timeboxSlot: "braindump",
      completed: payload.state === "done",
      subIssues: [],
    };
    setIssues((prev) => [newIssue, ...prev]);
  };

  const quickCreateInState = (state: IssueState, title: string) => {
    createIssue({
      title,
      description: "",
      state,
      priority: "medium",
      durationMinutes: 25,
      inTimebox: false,
    });
  };

  const updateIssue = (issueId: string, patch: Partial<TaskItem>) => {
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, ...patch } : i)));
  };

  const deleteIssue = (issueId: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
    if (selectedIssueId === issueId) setSelectedIssueId(null);
    if (activeTask?.id === issueId) {
      setActiveTask(null);
      setIsPopupVisible(false);
    }
  };

  const moveIssueState = (issueId: string, newState: IssueState) => {
    updateIssue(issueId, { state: newState, completed: newState === "done" });
  };

  const toggleInTimebox = (issueId: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              inTimebox: !i.inTimebox,
              timeboxSlot: !i.inTimebox ? "braindump" : i.timeboxSlot,
            }
          : i
      )
    );
  };

  const moveTimeboxSlot = (issueId: string, targetSlot: TimeboxSlot) => {
    if (targetSlot === "top3") {
      const top3Count = issues.filter((i) => i.inTimebox && i.timeboxSlot === "top3" && i.id !== issueId).length;
      if (top3Count >= 3) {
        alert("Top 3 Gate penuh! Selesaikan atau geser 1 kartu dulu.");
        return;
      }
    }

    const targetIssue = issues.find((i) => i.id === issueId);
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              timeboxSlot: targetSlot,
              state: targetSlot === "done" ? "done" : targetSlot === "now" ? "in_progress" : i.state,
              completed: targetSlot === "done",
            }
          : i
      )
    );

    // Otomatis munculkan popup timer di pojok saat task masuk ke Timebox Now
    if (targetSlot === "now" && targetIssue) {
      loadTaskIntoPopup({ ...targetIssue, timeboxSlot: "now", state: "in_progress" });
    }
  };

  const handleStartFocus = (issue: TaskItem) => {
    updateIssue(issue.id, {
      inTimebox: true,
      timeboxSlot: "now",
      state: "in_progress",
      completed: false,
    });
    startFocusBox(issue, true);
  };

  const timeboxCount = issues.filter((i) => i.inTimebox && i.timeboxSlot !== "done").length;

  return (
    <div className="flex h-screen w-screen bg-[#131415] text-[#F0F0F0] text-[13px] antialiased select-none overflow-hidden font-sans">
      {/* Left Sidebar ala Plane */}
      <PlaneSidebar
        activeNav={activeNav}
        isCollapsed={isSidebarCollapsed}
        issuesCount={issues.length}
        timeboxCount={timeboxCount}
        onSelectNav={setActiveNav}
        onToggleCollapse={() => setIsSidebarCollapsed(true)}
        onOpenNewIssue={() => setIsNewIssueOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <PlaneHeader
          activeNav={activeNav}
          issueLayout={issueLayout}
          isSidebarCollapsed={isSidebarCollapsed}
          searchQuery={searchQuery}
          activeTimerTask={activeTask}
          secondsRemaining={secondsRemaining}
          isRunning={isRunning}
          isPopupVisible={isPopupVisible}
          onExpandSidebar={() => setIsSidebarCollapsed(false)}
          onChangeIssueLayout={setIssueLayout}
          onSearchChange={setSearchQuery}
          onOpenNewIssue={() => setIsNewIssueOpen(true)}
          onShowPopup={() => setIsPopupVisible(true)}
        />

        <main className="flex-1 flex min-h-0 overflow-hidden">
          {activeNav === "issues" ? (
            issueLayout === "kanban" ? (
              <IssueKanbanView
                issues={filteredIssues}
                onSelectIssue={setSelectedIssueId}
                onMoveIssueState={moveIssueState}
                onSendToTimebox={toggleInTimebox}
                onQuickCreate={quickCreateInState}
              />
            ) : (
              <IssueListView
                issues={filteredIssues}
                onSelectIssue={setSelectedIssueId}
                onSendToTimebox={toggleInTimebox}
              />
            )
          ) : (
            <TimeboxBoardView
              issues={filteredIssues}
              activeTimerTaskId={activeTask?.id || null}
              isTimerRunning={isRunning}
              onMoveTimeboxSlot={moveTimeboxSlot}
              onSelectIssue={setSelectedIssueId}
              onRemoveFromTimebox={toggleInTimebox}
              onStartFocus={handleStartFocus}
            />
          )}
        </main>
      </div>

      {/* Right Issue Detail Drawer ala Plane */}
      {selectedIssue && (
        <IssueDetailDrawer
          issue={selectedIssue}
          onClose={() => setSelectedIssueId(null)}
          onUpdate={updateIssue}
          onDelete={deleteIssue}
          onSendToTimebox={toggleInTimebox}
          onStartFocusNow={(issue) => {
            handleStartFocus(issue);
            setSelectedIssueId(null);
          }}
        />
      )}

      {/* Draggable Corner Timer Popup */}
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

      {/* Create Work Item Modal */}
      {isNewIssueOpen && (
        <NewIssueModal
          onClose={() => setIsNewIssueOpen(false)}
          onCreate={createIssue}
        />
      )}

      {/* Timebox Hard Stop Dialog */}
      {hardStopDialog && (
        <HardStopDialog
          task={hardStopDialog}
          onReschedule={(task) => {
            updateIssue(task.id, { timeboxSlot: "top3" });
            setHardStopDialog(null);
            setActiveTask(null);
            setIsPopupVisible(false);
          }}
          onComplete={(task) => {
            updateIssue(task.id, { timeboxSlot: "done", state: "done", completed: true });
            setHardStopDialog(null);
            setActiveTask(null);
            setIsPopupVisible(false);
          }}
        />
      )}
    </div>
  );
}
