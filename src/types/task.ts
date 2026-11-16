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

export type DragSource = "braindump" | "top3" | null;
