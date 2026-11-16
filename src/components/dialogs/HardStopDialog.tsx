import React from "react";
import { AlertCircle } from "lucide-react";
import { TaskItem } from "@/types/task";

export interface HardStopDialogProps {
  task: TaskItem;
  onReschedule: (task: TaskItem) => void;
  onComplete: (task: TaskItem) => void;
}

export const HardStopDialog: React.FC<HardStopDialogProps> = ({
  task,
  onReschedule,
  onComplete,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1D1F] border border-white/[0.12] rounded-[10px] p-5 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <AlertCircle className="w-4 h-4" />
          <h3 className="font-semibold text-13 text-[#F0F0F0] font-sans">Timebox Selesai</h3>
        </div>
        <p className="text-12 text-[#9EA3AE] mb-4 font-sans leading-relaxed">
          Waktu alokasi untuk <strong className="text-[#F0F0F0]">"{task.title}"</strong> habis.
        </p>

        <div className="flex items-center justify-end gap-2 text-11 font-sans">
          <button
            onClick={() => onReschedule(task)}
            className="px-3 py-1.5 rounded-[4px] bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-[#F0F0F0] transition cursor-pointer"
          >
            Jadwalkan Ulang
          </button>
          <button
            onClick={() => onComplete(task)}
            className="px-3 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
