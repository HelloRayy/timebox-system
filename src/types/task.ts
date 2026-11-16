export type Priority = "urgent" | "high" | "medium" | "low" | "none";

export type IssueState = "backlog" | "todo" | "in_progress" | "done";

export type TimeboxSlot = "braindump" | "top3" | "now" | "done";

export type ActiveNavView = "issues" | "timebox";
export type IssueLayoutMode = "kanban" | "list";

export interface SubIssue {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  identifier: string;
  title: string;
  description: string;
  state: IssueState;
  priority: Priority;
  labels: string[];
  durationMinutes: number;
  inTimebox: boolean;
  timeboxSlot: TimeboxSlot;
  completed: boolean;
  scheduledTime?: string;
  scheduledEndTime?: string;
  subIssues: SubIssue[];
}
