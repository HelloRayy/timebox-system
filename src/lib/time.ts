/**
 * Helper untuk menghitung jam selesai (format HH:mm) berdasarkan jam mulai dan durasi menit
 */
export const calculateEndTime = (start: string, durationMin: number): string => {
  const [h, m] = start.split(":").map(Number);
  const totalMin = h * 60 + m + durationMin;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
};

/**
 * Format detik countdown ke representasi waktu mm:ss
 */
export const formatTimer = (secs: number): string => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * Mendapatkan representasi jam lokal saat ini dalam format 12 jam (hour, minute, am/pm)
 */
export const getCurrentTime12 = () => {
  const now = new Date();
  const rawH = now.getHours();
  const rawM = Math.round(now.getMinutes() / 5) * 5 % 60;
  const period: "am" | "pm" = rawH >= 12 ? "pm" : "am";
  const hour12 = rawH % 12 === 0 ? 12 : rawH % 12;

  return {
    hour: hour12,
    minute: rawM,
    period,
  };
};

/**
 * Konversi jam 12h + menit + AM/PM ke format 24h string (HH:mm)
 */
export const formatTo24HourString = (hour: number, minute: number, period: "am" | "pm"): string => {
  const hour24 = period === "pm" 
    ? (hour === 12 ? 12 : hour + 12) 
    : (hour === 12 ? 0 : hour);
  return `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};
