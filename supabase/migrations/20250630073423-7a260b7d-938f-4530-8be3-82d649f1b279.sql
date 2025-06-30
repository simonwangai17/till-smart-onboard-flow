
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate the policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    public.get_current_user_role() = 'admin'
  );

-- Also fix the till_registrations policies that might have similar issues
DROP POLICY IF EXISTS "Admins can view all till registrations" ON public.till_registrations;
DROP POLICY IF EXISTS "Admins can update till registrations" ON public.till_registrations;

CREATE POLICY "Admins can view all till registrations" ON public.till_registrations
  FOR SELECT USING (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update till registrations" ON public.till_registrations
  FOR UPDATE USING (
    public.get_current_user_role() = 'admin'
  );
