
-- Create a table for payouts/withdrawals
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  payment_number TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure agents can only see their own payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create policy that allows agents to SELECT their own payouts
CREATE POLICY "Agents can view their own payouts" 
  ON public.payouts 
  FOR SELECT 
  USING (agent_id = auth.uid());

-- Create policy that allows agents to INSERT their own payouts
CREATE POLICY "Agents can create their own payouts" 
  ON public.payouts 
  FOR INSERT 
  WITH CHECK (agent_id = auth.uid());

-- Create policy that allows admins to view all payouts
CREATE POLICY "Admins can view all payouts" 
  ON public.payouts 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

-- Create policy that allows admins to update payouts
CREATE POLICY "Admins can update payouts" 
  ON public.payouts 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

-- Create index for better performance when querying by agent_id
CREATE INDEX idx_payouts_agent_id ON public.payouts(agent_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
