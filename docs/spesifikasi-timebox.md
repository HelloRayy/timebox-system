# Rencana Pengembangan: Timebox Ray

Dokumen ini adalah acuan spesifikasi dan alur kerja teknis untuk AI agent dalam membangun aplikasi **Timebox Ray**.

---

## 1. Konsep & Filosofi Inti

Timeboxing adalah teknik manajemen waktu di mana alokasi blok waktu bersifat kaku (*fixed*).
- **Prinsip**: Waktu yang mengatur tugas, bukan tugas yang mengatur waktu.
- **Hard Stop**: Saat waktu habis, pekerjaan langsung dihentikan untuk evaluasi (selesai atau jadwalkan ulang di sesi baru). Tidak boleh molor otomatis ke jam berikutnya.
- **Integrasi Plane.so**: Plane.so berfungsi sebagai *gudang backlog*, sementara Timebox Ray berfungsi sebagai *eksekusi harian*.

---

## 2. Prioritas Fitur (MoSCoW Framework)

### Must Have (Fase 1 - Fondasi Utama)
1. **Time Grid Harian (Slot Jam Kaku)**
   - Tampilan visual garis waktu harian (interval 15/30/60 menit).
   - Validasi ketat: blok waktu tidak boleh saling tumpang tindih (*no overlapping*).
2. **Top 3 Priorities Gate**
   - Batasan tegas maksimal 3 tugas utama per hari untuk menghindari *decision fatigue*.
3. **Brain Dump & Task Staging**
   - Area penampung tugas sebelum dialokasikan ke jam tertentu (input manual cepat atau ditarik dari Plane.so).
4. **Hard Stop & Dialog Selesai/Reschedule**
   - Penanda waktu habis yang memicu aksi: tandai `Selesai` atau `Jadwalkan Ulang ke Slot Baru`.

### Should Have (Fase 2 - Peningkatan & Integrasi)
1. **Integrasi API Plane.so**
   - Tarik issue aktif / assigned dari Plane.so langsung ke Brain Dump.
   - Kirim balik update status (`Done`) dan pencatatan durasi kerja (*worklog*).
2. **Timer Aktif per Blok**
   - Penghitung waktu mundur visual saat blok sedang berjalan.
3. **Buffer Time Block**
   - Blok jeda istirahat instan (15–30 menit) di antara sesi *deep work*.

### Could Have (Fase 3 - Optimasi Lanjutan)
1. Notifikasi suara/sistem saat waktu habis.
2. Sinkronisasi kalender eksternal (Google Calendar).
3. Analisis akurasi estimasi waktu vs realisasi.

### Won't Have (Di Luar Cakupan Awal)
1. Manajemen project / sprint planning penuh (tetap berada di Plane.so).
2. Kolaborasi multi-user / tim (fokus *single user productivity*).
3. Aplikasi mobile native.

---

## 3. Alur Kerja Pengguna (User Flow)

```
[Mulai Hari]
     │
     ▼
[Brain Dump / Sinkronisasi Plane.so]
  Tarik issue atau tulis tugas cepat
     │
     ▼
[Pilih Top 3 Prioritas]
  Kunci maksimal 3 tugas utama hari ini
     │
     ▼
[Plotting ke Time Grid]
  Tentukan jam mulai dan jam selesai untuk tiap tugas
     │
     ▼
[Eksekusi Timebox (Deep Work)]
  Fokus pada 1 tugas tanpa multitasking
     │
     ▼
[Hard Stop (Waktu Habis)]
  ┌─────────────────┴─────────────────┐
  ▼                                   ▼
[Tugas Selesai]                [Belum Selesai]
Update status Plane -> Done    Tetap In Progress, jadwalkan slot baru
```

---

## 4. Panduan Eksekusi untuk AI Agent

Saat mengimplementasikan proyek ini, AI agent harus:
1. Menjaga arsitektur kode tetap modular, memisahkan logika timebox, state management, dan adapter integrasi Plane.so.
2. Memastikan aturan validasi kaku: tidak ada dua blok waktu bertabrakan di tanggal yang sama.
3. Mengutamakan performa dan kesederhanaan antarmuka agar pengguna tidak terdistraksi saat merencanakan hari.
