import React, { useState } from "react";
import { X } from "lucide-react";
import { IssueState, Priority } from "@/types/task";

export interface NewIssueModalProps {
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    description: string;
    state: IssueState;
    priority: Priority;
    durationMinutes: number;
    inTimebox: boolean;
  }) => void;
}

export const NewIssueModal: React.FC<NewIssueModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<IssueState>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [inTimebox, setInTimebox] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim(),
      state,
      priority,
      durationMinutes,
      inTimebox,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-[#1C1D1F] border border-white/[0.1] rounded-[10px] shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#F0F0F0] font-sans">
            Create Work Item
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#F0F0F0] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-[15px] font-medium text-[#F0F0F0] placeholder:text-[#525866] focus:outline-none font-sans"
          />

          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            className="w-full bg-[#161719] border border-white/[0.08] rounded-[6px] p-2.5 text-[13px] text-[#F0F0F0] placeholder:text-[#525866] focus:outline-none resize-none font-sans"
          />

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px] font-sans">
            <select
              value={state}
              onChange={(e) => setState(e.target.value as IssueState)}
              className="h-7 px-2 rounded-[4px] bg-[#161719] border border-white/[0.08] text-[#F0F0F0] focus:outline-none cursor-pointer"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="h-7 px-2 rounded-[4px] bg-[#161719] border border-white/[0.08] text-[#F0F0F0] focus:outline-none cursor-pointer"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">No Priority</option>
            </select>

            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="h-7 px-2 rounded-[4px] bg-[#161719] border border-white/[0.08] text-[#F0F0F0] focus:outline-none cursor-pointer"
            >
              <option value={15}>15 min</option>
              <option value={25}>25 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>

            <label className="flex items-center gap-1.5 text-[12px] text-[#9EA3AE] cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={inTimebox}
                onChange={(e) => setInTimebox(e.target.checked)}
                className="accent-[#3F76FF]"
              />
              <span>Masukkan ke Timebox Board</span>
            </label>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#161719] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-7 px-3 rounded-[5px] text-[12px] text-[#9EA3AE] hover:text-[#F0F0F0] font-sans cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-7 px-3 rounded-[5px] bg-[#3F76FF] hover:bg-[#3364DB] text-white text-[12px] font-medium font-sans cursor-pointer"
          >
            Create Work Item
          </button>
        </div>
      </form>
    </div>
  );
};
