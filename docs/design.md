# Design System Specification: Plane (Propel) to Timebox Ray

Dokumen ini adalah acuan desain resmi (*canonical design spec*) untuk seluruh AI agent dan engineer dalam merancang antarmuka **Timebox Ray**. Standar di sini diekstrak langsung dari arsitektur nyata repositori **Plane** (`makeplane/plane` & `@makeplane/propel`) dan disesuaikan agar **menghindari bug visual umum (Pure Black Hole, Border Tajam Menusuk, dan Overuse Font Mono)**.

Setiap komponen baru yang dibuat **WAJIB** mematuhi aturan di bawah ini.

---

## 1. Prinsip Visual & Larangan Keras (Anti-Patterns)

1. **DILARANG PURE BLACK (#000000 MATI)**
   - Plane tidak pernah menggunakan `#000000` pekat di layar utama.
   - Dark mode Plane menggunakan nuansa **Charcoal / Slate bertingkat**:
     - Dasar Canvas: `#131415` (atau `oklch(0.1689 0.0021 230.81)`)
     - Kartu & Kontainer (`bg-surface-1`): `#1C1D1F` (atau `oklch(0.1932 0.002 230.81)`)
     - Hover State (`bg-surface-2`): `#252629`
   - Kontras antar panel tercipta lewat **elevasi warna latar belakang**, BUKAN sekadar garis border tebal.

2. **DILARANG BORDER TAJAM / SOLID TERANG (SHARP BORDER KILLER)**
   - Garis border tidak boleh menggunakan warna abu-abu solid atau warna neon solid 4 sisi.
   - **Gunakan Border Alpha Lembut**:
     - Border standar panel/kartu: `border-white/[0.08]` atau `border-white/[0.06]`.
     - Divider grid jam: `border-white/[0.04]` (sangat halus, menyatu dengan latar).
   - **Active/Running State**:
     - JANGAN bungkus 4 sisi dengan border biru tebal.
     - CUKUP aksen garis strip di sisi kiri: `border-l-2 border-l-accent-primary` dengan background aksen sangat lembut `bg-accent-primary/[0.06]`.

3. **RESTRIKSI KETAT FONT MONOSPACE (NO OVERUSE MONO)**
   - **DILARANG** menggunakan font monospace untuk: judul task, body text, label prioritas, pill, badge, nama tombol, atau navigasi.
   - **HANYA GUNAKAN FONT MONO (`font-mono`) UNTUK**:
     1. Nilai angka countdown aktif (misal `24:59`).
     2. Label jam eksak pada sumbu timeline (misal `09:00`, `09:30`).
   - Seluruh teks lainnya **WAJIB** menggunakan font sans-serif proporsional (`Inter Variable` / `Inter`).

4. **TIDAK ADA EMOJI DEKORATIF DI HEADER / TITLE**
   - Dilarang menaruh emoji seperti 🔥, 📁, 🚀 di samping judul kolom.
   - Gunakan icon stroke 1.75–2.0 monokromatik tipis (Lucide Icons) dengan ukuran `14px` (`h-3.5 w-3.5`).

5. **TIDAK ADA FLOATING BAR NYASAR**
   - Form input "Tulis tugas baru" harus menyatu di dalam panel kolom (seperti inline input di bawah daftar `Brain Dump`), BUKAN floating capsule yang menutupi timeline grid.

---

## 2. Tipografi Resmi & Hierarki Font

### Font Stack
```css
/* Body, Header, Button, Label, Kartu (95% Aplikasi) */
font-family: "Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Khusus Angka Jam Timeline & Countdown Timer Sahaja */
font-family: "IBM Plex Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Skala Font (90% Scaled Density)
| Token Tailwind | Pixel | Line Height | Weight | Penggunaan Tepat |
|---|---|---|---|---|
| `text-10` | 10px | `1.0` | 400 | Label jam timeline (`font-mono`), micro shortcut badge |
| `text-11` | 11px | `1.1` | 500 (Medium) | **Button sm**, badge prioritas, dropdown item |
| `text-12` | 12px | `1.1` | 400 / 500 | Durasi tugas (misal `60m`), helper text |
| `text-13` | 13px | `1.4` | 500 (Medium) | **Judul task di kartu**, Button md, input text |
| `text-14` | 14px | `1.4` | 400 / 500 | Deskripsi detail, isi dialog konfirmasi |
| `text-16` | 16px | `1.4` | 600 (Semibold) | Header kolom (`Brain Dump`, `Top 3`, `Time Grid`) |
| `text-18` | 18px | `1.2` | 600 (Semibold) | Judul Modal Popup |

---

## 3. Sistem Radius (Corner Rounding Halus)

- **Input Control & Button**: `rounded-[4px]` (`rounded-sm`).
- **Kartu Task & Dropdown Menu**: `rounded-[6px]` (elegan dan tidak kaku siku-siku).
- **Kontainer Kolom / Panel Luar**: `rounded-lg` (8px–10px).
- **Status Dot & Avatar**: `rounded-full`.

---

## 4. Palet Warna & Semantic Tokens (Dark Mode Slate)

```css
:root {
  /* Canvas & Surfaces */
  --bg-canvas: #131415;
  --bg-surface-1: #1c1d1f;
  --bg-surface-2: #252629;
  --bg-layer-hover: rgba(255, 255, 255, 0.04);
  --bg-layer-active: rgba(255, 255, 255, 0.08);

  /* Borders (Subtle Alpha) */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-subtle-grid: rgba(255, 255, 255, 0.04);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Typography */
  --txt-primary: #f0f0f0;
  --txt-secondary: #9ea3ae;
  --txt-tertiary: #6b7280;
  --txt-placeholder: #525866;

  /* Accent Brand (Plane Blue) */
  --accent-primary: #3f76ff;
  --accent-primary-hover: #3364db;
  --accent-subtle: rgba(63, 118, 255, 0.12);

  /* Prioritas Badge */
  --priority-urgent-bg: rgba(239, 68, 68, 0.12);
  --priority-urgent-txt: #f87171;
  --priority-urgent-border: rgba(239, 68, 68, 0.25);

  --priority-high-bg: rgba(249, 115, 22, 0.12);
  --priority-high-txt: #fb923c;
  --priority-high-border: rgba(249, 115, 22, 0.25);

  --priority-medium-bg: rgba(245, 158, 11, 0.12);
  --priority-medium-txt: #fbbf24;
  --priority-medium-border: rgba(245, 158, 11, 0.25);

  --priority-low-bg: rgba(99, 102, 241, 0.12);
  --priority-low-txt: #818cf8;
  --priority-low-border: rgba(99, 102, 241, 0.25);
}
```

---

## 5. Blueprint Kode Komponen (Refined)

### A. Kartu Task Harian (Top 3 & Brain Dump)
```tsx
// Kartu Normal (Inactive)
const TASK_CARD = "group relative flex flex-col justify-between rounded-[6px] border border-white/[0.08] bg-[#1C1D1F] p-3 hover:bg-[#232427] hover:border-white/[0.14] transition-all cursor-pointer";

// Kartu Saat Sedang Dikerjakan (Active Sesi Timebox)
// BUKAN BORDER BIRU TEBAL 4 SISI, TAPI STRIP KIRI
const TASK_CARD_ACTIVE = "relative flex flex-col justify-between rounded-[6px] border border-white/[0.1] border-l-2 border-l-[#3F76FF] bg-[#1C1D1F] p-3 ring-1 ring-[#3F76FF]/20";

// Judul Task (WAJIB SANS-SERIF)
const TASK_TITLE = "text-13 font-medium text-[#F0F0F0] leading-snug font-sans";

// Durasi & Metadata Bawah
const TASK_META = "flex items-center gap-2 mt-2 text-11 text-[#9EA3AE] font-sans";
const DURATION_TAG = "inline-flex items-center gap-1 font-sans text-11 text-[#9EA3AE]";
```

### B. Time Grid Kolom Waktu
```tsx
// Baris Waktu Per 30 Menit
const GRID_ROW = "relative h-11 border-b border-white/[0.04] flex items-center hover:bg-white/[0.015] transition-colors";

// Label Jam di Sumbu Kiri (SATU-SATUNYA TEMPAT MONO)
const GRID_HOUR_LABEL = "w-14 text-right pr-3 font-mono text-10 text-[#6B7280] select-none";

// Blok Tugas di Dalam Grid
const GRID_TIMEBOX_BLOCK = "absolute left-16 right-3 rounded-[5px] border border-white/[0.08] bg-[#1E2023] px-3 py-1.5 flex items-center justify-between shadow-sm hover:border-white/[0.16] transition-all";
```

### C. Inline Quick Add Input (Pengganti Floating Bar)
Input tugas baru ditaruh di dalam kolom Brain Dump:
```tsx
const INLINE_ADD_CONTAINER = "mt-2 pt-2 border-t border-white/[0.06]";
const INLINE_INPUT = "w-full rounded-[4px] border border-white/[0.08] bg-[#161719] px-2.5 py-1.5 text-12 text-[#F0F0F0] placeholder:text-[#525866] focus:border-[#3F76FF] focus:outline-none transition-colors font-sans";
```

### D. Badge Prioritas Halus (Priority Badge)
```tsx
// Urgent
const BADGE_URGENT = "px-1.5 py-0.5 rounded-[3px] text-10 font-medium font-sans bg-red-500/10 text-red-400 border border-red-500/20";
// High
const BADGE_HIGH = "px-1.5 py-0.5 rounded-[3px] text-10 font-medium font-sans bg-orange-500/10 text-orange-400 border border-orange-500/20";
// Low
const BADGE_LOW = "px-1.5 py-0.5 rounded-[3px] text-10 font-medium font-sans bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
```

---

## 6. Checklist Validasi Review Desain

Sebelum kode UI di-merge atau di-deliver, verifikasi:
1. [ ] Apakah background menggunakan `#131415` / `#1C1D1F` dan **BUKAN** `#000000` pekat?
2. [ ] Apakah semua border menggunakan opacity alpha (`border-white/[0.08]`) sehingga tidak tajam/menusuk mata?
3. [ ] Apakah font monospace **HANYA** muncul di label jam timeline dan stopwatch timer? Apakah judul task sudah dipastikan sans-serif?
4. [ ] Apakah status aktif menggunakan aksen strip kiri (`border-l-2`) dan bukan garis kotak neon 4 sisi?
5. [ ] Apakah input tugas baru sudah menyatu di kolom dan tidak ada floating capsule melayang di bawah?
6. [ ] Apakah header bebas dari emoji dekoratif?
