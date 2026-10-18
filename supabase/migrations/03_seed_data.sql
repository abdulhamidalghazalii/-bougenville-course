-- ============================================================
-- SYAFA COURSE - SEED DATA (MIGRATION 03)
-- Master Learning Indicators (Calistung), Program Defaults & Demo Setup
-- ============================================================

-- 1. Insert Standard Calistung Indicators
-- Kategori: MEMBACA
INSERT INTO public.learning_indicators (category, education_level, indicator_name, description, order_index) VALUES
('membaca', 'Semua Jenjang', 'Mengenal huruf alfabet', 'Mampu mengidentifikasi bentuk huruf vokal dan konsonan dengan tepat', 1),
('membaca', 'Semua Jenjang', 'Mengenali bunyi fonik huruf', 'Mampu membunyikan huruf dan mengaitkannya dengan suara fonik', 2),
('membaca', 'Semua Jenjang', 'Menggabungkan suku kata', 'Mampu merangkai konsonan-vokal (ba-ca, ma-ma, bu-ku)', 3),
('membaca', 'Semua Jenjang', 'Membaca kata utuh', 'Mampu melafalkan kata 2-3 suku kata dengan lancar dan intonasi tepat', 4),
('membaca', 'Semua Jenjang', 'Membaca kalimat sederhana', 'Mampu membaca kalimat 3-5 kata dengan runtut tanpa mengeja berlebih', 5),
('membaca', 'Semua Jenjang', 'Memahami isi bacaan', 'Mampu menceritakan kembali inti cerita atau menjawab pertanyaan sederhana terkait bacaan', 6),
('membaca', 'Semua Jenjang', 'Membaca mandiri & intonasi', 'Mampu membaca teks pendek dengan intonasi wajar dan percaya diri', 7);

-- Kategori: MENULIS
INSERT INTO public.learning_indicators (category, education_level, indicator_name, description, order_index) VALUES
('menulis', 'Semua Jenjang', 'Memegang alat tulis (Tripod Grip)', 'Kenyamanan dan ketepatan posisi jari saat memegang pensil tanpa ketegangan', 1),
('menulis', 'Semua Jenjang', 'Mengikuti pola garis & motorik halus', 'Mampu menebalkan atau membuat garis lurus, lengkung, zig-zag dengan koordinasi mata-tangan baik', 2),
('menulis', 'Semua Jenjang', 'Menulis bentuk huruf', 'Mampu menulis huruf kapital dan huruf kecil dengan proporsi yang sesuai', 3),
('menulis', 'Semua Jenjang', 'Menyalin huruf dari contoh', 'Mampu menirukan dan menyalin huruf dari papan/kartu ke buku tulis', 4),
('menulis', 'Semua Jenjang', 'Menyalin kata & kerapian', 'Mampu menyalin kata dengan spasi antar-huruf yang rapi dan konsisten', 5),
('menulis', 'Semua Jenjang', 'Menulis kata mandiri (Dikte)', 'Mampu menuliskan kata yang didengarkan tanpa melihat contoh', 6),
('menulis', 'Semua Jenjang', 'Menulis kalimat sederhana mandiri', 'Mampu menyusun dan menulis kalimat sendiri dengan struktur subjek-predikat', 7);

-- Kategori: BERHITUNG
INSERT INTO public.learning_indicators (category, education_level, indicator_name, description, order_index) VALUES
('berhitung', 'Semua Jenjang', 'Mengenal simbol angka 1-20/100', 'Mampu mengidentifikasi dan menyebutkan simbol angka dengan benar', 1),
('berhitung', 'Semua Jenjang', 'Menghitung kuantitas benda konkret', 'Mampu menghitung jumlah objek secara 1-to-1 correspondence (satu per satu)', 2),
('berhitung', 'Semua Jenjang', 'Memahami urutan & nilai tempat', 'Mampu mengurutkan bilangan maju/mundur dan memahami konsep nilai tempat (satuan, puluhan)', 3),
('berhitung', 'Semua Jenjang', 'Konsep perbandingan (Lebih/Kurang/Sama)', 'Mampu membandingkan dua kelompok benda mana yang lebih banyak atau sedikit', 4),
('berhitung', 'Semua Jenjang', 'Mengenal pola bilangan & bentuk', 'Mampu mengenali pola angka loncat atau pola bentuk geometri dasar', 5),
('berhitung', 'Semua Jenjang', 'Penjumlahan dasar konkret & abstrak', 'Mampu menyelesaikan operasi penjumlahan dengan bantuan jari/benda maupun mental math', 6),
('berhitung', 'Semua Jenjang', 'Pengurangan dasar konkret & abstrak', 'Mampu menyelesaikan operasi pengurangan sederhana secara tepat', 7),
('berhitung', 'SD', 'Soal cerita & pemecahan masalah numerasi', 'Mampu memahami maksud soal cerita sehari-hari dan merumuskan operasi matematikanya', 8);

-- 2. Insert Default Learning Programs
INSERT INTO public.programs (name, education_level, description) VALUES
('Calistung Ceria PAUD & TK', 'PAUD / TK A / TK B', 'Program stimulasi literasi awal, pengenalan huruf-angka dengan media bermain sensori dan flashcard menyenangkan.'),
('Siap Masuk SD (Transisi PAUD-SD)', 'TK B / SD Kelas 1', 'Fokus membaca suku kata lancar, menulis rapi di buku bergaris, dan penjumlahan/pengurangan angka 1-20.'),
('Membaca Cepat & Lancar', 'SD Kelas 1 - 3', 'Metode bertahap tanpa mengeja untuk memperlancar kelancaran baca dan pemahaman isi teks cerita.'),
('Numerasi Hebat & Logika Dasar', 'SD Kelas 1 - 4', 'Penguatan konsep operasi hitung penjumlahan, pengurangan, perkalian, pembagian dan soal cerita aplikatif.'),
('Pendampingan Belajar Tematik SD', 'SD Kelas 1 - 6', 'Bimbingan belajar menyeluruh untuk tugas sekolah, pemantapan materi calistung dan persiapan ujian.');
