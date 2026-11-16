import { useState, useEffect } from "react";
import { TaskItem } from "@/types/task";

export interface UseTimeboxTimerProps {
  initialTask?: TaskItem | null;
  onTimeUp?: (task: TaskItem) => void;
}

export const useTimeboxTimer = ({ initialTask = null, onTimeUp }: UseTimeboxTimerProps = {}) => {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(initialTask);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    initialTask ? initialTask.durationMinutes * 60 : 30 * 60
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const startFocusBox = (task: TaskItem) => {
    setActiveTask(task);
    setSecondsRemaining(task.durationMinutes * 60);
    setIsRunning(true);
  };

  const toggleTimer = (fallbackTask?: TaskItem | null) => {
    if (!activeTask) {
      if (fallbackTask) {
        startFocusBox(fallbackTask);
      }
      return;
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (activeTask) {
      setSecondsRemaining(activeTask.durationMinutes * 60);
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      if (activeTask && onTimeUp) {
        onTimeUp(activeTask);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, activeTask, onTimeUp]);

  return {
    activeTask,
    setActiveTask,
    secondsRemaining,
    setSecondsRemaining,
    isRunning,
    setIsRunning,
    startFocusBox,
    toggleTimer,
    resetTimer,
  };
};
