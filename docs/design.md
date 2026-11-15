# Design System Specification: Plane (Propel) to Timebox Ray

Dokumen ini adalah acuan desain resmi (*canonical design spec*) untuk seluruh AI agent dan engineer dalam merancang antarmuka **Timebox Ray**. Standar di sini diekstrak langsung dari arsitektur nyata repositori **Plane** (`makeplane/plane` & `@makeplane/propel`).

Setiap komponen baru yang dibuat **WAJIB** tunduk pada formula, nama token, batasan radius, hierarki font, dan kelas utilitas yang tertera di bawah.

---

## 1. Prinsip Utama Antarmuka

1. **Information Density 90% (Ultra-Compact)**
   - Plane tidak menggunakan ukuran default web yang boros ruang (*loose spacing*).
   - Seluruh padding, margin, dan skala font dipadatkan ~90% agar muat banyak informasi kerja tanpa membuat mata lelah.
2. **Hairline Precision Borders (Bukan Drop Shadow Tebal)**
   - Separasi visual antar kartu, kolom, panel, dan header mengandalkan border 1px atau 0.5px (`border-subtle`, `border-subtle-1`).
   - Hindari penggunaan box-shadow besar (seperti `shadow-xl`, `shadow-2xl`). Gunakan `shadow-none` atau micro-shadow `shadow-custom-shadow-2xs`.
3. **Restrained Rounding (Sudut Ramping)**
   - Kontrol form, input, dan button: **tepat 4px** (`rounded-sm`) atau **6px** (`rounded`).
   - Container kartu dan popover: **8px** (`rounded-md`).
   - Modal dialog: **10px - 12px**.
   - Dilarang keras menggunakan pill/capsule bulat (`rounded-full`) kecuali untuk avatar lingkaran, toggle switch, atau status dot.
4. **Perceptual OKLCH Color Harmony**
   - Mendukung Dark Mode dan Light Mode bawaan melalui semantic variable OKLCH.

---

## 2. Tipografi Resmi & Aturan Font

### Font Stack
```css
/* Utama / Body & Heading */
font-family: "Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;

/* Monospace / Code, Durasi, Timer & Shortcut */
font-family: "IBM Plex Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Tabel Skala Font (Font Ladder)
| Token Tailwind | Ukuran Rem | Pixel Asli | Line Height | Weight Standar | Konteks Penggunaan |
|---|---|---|---|---|---|
| `text-10` | `0.625rem` | 10px | `1.0` | 400 | Keyboard shortcut badge (e.g., `⌘K`), micro timestamp |
| `text-11` | `0.6875rem` | 11px | `1.1` | 500 (Medium) | **Button sm**, dropdown item, tag prioritas, label filter |
| `text-12` | `0.75rem` | 12px | `1.1` | 400 / 500 | Breadcrumb, helper text, status sub-label |
| `text-13` | `0.8125rem` | 13px | `1.4` | 500 (Medium) | **Standar Button (md/lg)**, Form label, input text |
| `text-14` | `0.875rem` | 14px | `1.4` | 400 / 500 | Body deskripsi tugas, dialog body text |
| `text-16` | `1.000rem` | 16px | `1.4` | 600 (Semibold) | Judul task card, header section, heading 6 |
| `text-18` | `1.125rem` | 18px | `1.2` | 600 (Semibold) | Judul Modal popup, heading 5 |
| `text-20` | `1.250rem` | 20px | `1.2` | 600 (Semibold) | Page sub-header |
| `text-24` | `1.500rem` | 24px | `1.2` | 700 (Bold) | Main page header |

*Aturan*: Jangan gunakan class Tailwind bawaan seperti `text-xs` (12px) atau `text-sm` (14px) jika konteksnya adalah button atau form control—gunakan langsung token presisi Plane `text-11` atau `text-13`.

---

## 3. Sistem Spacing & Grid (Skala 0.9x)

```
0.5  -> 0.1125rem (~1.8px)   : Jarak mikro ikon ke border
1    -> 0.225rem  (~3.6px)   : Gap badge kecil
1.5  -> 0.3375rem (~5.4px)   : Jarak teks ke ikon di tombol
2    -> 0.45rem   (~7.2px)   : Padding vertikal dropdown & menu item
2.5  -> 0.5625rem (~9.0px)   : Padding baris item list task
3    -> 0.675rem  (~10.8px)  : Padding horizontal button/input standar
3.5  -> 0.7875rem (~12.6px)  : Padding tombol large
4    -> 0.9rem    (~14.4px)  : Padding dalam kartu / widget
5    -> 1.125rem  (~18.0px)  : Padding modal box, toolbar container
page-x -> 1.35rem (~21.6px)  : Padding horizontal batas layar
```

---

## 4. Sistem Token Warna Semantic (OKLCH)

### Backgrounds & Surfaces
- `bg-canvas`: Warna kanvas latar belakang paling dasar (Light: `#F3F3F3` / Dark: `#151617`).
- `bg-surface-1`: Warna permukaan kartu kerja, popover, dan panel (Light: `#FFFFFF` / Dark: `#1E1F21`).
- `bg-surface-2`: Hover state permukaan (Light: `#F9F9F9` / Dark: `#26272B`).
- `bg-layer-1`: Sidebar, header sekunder, dan disabled state.
- `bg-layer-transparent-hover`: Warna transparan dinamis untuk efek hover menu item (`hover:bg-layer-transparent-hover`).

### Borders
- `border-subtle`: Border tipis pemisah garis waktu dan kartu (`--neutral-400` / Dark `--neutral-400`).
- `border-subtle-1`: Border pemisah menu dropdown (`border-[0.5px] border-subtle-1`).
- `border-strong`: Border fokus input field dan active state.

### Text & Icons
- `text-primary` / `txt-primary`: Teks utama paling tegas (`oklch(0.2378 ...)` / Dark `oklch(0.9235 ...)`).
- `text-secondary` / `txt-secondary`: Teks label, subtitle, dan header kolom.
- `text-tertiary` / `txt-tertiary`: Timestamp waktu, hotkey shortcut, icon pasif.
- `text-placeholder`: Warna placeholder input (`--neutral-900`).

### Brand & Accents
- `bg-accent-primary`: Warna brand utama Plane Blue (`oklch(0.4799 0.1158 242.91)` / Dark: `oklch(0.6311 0.1262 238.01)`).
- `text-accent-primary`: Warna teks aksen interaktif.
- `bg-accent-primary/20`: Background aksen lembut untuk badge dan pill aktif.

### Priority Colors (Status & Urgensi)
- **Urgent**: `text-red-700 bg-red-50 border-red-200` (Dark: `text-red-400 bg-red-950/40 border-red-800`).
- **High**: `text-orange-700 bg-orange-50 border-orange-200` (Dark: `text-orange-400 bg-orange-950/40 border-orange-800`).
- **Medium**: `text-amber-700 bg-amber-50 border-amber-200` (Dark: `text-amber-400 bg-amber-950/40 border-amber-800`).
- **Low**: `text-indigo-700 bg-indigo-50 border-indigo-200` (Dark: `text-indigo-400 bg-indigo-950/40 border-indigo-800`).
- **None**: `text-secondary bg-surface-2 border-subtle`.

---

## 5. Blueprint Spesifikasi Komponen (Wajib Diikuti)

Setiap komponen yang dibangun AI Agent harus mengadopsi struktur kelas CSS di bawah ini:

### 1. Button (`Button.tsx`)
```tsx
// Ukuran (Sizes)
const SIZES = {
  sm: "px-3 py-1.5 font-medium text-11 rounded-sm flex items-center gap-1.5 whitespace-nowrap transition-all justify-center",
  md: "px-4 py-1.5 font-medium text-13 rounded-sm flex items-center gap-1.5 whitespace-nowrap transition-all justify-center",
  lg: "px-5 py-2 font-medium text-13 rounded-sm flex items-center gap-1.5 whitespace-nowrap transition-all justify-center",
};

// Varian (Variants)
const VARIANTS = {
  primary: "text-on-color bg-accent-primary hover:bg-accent-primary/80 focus:bg-accent-primary/80 disabled:cursor-not-allowed !bg-layer-1 !text-on-color-disabled",
  "neutral-primary": "text-secondary bg-surface-1 border border-subtle hover:bg-surface-2 focus:bg-surface-2 disabled:cursor-not-allowed !bg-layer-1 !text-placeholder",
  "outline-primary": "text-accent-primary bg-transparent border border-accent-strong hover:bg-accent-primary/20",
  danger: "bg-danger-primary text-on-color hover:bg-danger-primary-hover focus:bg-danger-primary-active disabled:cursor-not-allowed",
  "link-neutral": "text-tertiary hover:text-secondary focus:text-primary p-0 bg-transparent",
};

// Ikon di dalam Button
const ICON_SIZES = {
  sm: "h-3 w-3 flex-shrink-0",
  md: "h-3.5 w-3.5 flex-shrink-0",
  lg: "h-4 w-4 flex-shrink-0",
};
```

### 2. Input Field & Form Controls
```tsx
// Input Standar
const INPUT_BASE = "w-full rounded-sm border border-subtle bg-surface-1 px-3 py-1.5 text-13 text-primary placeholder:text-placeholder transition-colors focus:border-accent-strong focus:outline-none focus:ring-1 focus:ring-accent-strong/30 disabled:cursor-not-allowed disabled:bg-layer-1 disabled:text-disabled";

// Input Compact (untuk Filter atau Sub-item)
const INPUT_COMPACT = "w-full rounded-sm border border-subtle bg-surface-1 px-2.5 py-1 text-11 text-primary placeholder:text-placeholder focus:border-accent-strong focus:outline-none";
```

### 3. Dropdown Menu / Custom Select
Pola resmi dari `custom-select.tsx` milik Plane:
```tsx
// Trigger Button
const DROPDOWN_TRIGGER = "flex items-center justify-between gap-1 rounded-sm border border-subtle px-2 py-1 text-11 text-secondary hover:bg-layer-transparent-hover cursor-pointer";

// Floating Popover Menu Container
const DROPDOWN_MENU = "z-30 my-1 min-w-48 overflow-y-auto rounded-md border-[0.5px] border-subtle-1 bg-surface-1 px-1 py-1.5 text-11 shadow-custom-shadow-rg focus:outline-none";

// Dropdown Option Item
const DROPDOWN_ITEM = "flex cursor-pointer items-center justify-between gap-2 truncate rounded-sm px-2 py-1.5 text-secondary select-none hover:bg-layer-transparent-hover transition-colors";
```

### 4. Modal Dialog / Hard Stop Popup
```tsx
// Backdrop
const MODAL_BACKDROP = "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity";

// Modal Box
const MODAL_BOX = "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md border border-subtle bg-surface-1 p-5 shadow-custom-shadow-lg";

// Header & Title
const MODAL_TITLE = "text-18 font-semibold text-primary";
const MODAL_SUBTITLE = "text-13 text-secondary mt-1";
```

### 5. Timebox Grid & Timeline Card
Komponen khusus untuk Timebox Ray:
```tsx
// Baris Waktu (Slot 30 Menit)
const TIMELINE_SLOT = "relative h-12 border-b border-subtle/60 flex items-center";

// Label Jam di Sisi Kiri
const TIMELINE_HOUR_LABEL = "w-16 text-right pr-3 font-mono text-10 text-tertiary select-none";

// Timebox Block Card (Kartu Tugas yang ditarik ke jam)
const TIMEBOX_CARD = "absolute left-20 right-4 rounded-sm border border-subtle bg-surface-1 p-2.5 hover:bg-surface-2 transition-all cursor-pointer flex flex-col justify-between";

// Indikator Aktif Saat Timer Berjalan (Deep Work)
const ACTIVE_PULSE = "border-l-4 border-l-accent-primary ring-1 ring-accent-primary/20 bg-accent-primary/5";
```

### 6. Scrollbar Minimalis Khas Plane
Wajib disuntikkan ke CSS global (`index.css` atau `globals.css`):
```css
.vertical-scrollbar {
  overflow-y: auto;
}
.vertical-scrollbar::-webkit-scrollbar {
  width: 10px;
}
.vertical-scrollbar-track {
  background: transparent;
}
.vertical-scrollbar::-webkit-scrollbar-thumb {
  background-clip: padding-box;
  border: 3px solid transparent;
  border-radius: 9999px;
  background-color: var(--scrollbar-thumb);
}
.vertical-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-hover);
}
```

---

## 6. Aturan Pengujian & Validasi Desain untuk AI Agent

Sebelum menyelesaikan tugas pembuatan komponen UI, AI Agent wajib memverifikasi:
1. **Tidak Ada Arbitrary Pixel Classes**: Cek apakah ada `text-[15px]` atau `p-[7px]` yang melanggar hierarki token.
2. **Radius Integrity**: Pastikan kontrol tidak menggunakan `rounded-xl` atau `rounded-2xl`. Tombol dan input harus tetap `rounded-sm` atau `rounded`.
3. **Contrast Compliance**: Pastikan teks kecil (`text-11` atau `text-10`) memiliki kontras yang terbaca jelas di Dark Mode dengan menggunakan `text-secondary` atau `text-primary`.
4. **Ikon Proporsional**: Gunakan Lucide Icons dengan `size={14}` (`h-3.5 w-3.5`) untuk kontrol standar dan `size={16}` (`h-4 w-4`) untuk aksi utama, selalu sertakan `strokeWidth={2}`.
