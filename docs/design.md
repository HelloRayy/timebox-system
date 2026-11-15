# Design System Specification: Plane (Propel) to Timebox Ray

Dokumen ini merupakan pedoman desain resmi (*design system spec*) yang dibedah langsung dari arsitektur desain riil **Plane** (`makeplane/plane` & `@makeplane/propel`). Seluruh komponen UI pada **Timebox Ray** wajib mematuhi aturan ukuran, skala, radius, warna, dan token yang terdokumentasi di sini.

---

## 1. Filosofi & Karakteristik Desain Plane

- **Information Density Tinggi (Compact & Utilitarian)**: Plane didesain untuk produktivitas cepat. Skala teks dan spasi dipadatkan ~90% dari default web biasa agar layar mampu memuat informasi kontekstual tanpa terasa sesak.
- **Micro-Border & Subtle Dividers**: Jarang menggunakan bayangan (*drop-shadow*) tebal. Struktur ruang dipisahkan oleh garis tepi (*border*) tipis 1px bernuansa lembut (`--border-subtle`).
- **Color System Modern OKLCH**: Menggunakan ruang warna `oklch` untuk konsistensi kontras perceptual antara Light Mode dan Dark Mode.
- **Slightly Rounded Corners**: Sudut elemen rata-rata beradius kecil dan tegas (`rounded-sm` atau `4px` hingga `6px`), bukan *pill/capsule* berlebih.

---

## 2. Tipografi & Hierarki Font

### Font Family
- **Font Utama / Body & Heading**: `"Inter Variable"`, `Inter`, `ui-sans-serif`, `system-ui`, `-apple-system`, `sans-serif`
- **Font Monospace / Code & Timer**: `"IBM Plex Mono"`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`

### Skala Font Riil Plane (90% Scaled Ladder)
| Token Plane | Ukuran Rem | Ukuran Pixel | Line Height | Letter Spacing | Penggunaan |
|---|---|---|---|---|---|
| `--text-9` / `2xs` | `0.5625rem` | 9px | 1.0 | 0 | Sub-badge, micro status |
| `--text-10` / `caption-xs` | `0.625rem` | 10px | 1.0 | 0.01em | Label waktu, keyboard shortcut |
| `--text-11` / `caption-sm` | `0.6875rem` | 11px | 1.1 | 0 | Button sm, tag prioritas, pill badge |
| `--text-12` / `caption-md` | `0.75rem` | 12px | 1.1 | 0 | Metadata issue, helper text, breadcrumbs |
| `--text-13` / `body-xs` | `0.8125rem` | 13px | 1.4 | 0.01em | **Ukuran Default Button md/lg**, form label |
| `--text-14` / `body-sm` | `0.875rem` | 14px | 1.4 | 0.01em | Body text sekunder, deskripsi task |
| `--text-16` / `body-md` | `1.0rem` | 16px | 1.4 | 0.01em | Judul kartu, input utama, heading 6 |
| `--text-18` / `h5` | `1.125rem` | 18px | 1.2 | 0 | Modal title, section header |
| `--text-20` / `h4` | `1.25rem` | 20px | 1.2 | 0 | Page sub-header |
| `--text-24` / `h3` | `1.5rem` | 24px | 1.2 | 0 | Main header |

### Ketebalan Huruf (Font Weight)
- Regular: `400`
- Medium: `500` (Standar teks interaktif, tombol, dan tab)
- Semibold: `600` (Header dan penanda penting)
- Bold: `700`

---

## 3. Sistem Spacing & Padding Riil (90% Density)

Plane secara eksplisit mengompres spacing Tailwind ke pengali **0.9x** (skala padat):

| Token Spacing | Nilai Rem | Nilai Pixel | Kasus Penggunaan Riil |
|---|---|---|---|
| `0.5` | `0.1125rem` | ~1.8px | Jarak ikon mikro |
| `1` | `0.225rem` | ~3.6px | Gap badge status, inner padding mikro |
| `1.5` | `0.3375rem` | ~5.4px | Gap icon-to-label pada Button |
| `2` | `0.45rem` | ~7.2px | Padding vertikal dropdown item, gap kecil |
| `2.5` | `0.5625rem` | ~9px | Padding baris task item |
| `3` | `0.675rem` | ~10.8px | Padding tombol horizontal / field container |
| `4` | `0.9rem` | ~14.4px | Padding container komponen, kartu |
| `5` | `1.125rem` | ~18px | Padding inner modal, panel header |
| `page-x` | `1.35rem` | ~21.6px | Padding horizontal halaman utama |

---

## 4. Radius (Corner Rounding)

- **Input & Button**: `rounded-sm` atau `4px` hingga `6px` (`--rounded-sm: 4px; --rounded-md: 6px`)
- **Card / Dropdown / Popover**: `rounded-md` atau `8px` (`--rounded-lg: 8px`)
- **Modal / Floating Panel**: `10px` atau `12px`
- **Badge / Avatar**: `rounded` (untuk badge persegi dengan lengkung halus 3px) atau `rounded-full` (untuk avatar & pill status bulat).

---

## 5. Token Warna Semantic (OKLCH Mappings)

### Light Mode & Dark Mode
| Semantic Token | Light Mode Value | Dark Mode Value | Penerapan |
|---|---|---|---|
| `bg-canvas` | `oklch(0.9543 0.001 230.67)` | `oklch(0.1689 0.0021 230.81)` | Latar belakang dasar aplikasi |
| `bg-surface-1` | `oklch(1 0 0)` (White) | `oklch(0.1932 0.002 230.81)` | Latar kartu, container utama, dropdown |
| `bg-surface-2` | `oklch(0.9848 0.0003 230.66)` | `oklch(0.2158 0.0025 230.82)` | Hover state kartu, background secondary |
| `bg-layer-1` | `oklch(0.9696 0.0007 230.67)` | `oklch(0.2378 0.0029 230.83)` | Sidebar, panel navigasi, disabled button |
| `border-subtle` | `oklch(0.9389 0.0014 230.68)` | `oklch(0.2593 0.0033 230.84)` | Border antar blok, divider timeline |
| `border-strong` | `oklch(0.8925 0.0024 230.7)` | `oklch(0.3415 0.0049 230.86)` | Border focus, active state, modal rim |
| `txt-primary` | `oklch(0.2378 0.0029 230.83)` | `oklch(0.9235 0.0017 230.68)` | Teks judul utama, isi task penting |
| `txt-secondary` | `oklch(0.4377 0.0066 230.87)` | `oklch(0.8455 0.0035 230.72)` | Teks body, label, header kolom |
| `txt-tertiary` | `oklch(0.5288 0.0083 230.88)` | `oklch(0.7655 0.0054 230.76)` | Timestamp, ikon sekunder, hotkey |
| `txt-placeholder`| `oklch(0.6161 0.0091 230.86)` | `oklch(0.6835 0.0074 230.81)` | Placeholder input |

### Brand & Accent (Plane Blue)
- `bg-accent-primary`: `oklch(0.4799 0.1158 242.91)` (Dark: `oklch(0.6311 0.1262 238.01)`)
- `txt-accent-primary`: Menyesuaikan kontras teks brand utama.
- `bg-accent-subtle`: Nuansa 10–20% alpha untuk pill seleksi dan tag terpilih.

### Warna Prioritas Plane (Priority Badges)
- **Urgent**: `oklch(0.5798 0.1766 26.99)` (Merah pekat / Coral)
- **High**: `oklch(0.6802 0.1633 50.67)` (Oranye hangat)
- **Medium**: `oklch(0.79 0.1466 82.04)` (Kuning amber)
- **Low**: `oklch(0.579 0.1807 262.31)` (Biru indigo lembut)
- **None**: `oklch(0.6376 0.0129 231.77)` (Abu-abu netral)

---

## 6. Spesifikasi Komponen Kunci (Replikasi Riil)

### A. Button (`Button.tsx`)
Struktur kelas tombol riil dari codebase Plane:

```typescript
// Ukuran
sm: "px-3 py-1.5 font-medium text-11 rounded-sm flex items-center gap-1.5 whitespace-nowrap transition-all justify-center"
md: "px-4 py-1.5 font-medium text-13 rounded-sm flex items-center gap-1.5 whitespace-nowrap transition-all justify-center"
lg: "px-5 py-2 font-medium text-13 rounded-sm flex items-center gap-1.5 whitespace-nowrap transition-all justify-center"
xl: "px-5 py-3.5 font-medium text-13 rounded-sm flex items-center gap-1.5 whitespace-nowrap transition-all justify-center"

// Ikon dalam tombol
icon-sm: "h-3 w-3 flex justify-center items-center overflow-hidden my-0.5 flex-shrink-0"
icon-md: "h-3.5 w-3.5 flex justify-center items-center overflow-hidden my-0.5 flex-shrink-0"
icon-lg: "h-4 w-4 flex justify-center items-center overflow-hidden my-0.5 flex-shrink-0"

// Varian
primary: "text-on-color bg-accent-primary hover:bg-accent-primary/80 focus:bg-accent-primary/80 disabled:cursor-not-allowed !bg-layer-1 !text-on-color-disabled"
neutral-primary: "text-secondary bg-surface-1 border border-subtle hover:bg-surface-2 focus:bg-surface-2 disabled:cursor-not-allowed !bg-layer-1 !text-placeholder"
outline-primary: "text-accent-primary bg-transparent border border-accent-strong hover:bg-accent-primary/20"
danger: "bg-danger-primary text-on-color hover:bg-danger-primary-hover focus:bg-danger-primary-active disabled:cursor-not-allowed"
```

### B. Input Field & Form Primitives
- **Tinggi Elemen**:
  - `sm`: `h-7` (28px) dengan `px-2.5 text-11`
  - `md`: `h-8` (32px) dengan `px-3 text-13`
  - `lg`: `h-9` (36px) dengan `px-3.5 text-13`
- **Border & Background**:
  - Background: `bg-surface-1` (atau `bg-layer-1` saat di dalam modal).
  - Border: `border border-subtle` dengan transition `border-color 150ms ease`.
  - Focus Ring: `focus:outline-none focus:border-accent-strong focus:ring-1 focus:ring-accent-strong/30`.
- **Placeholder**: `text-placeholder font-normal`.

### C. Timebox Block / Timeline Grid Item
- **Grid Divider**: Garis horizontal `border-b border-subtle` setiap interval 30 menit (tinggi blok ~48px-56px).
- **Timebox Card**:
  - `bg-surface-1 hover:bg-surface-2 transition-colors`
  - `border border-subtle rounded-sm p-3 shadow-none`
  - Aksen samping (*left border stripe* atau *indicator dot*) berwarna sesuai prioritas (`urgent`, `high`, dll.).
  - Indikator status: Pill kecil `text-11 px-2 py-0.5 rounded-full font-medium`.

### D. Scrollbar Minimalis Khas Plane
Scrollbar webkit bawaan disembunyikan dan hanya muncul saat hover pada elemen:
```css
.vertical-scrollbar {
  overflow-y: auto;
}
.vertical-scrollbar::-webkit-scrollbar {
  width: 10px;
}
.vertical-scrollbar::-webkit-scrollbar-track {
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

## 7. Aturan Eksekusi untuk AI Agent

1. **Gunakan Tailwind Token Sesuai Mapping**: Jangan mengarang nilai pixel arbitrary (misal `text-[15px]` atau `p-[13px]`). Gunakan token `text-11`, `text-13`, `text-14`, `text-16` dan spacing rasio 0.9.
2. **Radius Maksimal 6px untuk Kontrol**: Selalu gunakan `rounded-sm` (4px) atau `rounded` (6px) untuk tombol dan input form. Jangan gunakan `rounded-xl` atau `rounded-2xl` pada komponen utilitas kerja.
3. **Dual Theme Native**: Selalu dukung Dark Mode via semantic CSS variables (`bg-canvas`, `bg-surface-1`, `border-subtle`, `txt-primary`).
4. **Ikon Konsisten**: Gunakan ikon berukuran `14px` (`h-3.5 w-3.5`) atau `16px` (`h-4 w-4`) dengan stroke width `1.75` atau `2.0` (menggunakan Lucide Icons setara styling Plane).
