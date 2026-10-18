# Syafa Course — "Belajar Ceria, Tumbuh Bersama"

Sistem Manajemen Les Privat & Monitoring Perkembangan Belajar Calistung (Membaca, Menulis, Berhitung) untuk Anak PAUD, TK, hingga SD.

---

## 🌟 Fitur Unggulan

1. **Role-Based Separation Keras (Admin vs Tutor)**:
   - **Admin**: Hanya mengelola akun tutor (tambah tutor, nonaktifkan/aktifkan akun, kirim reset password). Admin **sama sekali tidak memiliki akses** ke data siswa, catatan operasional les, maupun laporan calistung privat.
   - **Tutor**: Mengelola penuh seluruh operasional siswa binaannya (data siswa, jadwal, kehadiran, evaluasi calistung, laporan PDF, dan WhatsApp). Data antar-tutor terisolasi secara ketat.
2. **Monitoring Calistung 4 Skala**:
   - Rubrik indikator jenjang berjenjang: **BB** (Belum Berkembang), **MB** (Mulai Berkembang), **BSH** (Berkembang Sesuai Harapan), dan **BSB** (Berkembang Sangat Baik).
   - Mode **Simpan Draf** dan **Finalisasi Sesi Belajar**.
3. **Generator Laporan PDF 3 Halaman Resmi**:
   - Halaman 1: Ringkasan identitas siswa, rekap kehadiran, dan evaluasi umum.
   - Halaman 2: Lembar evaluasi capaian aspek membaca, menulis, dan berhitung.
   - Halaman 3: Catatan bimbingan, rekomendasi di rumah untuk orang tua, target berikutnya, dan area tanda tangan.
   - Penamaan otomatis: `Laporan_SyafaCourse_[NamaSiswa]_[Periode].pdf`.
4. **Integrasi WhatsApp**:
   - Pembuat pesan sopan otomatis ke nomor wali murid (`wa.me`) dengan panduan melampirkan file PDF secara manual.
   - Log pelacakan status pengiriman (*Disiapkan*, *Dibuka*, *Terkirim*).
5. **Mobile-First & PWA**:
   - Dapat diinstal sebagai aplikasi mandiri di HP Android, iPhone, tablet, dan PC desktop.
   - Caching aman tanpa menyimpan data sensitif siswa ke cache publik.

---

## 🛠️ Stack Teknologi

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router DOM.
- **Backend & Database**: PostgreSQL via Supabase, Supabase Row Level Security (RLS).
- **PDF Engine**: jsPDF & jspdf-autotable.
- **Target Deployment**: Cloudflare Pages Free (Frontend) + Supabase Free Tier (Database & Auth) -> **Biaya Rp0**.

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Clone & Install Dependencies
```bash
# Masuk ke direktori proyek
cd "Syafa Course"

# Install dependensi
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*(Catatan: Aplikasi telah dilengkapi **Interactive Demo Mode** sehingga dapat langsung dijalankan dan diuji 100% tanpa konfigurasi Supabase awal).*

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di: **`http://localhost:3000/`**

---

## ☁️ Panduan Setup Supabase (Paket Gratis Rp0)

1. Buat akun gratis di [supabase.com](https://supabase.com).
2. Buat proyek baru (*New Project*), pilih region terdekat (misalnya: *Singapore*).
3. Buka menu **SQL Editor** di dashboard Supabase.
4. Jalankan script migrasi secara berurutan:
   - Jalankan `supabase/migrations/01_schema.sql` (Membuat 15 tabel & relasi).
   - Jalankan `supabase/migrations/02_rls_policies.sql` (Mengaktifkan Row Level Security ketat).
   - Jalankan `supabase/migrations/03_seed_data.sql` (Mengisi master indikator calistung & program).
5. Buka **Project Settings -> API**:
   - Salin **Project URL** ke `VITE_SUPABASE_URL` di file `.env`.
   - Salin **Project API Anon Key** ke `VITE_SUPABASE_ANON_KEY` di file `.env`.

### Pembuatan Akun Admin Pertama (Bootstrap Admin)
Untuk membuat admin pertama dengan aman:
1. Daftarkan akun email admin di menu **Authentication -> Users** pada dashboard Supabase.
2. Buka **SQL Editor** dan tetapkan role admin untuk user tersebut:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role, is_active)
   VALUES ('<ID_USER_DARI_AUTH>', 'admin@syafacourse.id', 'Sarah Rahmawati, S.Pd', 'admin', true)
   ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;
   ```

---

## 🌐 Panduan Deployment ke Cloudflare Pages (Gratis Rp0)

1. Upload kode proyek ke repository **GitHub** pribadi Anda.
2. Buka dashboard [Cloudflare Pages](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Pilih repository GitHub Syafa Course.
4. Atur pengaturan build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Tambahkan Environment Variables di Cloudflare Pages:
   - `VITE_SUPABASE_URL`: URL project Supabase Anda.
   - `VITE_SUPABASE_ANON_KEY`: Anon public key Supabase Anda.
6. Klik **Save and Deploy**. Cloudflare Pages akan otomatis mem-build dan memberikan subdomain gratis seperti `https://syafa-course.pages.dev`.

> [!NOTE]
> File `public/_redirects` sudah dikonfigurasi (`/* /index.html 200`) sehingga seluruh rute React Router tidak akan mengalami error 404 saat halaman di-refresh di Cloudflare Pages.

---

## 🧪 Akun Demo untuk Pengujian Cepat

Aplikasi menyediakan tombol **"Ganti Akun Demo"** di bilah navigasi atas (Navbar) untuk menguji seluruh skenario:
1. **Sarah Rahmawati, S.Pd (Admin Pusat)**:
   - Email: `admin@syafacourse.id`
   - Hak Akses: Mengelola akun tutor, status aktif/nonaktif, log audit keamanan. Tidak dapat membuka menu pembelajaran siswa.
2. **Aisyah Putri, S.Pd (Tutor PAUD & TK)**:
   - Email: `aisyah@syafacourse.id`
   - Binaan: Kenzo Pratama (TK B), Alika Zahra (PAUD).
3. **Budi Santoso, M.Pd (Tutor SD)**:
   - Email: `budi@syafacourse.id`
   - Binaan: Fathan Al-Ghifari (SD Kelas 1). Membuktikan isolasi data: Tutor Budi tidak dapat melihat siswa Kak Aisyah.
