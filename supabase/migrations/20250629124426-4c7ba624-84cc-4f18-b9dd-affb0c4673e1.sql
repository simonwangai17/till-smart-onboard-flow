
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create till registrations table
CREATE TABLE public.till_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  id_number TEXT NOT NULL,
  till_number TEXT NOT NULL,
  store_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create airtime purchases table
CREATE TABLE public.airtime_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bundle purchases table
CREATE TABLE public.bundle_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  bundle_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earning', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID, -- Can reference till_registrations, airtime_purchases, or bundle_purchases
  reference_type TEXT CHECK (reference_type IN ('till_registration', 'airtime_purchase', 'bundle_purchase')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.till_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airtime_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for till registrations
CREATE POLICY "Agents can view their own till registrations" ON public.till_registrations
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Agents can insert their own till registrations" ON public.till_registrations
  FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Admins can view all till registrations" ON public.till_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update till registrations" ON public.till_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for airtime purchases
CREATE POLICY "Agents can view their own airtime purchases" ON public.airtime_purchases
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Agents can insert their own airtime purchases" ON public.airtime_purchases
  FOR INSERT WITH CHECK (agent_id = auth.uid());

-- Create RLS policies for bundle purchases
CREATE POLICY "Agents can view their own bundle purchases" ON public.bundle_purchases
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Agents can insert their own bundle purchases" ON public.bundle_purchases
  FOR INSERT WITH CHECK (agent_id = auth.uid());

-- Create RLS policies for wallet transactions
CREATE POLICY "Agents can view their own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Agents can insert their own wallet transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (agent_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_id', 'USER' || EXTRACT(EPOCH FROM NOW())::TEXT),
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate wallet balance
CREATE OR REPLACE FUNCTION public.get_wallet_balance(user_id UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(
      CASE 
        WHEN transaction_type = 'earning' THEN amount
        WHEN transaction_type = 'expense' THEN -amount
        ELSE 0
      END
    ) FROM public.wallet_transactions WHERE agent_id = user_id),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
