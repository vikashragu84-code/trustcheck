-- ============================================================================
-- TRUSTCHECK SUPABASE DATABASE SECURITY FIXES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FIX 1: ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR PUBLIC.PROFILES
-- ----------------------------------------------------------------------------

-- Ensure SELECT policy exists for users to read their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile" 
      ON public.profiles FOR SELECT 
      USING (auth.uid() = id);
  END IF;
END $$;

-- Ensure UPDATE policy exists for users to update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" 
      ON public.profiles FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR PUBLIC.SCANS
-- ----------------------------------------------------------------------------

-- Ensure SELECT policy exists for scans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scans' AND policyname = 'Users can read own scans'
  ) THEN
    CREATE POLICY "Users can read own scans" 
      ON public.scans FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure INSERT policy exists with strict WITH CHECK (auth.uid() = user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scans' AND policyname = 'Users can insert own scans'
  ) THEN
    CREATE POLICY "Users can insert own scans" 
      ON public.scans FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure DELETE policy exists for scans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scans' AND policyname = 'Users can delete own scans'
  ) THEN
    CREATE POLICY "Users can delete own scans" 
      ON public.scans FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- FIX 2: PROTECT profiles.plan FROM CLIENT-SIDE SELF-UPGRADE
-- ----------------------------------------------------------------------------

-- Create trigger function that rejects plan modification unless executed by service_role/admin
CREATE OR REPLACE FUNCTION public.prevent_plan_self_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    -- Allow plan changes ONLY if performed by the trusted backend service_role / superuser
    IF current_setting('role', true) <> 'service_role' AND current_setting('role', true) <> 'postgres' THEN
      RAISE EXCEPTION 'Unauthorized: Account plan can only be modified via verified server processing.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if already exists to prevent duplicate triggers
DROP TRIGGER IF EXISTS enforce_profile_plan_protection ON public.profiles;

-- Create BEFORE UPDATE trigger on public.profiles
CREATE TRIGGER enforce_profile_plan_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_plan_self_update();

-- ----------------------------------------------------------------------------
-- FIX 3: HARDEN handle_new_user() TRIGGER FUNCTION
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free', -- ALWAYS hardcode new registrations to 'free' plan (ignore user signup metadata)
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure auth.users trigger exists safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
