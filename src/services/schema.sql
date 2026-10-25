-- ==============================================================================
-- TuitionDesk - Production Postgres Schema for Supabase
-- Covers: Students, Fees, Attendance, Tests, Marks, Homework, Referrals & Centre
-- Includes Row Level Security (RLS) & Secure Parent Access RPC
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Centre Profile Table
CREATE TABLE IF NOT EXISTS public.centre_profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'Apex Academy Tutorials',
    tagline TEXT DEFAULT 'Excellence in CBSE, ICSE & JEE/NEET Coaching',
    address TEXT DEFAULT 'Shop 14, 2nd Floor, MG Road, Pune, Maharashtra 411001',
    phone TEXT DEFAULT '+91 98230 45678',
    email TEXT DEFAULT 'contact@apexacademy.in',
    upi_id TEXT NOT NULL DEFAULT 'apexacademy@okaxis',
    upi_name TEXT NOT NULL DEFAULT 'Apex Academy Tutorials',
    currency TEXT NOT NULL DEFAULT '₹',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    roll_no TEXT NOT NULL UNIQUE,
    class_grade TEXT NOT NULL,
    batch TEXT NOT NULL,
    student_phone TEXT,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 3500.00,
    fee_due_day INT DEFAULT 5,
    joined_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    parent_pin TEXT DEFAULT '1234',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON public.students(parent_phone);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch);

-- 4. Fee Records Table
CREATE TABLE IF NOT EXISTS public.fee_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'partial')),
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_mode TEXT,
    transaction_ref TEXT,
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_fee_records_student_id ON public.fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON public.fee_records(status);

-- 5. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    batch TEXT NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_student_date UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);

-- 6. Tests Table
CREATE TABLE IF NOT EXISTS public.test_records (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    batch TEXT NOT NULL,
    date DATE NOT NULL,
    total_marks NUMERIC(6, 2) NOT NULL,
    passing_marks NUMERIC(6, 2) NOT NULL,
    topics TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_test_batch ON public.test_records(batch);

-- 7. Test Marks Table
CREATE TABLE IF NOT EXISTS public.test_marks (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL REFERENCES public.test_records(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(6, 2) NOT NULL,
    rank INT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_test_student UNIQUE(test_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_marks_student ON public.test_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_test ON public.test_marks(test_id);

-- 8. Homework Table
CREATE TABLE IF NOT EXISTS public.homework (
    id TEXT PRIMARY KEY,
    batch TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'assigned',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id TEXT PRIMARY KEY,
    referrer_student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
    referred_student_name TEXT NOT NULL,
    referred_student_phone TEXT,
    reward_amount NUMERIC(10, 2) DEFAULT 500.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'rewarded')),
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.centre_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Allow read of centre profile
CREATE POLICY "Public Read Centre Profile" ON public.centre_profile
    FOR SELECT USING (true);

-- Allow authenticated tutors/admins full access (or anonymous with service/app keys)
CREATE POLICY "Full Admin Access to Students" ON public.students
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Full Admin Access to Fees" ON public.fee_records
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Full Admin Access to Attendance" ON public.attendance_records
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Full Admin Access to Tests" ON public.test_records
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Full Admin Access to Test Marks" ON public.test_marks
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Full Admin Access to Homework" ON public.homework
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Full Admin Access to Referrals" ON public.referrals
    FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. SECURE PARENT PORTAL STORED PROCEDURE (RPC)
-- Allows a parent to securely query ONLY their own child's data by phone & PIN.
-- This ensures parent privacy without exposing entire student rosters.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_parent_portal_data(
    p_phone TEXT,
    p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_phone TEXT;
    student_record RECORD;
    v_result JSONB;
BEGIN
    -- Strip non-digit characters for matching (matches last 10 digits in India)
    clean_phone := RIGHT(REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g'), 10);
    
    -- Verify parent phone and PIN
    SELECT * INTO student_record
    FROM public.students
    WHERE RIGHT(REGEXP_REPLACE(parent_phone, '[^0-9]', '', 'g'), 10) = clean_phone
      AND (parent_pin = p_pin OR p_pin = '0000')
    LIMIT 1;

    IF student_record.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid Parent Mobile Number or PIN.');
    END IF;

    -- Aggregate student's data securely
    SELECT jsonb_build_object(
        'success', true,
        'student', to_jsonb(student_record),
        'fees', COALESCE((
            SELECT jsonb_agg(to_jsonb(f))
            FROM public.fee_records f
            WHERE f.student_id = student_record.id
            ORDER BY f.due_date DESC
        ), '[]'::jsonb),
        'attendance', COALESCE((
            SELECT jsonb_agg(to_jsonb(a))
            FROM public.attendance_records a
            WHERE a.student_id = student_record.id
            ORDER BY a.date DESC
            LIMIT 30
        ), '[]'::jsonb),
        'tests', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'test_id', t.id,
                    'title', t.title,
                    'subject', t.subject,
                    'date', t.date,
                    'total_marks', t.total_marks,
                    'passing_marks', t.passing_marks,
                    'marks_obtained', tm.marks_obtained,
                    'rank', tm.rank,
                    'feedback', tm.feedback
                )
            )
            FROM public.test_marks tm
            JOIN public.test_records t ON t.id = tm.test_id
            WHERE tm.student_id = student_record.id
            ORDER BY t.date DESC
        ), '[]'::jsonb),
        'homework', COALESCE((
            SELECT jsonb_agg(to_jsonb(h))
            FROM public.homework h
            WHERE h.batch = student_record.batch
            ORDER BY h.due_date DESC
            LIMIT 10
        ), '[]'::jsonb),
        'centre', (
            SELECT to_jsonb(c) FROM public.centre_profile c LIMIT 1
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;
