-- ============================================================
-- SYAFA COURSE - CLOUD SYNCHRONIZATION SETUP
-- Jalankan skrip ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/buoezlbuoffwdrekmlic/sql/new
-- ============================================================

-- 1. Tabel Sinkronisasi Real-Time Lintas Perangkat (Laptop, HP, Tablet)
CREATE TABLE IF NOT EXISTS public.syafa_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aktifkan Row Level Security
ALTER TABLE public.syafa_store ENABLE ROW LEVEL SECURITY;

-- Berikan izin akses baca dan tulis untuk aplikasi web
DROP POLICY IF EXISTS "Allow public read and write for syafa_store" ON public.syafa_store;
CREATE POLICY "Allow public read and write for syafa_store"
ON public.syafa_store
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Aktifkan Realtime agar perubahan di HP langsung muncul di Laptop dan sebaliknya
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'syafa_store'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.syafa_store;
    END IF;
END $$;
