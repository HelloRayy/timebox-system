import React from "react";
import { Clock } from "lucide-react";

export interface FloatingPromptBarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FloatingPromptBar: React.FC<FloatingPromptBarProps> = ({
  inputValue,
  onInputChange,
  onSubmit,
}) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none">
      <form
        onSubmit={onSubmit}
        className="pointer-events-auto bg-[#1C1D1F]/90 backdrop-blur-xl border border-white/[0.14] rounded-[12px] shadow-2xl p-3 flex flex-col justify-between min-h-[105px] focus-within:border-[#3F76FF] focus-within:ring-1 focus-within:ring-[#3F76FF]/30 transition-all"
      >
        <textarea
          value={inputValue}
          rows={2}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          placeholder="Tulis tugas baru untuk Brain Dump... ketik /30m untuk durasi atau @urgent"
          className="w-full bg-transparent border-none text-13 text-[#F0F0F0] placeholder:text-[#6B7280] focus:outline-none resize-none font-sans leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-sans text-[#9EA3AE] bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1 rounded-[4px] border border-white/[0.06] transition cursor-pointer">
              <Clock className="w-3 h-3 text-[#6B7280]" />
              30m default
            </span>
            <span className="text-[10px] text-[#6B7280] font-sans">
              Enter untuk simpan &bull; Shift+Enter baris baru
            </span>
          </div>

          <button
            type="submit"
            className="px-3 py-1 rounded-[6px] bg-[#3F76FF] hover:bg-[#3364DB] active:scale-95 text-white text-11 font-medium font-sans shadow transition cursor-pointer"
          >
            Tambah Tugas
          </button>
        </div>
      </form>
    </div>
  );
};
