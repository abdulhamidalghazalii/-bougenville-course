-- ============================================================
-- SYAFA COURSE - ROW LEVEL SECURITY (RLS) POLICIES (MIGRATION 02)
-- Strict Role-Based Separation: Admin vs Tutor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is active
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current user is Tutor
CREATE OR REPLACE FUNCTION public.is_tutor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'tutor' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 1. PROFILES POLICIES
-- Admin manages tutor accounts. Users can view/edit their own profile info.
-- ------------------------------------------------------------
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admin can view all tutor profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin can insert new tutor profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (public.is_admin() AND role = 'tutor');

CREATE POLICY "Admin can update tutor profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Users can update own non-sensitive profile info"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() 
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents role self-elevation
    );

-- ------------------------------------------------------------
-- 2. LEARNING INDICATORS POLICIES
-- Active tutors can view all indicators
-- ------------------------------------------------------------
CREATE POLICY "Active tutors can view indicators"
    ON public.learning_indicators FOR SELECT
    USING (public.is_tutor());

-- ------------------------------------------------------------
-- 3. STUDENTS POLICIES
-- Tutor ONLY sees and manages their own assigned students. Admin has NO access.
-- ------------------------------------------------------------
CREATE POLICY "Tutor can view own students"
    ON public.students FOR SELECT
    USING (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can insert own students"
    ON public.students FOR INSERT
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can update own students"
    ON public.students FOR UPDATE
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can archive own students"
    ON public.students FOR DELETE
    USING (public.is_tutor() AND tutor_id = auth.uid());

-- ------------------------------------------------------------
-- 4. PARENTS & LINKS POLICIES
-- ------------------------------------------------------------
CREATE POLICY "Tutor can view own students parents"
    ON public.parents FOR SELECT
    USING (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can insert parents"
    ON public.parents FOR INSERT
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can update parents"
    ON public.parents FOR UPDATE
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can view student parent links"
    ON public.student_parent_links FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = student_parent_links.student_id AND tutor_id = auth.uid()
        )
    );

CREATE POLICY "Tutor can insert student parent links"
    ON public.student_parent_links FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = student_parent_links.student_id AND tutor_id = auth.uid()
        )
    );

CREATE POLICY "Tutor can delete student parent links"
    ON public.student_parent_links FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = student_parent_links.student_id AND tutor_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 5. PROGRAMS & TARGETS
-- ------------------------------------------------------------
CREATE POLICY "Tutors can view programs"
    ON public.programs FOR SELECT
    USING (public.is_tutor() AND (tutor_id = auth.uid() OR tutor_id IS NULL));

CREATE POLICY "Tutors can manage own programs"
    ON public.programs FOR ALL
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutors can view and manage learning targets"
    ON public.student_learning_targets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = student_learning_targets.student_id AND tutor_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = student_learning_targets.student_id AND tutor_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 6. SCHEDULES & ATTENDANCE
-- ------------------------------------------------------------
CREATE POLICY "Tutor can view own schedules"
    ON public.schedules FOR SELECT
    USING (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can manage own schedules"
    ON public.schedules FOR ALL
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can manage attendance"
    ON public.attendance FOR ALL
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

-- ------------------------------------------------------------
-- 7. LEARNING SESSIONS & ASSESSMENTS
-- Core monitoring features: Draft vs Finalized
-- ------------------------------------------------------------
CREATE POLICY "Tutor can view own learning sessions"
    ON public.learning_sessions FOR SELECT
    USING (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can insert own learning sessions"
    ON public.learning_sessions FOR INSERT
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can update own learning sessions"
    ON public.learning_sessions FOR UPDATE
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can manage assessments for own sessions"
    ON public.student_assessments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.learning_sessions
            WHERE id = student_assessments.session_id AND tutor_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.learning_sessions
            WHERE id = student_assessments.session_id AND tutor_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 8. REPORTS, VERSIONS & DELIVERY LOGS
-- ------------------------------------------------------------
CREATE POLICY "Tutor can manage own learning reports"
    ON public.learning_reports FOR ALL
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

CREATE POLICY "Tutor can manage report versions"
    ON public.report_versions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.learning_reports
            WHERE id = report_versions.report_id AND tutor_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.learning_reports
            WHERE id = report_versions.report_id AND tutor_id = auth.uid()
        )
    );

CREATE POLICY "Tutor can manage report delivery logs"
    ON public.report_delivery_logs FOR ALL
    USING (public.is_tutor() AND tutor_id = auth.uid())
    WITH CHECK (public.is_tutor() AND tutor_id = auth.uid());

-- ------------------------------------------------------------
-- 9. AUDIT LOGS
-- ------------------------------------------------------------
CREATE POLICY "Users can create audit logs for own actions"
    ON public.audit_logs FOR INSERT
    WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Admin can view account audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin() AND entity_type = 'profile');

CREATE POLICY "Tutors can view own learning audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_tutor() AND actor_id = auth.uid());
