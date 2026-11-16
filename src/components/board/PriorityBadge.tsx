import React from "react";
import { Badge } from "@/components/ui/badge";
import { Priority } from "@/types/task";

export interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
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
