import React from "react";
import { CircleDashed, Circle, CircleDot, CheckCircle2 } from "lucide-react";
import { IssueState } from "@/types/task";

export const ISSUE_STATES: { id: IssueState; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export const IssueStateIcon: React.FC<{ state: IssueState; className?: string }> = ({
  state,
  className = "w-3.5 h-3.5",
}) => {
  switch (state) {
    case "backlog":
      return <CircleDashed className={`${className} text-[#6B7280]`} />;
    case "todo":
      return <Circle className={`${className} text-[#9EA3AE]`} />;
    case "in_progress":
      return <CircleDot className={`${className} text-amber-400`} />;
    case "done":
      return <CheckCircle2 className={`${className} text-emerald-400`} />;
  }
};
