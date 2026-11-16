import React from "react";
import { Priority } from "@/types/task";
import { AlertCircle, SignalHigh, SignalMedium, SignalLow, Minus } from "lucide-react";

export interface PriorityBadgeProps {
  priority: Priority;
  compact?: boolean;
}

const PRIORITY_MAP: Record<
  Priority,
  { label: string; colorClass: string; bgClass: string; Icon: React.ElementType }
> = {
  urgent: {
    label: "Urgent",
    colorClass: "text-red-400",
    bgClass: "bg-red-500/10 border-red-500/20",
    Icon: AlertCircle,
  },
  high: {
    label: "High",
    colorClass: "text-orange-400",
    bgClass: "bg-orange-500/10 border-orange-500/20",
    Icon: SignalHigh,
  },
  medium: {
    label: "Medium",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    Icon: SignalMedium,
  },
  low: {
    label: "Low",
    colorClass: "text-indigo-400",
    bgClass: "bg-indigo-500/10 border-indigo-500/20",
    Icon: SignalLow,
  },
  none: {
    label: "None",
    colorClass: "text-[#6B7280]",
    bgClass: "bg-white/[0.04] border-white/[0.08]",
    Icon: Minus,
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, compact = false }) => {
  const cfg = PRIORITY_MAP[priority] || PRIORITY_MAP.none;
  const Icon = cfg.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[11px] font-medium font-sans ${cfg.bgClass} ${cfg.colorClass}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {!compact && <span>{cfg.label}</span>}
    </span>
  );
};
