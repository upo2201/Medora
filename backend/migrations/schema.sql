-- ============================================================================
-- MEDICAL SNAPSHOT QR: Supabase PostgreSQL Database Schema
-- Production-Ready Schema with Row Level Security (RLS) & Indexes
-- ============================================================================

-- Enable pgcrypto / uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users / Profiles (Mirrors or links to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Medical Profiles
CREATE TABLE IF NOT EXISTS public.medical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER CHECK (age >= 0 AND age <= 130),
    blood_group TEXT,
    medical_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
    no_known_allergies BOOLEAN NOT NULL DEFAULT FALSE,
    current_medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    doctor_name TEXT,
    doctor_contact TEXT,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_relationship TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_email TEXT,
    emergency_notification_email TEXT,
    emergency_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_email_verification_code TEXT,
    emergency_email_verification_token TEXT,
    emergency_email_verification_sent_at TIMESTAMPTZ,
    pending_emergency_notification_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- 3. Emergency Visibility (Explicit privacy toggles)
CREATE TABLE IF NOT EXISTS public.emergency_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.medical_profiles(id) ON DELETE CASCADE,
    show_name BOOLEAN NOT NULL DEFAULT TRUE,
    show_age BOOLEAN NOT NULL DEFAULT TRUE,
    show_blood_group BOOLEAN NOT NULL DEFAULT TRUE,
    show_allergies BOOLEAN NOT NULL DEFAULT TRUE,
    show_medications BOOLEAN NOT NULL DEFAULT TRUE,
    show_conditions BOOLEAN NOT NULL DEFAULT TRUE,
    show_doctor_details BOOLEAN NOT NULL DEFAULT FALSE,
    show_emergency_contact BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_profile_visibility UNIQUE (profile_id)
);

-- 4. QR Tokens (Cryptographic tokens, only SHA-256 hash stored!)
CREATE TABLE IF NOT EXISTS public.qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.medical_profiles(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked'))
);

-- 5. Access Logs (Privacy-conscious, no raw IP or precise geolocation)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_token_id UUID REFERENCES public.qr_tokens(id) ON DELETE SET NULL,
    profile_id UUID NOT NULL REFERENCES public.medical_profiles(id) ON DELETE CASCADE,
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_type TEXT NOT NULL DEFAULT 'Unknown Device',
    browser TEXT NOT NULL DEFAULT 'Unknown Browser',
    access_status TEXT NOT NULL CHECK (access_status IN ('success', 'revoked_attempt', 'invalid_token'))
);

-- 6. Notifications (Demonstration simulated notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.medical_profiles(id) ON DELETE CASCADE,
    access_log_id UUID REFERENCES public.access_logs(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL DEFAULT 'SIMULATED',
    recipient TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'SENT',
    error_message TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & security
CREATE INDEX IF NOT EXISTS idx_qr_tokens_hash ON public.qr_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_profile_status ON public.qr_tokens(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_medical_profiles_user ON public.medical_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_profile ON public.access_logs(profile_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can view & update their own record
CREATE POLICY "Users can manage own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

-- Medical Profiles: Users can manage their own medical profile
CREATE POLICY "Users can manage own medical profile"
    ON public.medical_profiles FOR ALL
    USING (auth.uid() = user_id);

-- Visibility: Users can manage visibility of their own profile
CREATE POLICY "Users can manage own visibility settings"
    ON public.emergency_visibility FOR ALL
    USING (profile_id IN (SELECT id FROM public.medical_profiles WHERE user_id = auth.uid()));

-- QR Tokens: Users can view and manage their own QR tokens
CREATE POLICY "Users can manage own qr tokens"
    ON public.qr_tokens FOR ALL
    USING (profile_id IN (SELECT id FROM public.medical_profiles WHERE user_id = auth.uid()));

-- Access Logs: Profile owners can view their access logs
CREATE POLICY "Users can view own access logs"
    ON public.access_logs FOR SELECT
    USING (profile_id IN (SELECT id FROM public.medical_profiles WHERE user_id = auth.uid()));

-- Notifications: Profile owners can view and update their notifications
CREATE POLICY "Users can view and manage own notifications"
    ON public.notifications FOR ALL
    USING (profile_id IN (SELECT id FROM public.medical_profiles WHERE user_id = auth.uid()));

