-- ============================================================
-- SYAFA COURSE - DATABASE SCHEMA (MIGRATION 01)
-- PostgreSQL via Supabase
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Admin & Tutor)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'tutor')),
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_code VARCHAR(20) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    education_level TEXT NOT NULL CHECK (
        education_level IN ('PAUD', 'TK A', 'TK B', 'SD Kelas 1', 'SD Kelas 2', 'SD Kelas 3', 'SD Kelas 4', 'SD Kelas 5', 'SD Kelas 6')
    ),
    school_class TEXT,
    photo_path TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'graduated')),
    learning_needs TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PARENTS
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. STUDENT_PARENT_LINKS
CREATE TABLE IF NOT EXISTS public.student_parent_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL CHECK (relationship IN ('Ayah', 'Ibu', 'Wali')),
    report_delivery_pref TEXT NOT NULL DEFAULT 'whatsapp' CHECK (report_delivery_pref IN ('whatsapp', 'email', 'both')),
    is_primary_contact BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, parent_id)
);

-- 5. PROGRAMS
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    education_level TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LEARNING_INDICATORS (Calistung Standar & Jenjang)
CREATE TABLE IF NOT EXISTS public.learning_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('membaca', 'menulis', 'berhitung')),
    education_level TEXT NOT NULL,
    indicator_name TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STUDENT_LEARNING_TARGETS
CREATE TABLE IF NOT EXISTS public.student_learning_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    indicator_id UUID REFERENCES public.learning_indicators(id) ON DELETE SET NULL,
    target_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'achieved')),
    target_date DATE,
    achieved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SCHEDULES
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL DEFAULT 'Rumah Siswa',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_schedule_time CHECK (end_at > start_at)
);

-- 9. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'permission', 'sick', 'absent')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(schedule_id, student_id)
);

-- 10. LEARNING_SESSIONS (Sesi Evaluasi Tutor)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    material TEXT NOT NULL,
    objectives TEXT,
    method TEXT,
    achievements TEXT,
    difficulties TEXT,
    teacher_notes TEXT,
    home_recommendations TEXT,
    next_targets TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. STUDENT_ASSESSMENTS (Penilaian Indikator BB, MB, BSH, BSB)
CREATE TABLE IF NOT EXISTS public.student_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    indicator_id UUID NOT NULL REFERENCES public.learning_indicators(id) ON DELETE RESTRICT,
    assessment_level TEXT NOT NULL CHECK (assessment_level IN ('BB', 'MB', 'BSH', 'BSB', 'UNASSESSED')),
    evidence_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, indicator_id)
);

-- 12. LEARNING_REPORTS
CREATE TABLE IF NOT EXISTS public.learning_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'custom')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('draft', 'ready', 'sent')),
    file_path TEXT,
    summary_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- 13. REPORT_VERSIONS
CREATE TABLE IF NOT EXISTS public.report_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.learning_reports(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    file_path TEXT,
    revision_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. REPORT_DELIVERY_LOGS
CREATE TABLE IF NOT EXISTS public.report_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.learning_reports(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
    status TEXT NOT NULL CHECK (status IN ('prepared', 'opened', 'sent', 'failed')),
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    notes TEXT
);

-- 15. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDICES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_tutor ON public.students(tutor_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_schedules_tutor ON public.schedules(tutor_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start ON public.schedules(start_at);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.learning_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.learning_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_assessments_session ON public.student_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_student ON public.learning_reports(student_id);
