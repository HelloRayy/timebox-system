import { useState, useEffect, useCallback } from "react";
import { TaskItem } from "@/types/task";

export interface UseTimeboxTimerProps {
  onTimeUp?: (task: TaskItem) => void;
}

export const useTimeboxTimer = ({ onTimeUp }: UseTimeboxTimerProps = {}) => {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);

  const startFocusBox = useCallback((task: TaskItem, autoStart = true) => {
    const secs = (task.durationMinutes || 25) * 60;
    setActiveTask(task);
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(autoStart);
    setIsPopupVisible(true);
  }, []);

  const loadTaskIntoPopup = useCallback((task: TaskItem) => {
    const secs = (task.durationMinutes || 25) * 60;
    setActiveTask(task);
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(false);
    setIsPopupVisible(true);
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

  const adjustMinutes = useCallback((deltaMinutes: number) => {
    setTotalSeconds((prev) => Math.max(5 * 60, prev + deltaMinutes * 60));
    setSecondsRemaining((prev) => Math.max(60, prev + deltaMinutes * 60));
  }, []);

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
  };
};
