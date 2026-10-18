# Rencana Implementasi Proyek Syafa Course

Sistem Manajemen Les Privat dan Monitoring Perkembangan Belajar Calistung (PAUD, TK, SD)

---

## 1. Audit Awal
- **Direktori**: `c:\Users\DELL\Documents\Project Saya\Syafa Course` dalam kondisi kosong.
- **Node.js**: v24.12.0
- **NPM**: 11.6.2
- **Tujuan**: Membangun aplikasi full-stack terintegrasi dari awal (scratch) menggunakan React + TypeScript + Vite + Tailwind CSS + Supabase + jsPDF + PWA, ramah mobile & tablet, zero-cost cloud deployment (Cloudflare Pages + Supabase Free).

---

## 2. Rencana Tahapan Kerja (13 Tahap)

### Tahap 1: Inisialisasi & Setup Arsitektur Proyek
- Inisialisasi Git repository.
- Setup Vite + React + TypeScript + Tailwind CSS + Lucide Icons + React Router + Recharts + React Hook Form + Zod + jsPDF + html2canvas.
- Setup konfigurasi path alias (`@/*`), Tailwind theme (warna soft blue, pastel pink, cream/off-white, navy, font family yang ramah anak dan profesional).

### Tahap 2: Desain Sistem & Komponen UI (Design System)
- Desain sistem: Palet warna pastel edukasi (Soft Blue `#3B82F6` / `#60A5FA`, Warm Cream `#FDFBF7`, Slate Navy `#1E293B`, Soft Amber/Green/Rose).
- Komponen UI reusable: Button, Input, Modal/Dialog, Card, Badge, Tabs, Select, Toast/Alert, StatCard, EmptyState, LoadingSkeleton.
- Skala indikator calistung: BB (Belum Berkembang), MB (Mulai Berkembang), BSH (Berkembang Sesuai Harapan), BSB (Berkembang Sangat Baik).

### Tahap 3: Database Supabase, Migrasi SQL & RLS
- Buat file migrasi SQL lengkap:
  1. `01_schema.sql`: 15 tabel lengkap (`profiles`, `students`, `parents`, `student_parent_links`, `programs`, `student_learning_targets`, `schedules`, `attendance`, `learning_sessions`, `learning_indicators`, `student_assessments`, `learning_reports`, `report_versions`, `report_delivery_logs`, `audit_logs`).
  2. `02_rls_policies.sql`: Row Level Security ketat:
     - Admin hanya boleh mengelola akun tutor (tabel `profiles`). Admin TIDAK memiliki akses ke data operasional siswa (`students`, `sessions`, `reports`).
     - Tutor hanya boleh melihat dan mengelola data siswa yang menjadi tanggung jawabnya (`tutor_id = auth.uid()`).
  3. `03_seed_data.sql`: Data demo terverifikasi (1 admin, 3 tutor, 6 siswa PAUD/TK/SD, jadwal, sesi, evaluasi calistung, laporan).
- Buat layer Supabase Client dengan support fallback Demo/Mock Mode (jika env vars belum diisi oleh user) agar aplikasi tetap 100% fungsional saat diuji langsung di browser.

### Tahap 4: Autentikasi & RBAC (Admin vs Tutor)
- Layar Login terpadu dengan deteksi role otomatis.
- Route Protection (`ProtectedRoute` untuk Admin vs Tutor).
- Modul Admin:
  - Dashboard akun tutor (total tutor, aktif, nonaktif).
  - Manajemen Akun Tutor: Tambah tutor baru, edit profil, toggle aktif/nonaktif, kirim link reset password.
  - Audit log aktivitas akun.
  - Pembatasan ketat: Admin tidak dapat melihat menu dan data operasional pembelajaran.

### Tahap 5: Dashboard Tutor & Manajemen Siswa
- Dashboard Tutor:
  - Stat card dinamis (Siswa aktif, Jadwal hari ini, Sesi selesai bulan ini, Kehadiran rata-rata).
  - Alert siswa yang butuh perhatian atau evaluasi terbaru.
  - Shortcut aksi cepat: Tambah Siswa, Buat Jadwal, Input Evaluasi, Buat Laporan.
- Modul Siswa (CRUD):
  - Form input siswa (Nama, tanggal lahir, jenjang PAUD/TK A/TK B/SD 1-6, tanggal mulai, status, catatan kebutuhan).
  - Hubungan data orang tua (Nama wali, WhatsApp, relasi, preferensi laporan).
  - Pencarian, filter jenjang, filter status, pengarsipan siswa (soft archive tanpa hapus riwayat).

### Tahap 6: Program Belajar, Jadwal & Kehadiran
- Modul Program Belajar (Membaca, Menulis, Berhitung, Literasi, Numerasi).
- Modul Jadwal & Kehadiran:
  - Tampilan daftar jadwal dan kalender interaktif.
  - Status sesi: Terjadwal, Selesai, Dibatalkan, Dijadwalkan Ulang.
  - Input kehadiran: Hadir, Izin, Sakit, Alpa.

### Tahap 7: Monitoring Calistung & Riwayat Evaluasi
- Fitur inti pencatatan sesi les:
  - Detail sesi: Tanggal, durasi, materi, metode, pencapaian, kesulitan, catatan tutor, rekomendasi latihan di rumah, target berikutnya.
  - Penilaian membaca: 7 indikator standar jenjang.
  - Penilaian menulis: 7 indikator standar motorik halus & tulisan.
  - Penilaian berhitung: 8 indikator numerasi dasar.
  - Skala 4 tingkat (BB, MB, BSH, BSB) + Belum Dinilai + catatan bukti per indikator.
  - Fitur Simpan Draft vs Finalisasi Sesi (tercatat di audit log).

### Tahap 8: Visualisasi & Halaman Perkembangan Siswa
- Halaman Detail Siswa komprehensif dengan tab:
  - Ringkasan, Riwayat Sesi, Membaca, Menulis, Berhitung, Kehadiran, Catatan Tutor, Laporan PDF.
  - Grafik tren perkembangan calistung (Recharts) dengan pemetaan visual yang transparan.
  - Analisis kompetensi yang telah dikuasai vs masih perlu stimulasi.

### Tahap 9: Generator Laporan PDF (jsPDF + html2canvas)
- Generator Laporan Perkembangan Belajar Anak 3 Halaman:
  - Halaman 1: Header logo Syafa Course, info siswa, rekap kehadiran, ringkasan perkembangan umum.
  - Halaman 2: Tabel evaluasi membaca, menulis, berhitung, grafik perkembangan, perbandingan periode.
  - Halaman 3: Catatan tutor, hal yang perlu dilatih, rekomendasi belajar di rumah, target selanjutnya, ruang tanda tangan tutor.
- Penamaan file otomatis terformat: `Laporan_SyafaCourse_[NamaSiswa]_[Bulan]_[Tahun].pdf`.
- Fitur Preview Laporan, Download PDF, dan Cetak.

### Tahap 10: Integrasi WhatsApp & Distribusi Laporan
- Generator format pesan WhatsApp santun dan profesional.
- Normalisasi nomor telepon otomatis ke format internasional (+62).
- Pembuat tautan `https://wa.me/...` dengan pesan template terisi.
- Panduan tutor untuk melampirkan file PDF secara manual.
- Pencatatan status delivery log (Disiapkan, Dibuka untuk dikirim, Terkirim).

### Tahap 11: PWA (Progressive Web App) & Mobile First UI
- Manifest web app (`manifest.json`): Nama Syafa Course, tema warna soft blue, ikon edukasi 192x192 & 512x512, standalone mode.
- Service Worker registration & offline fallback indicator.
- Tampilan responsif mobile-friendly: Bottom navigation / collapsible sidebar, touch-friendly buttons, form multi-step.

### Tahap 12: Pengujian Komprehensif
- Validasi TypeScript (`tsc --noEmit`), lint, dan build produksi Vite (`npm run build`).
- Uji skenario Admin dan Tutor, isolasi data antar tutor, hak akses, validasi input, dan generator PDF.

### Tahap 13: Dokumentasi & Panduan Deployment Gratis
- Dokumentasi lengkap file `.env.example`, `README.md`, instruksi setup Supabase gratis, Cloudflare Pages gratis, dan pembuatan admin pertama.
