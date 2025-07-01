
-- Create a table for payments to registered tills
CREATE TABLE public.till_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.profiles(id),
  till_number TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure agents can only see their own payments
ALTER TABLE public.till_payments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows agents to SELECT their own payments
CREATE POLICY "Agents can view their own payments" 
  ON public.till_payments 
  FOR SELECT 
  USING (agent_id = auth.uid());

-- Create policy that allows agents to INSERT their own payments
CREATE POLICY "Agents can create their own payments" 
  ON public.till_payments 
  FOR INSERT 
  WITH CHECK (agent_id = auth.uid());

-- Create policy that allows agents to UPDATE their own payments
CREATE POLICY "Agents can update their own payments" 
  ON public.till_payments 
  FOR UPDATE 
  USING (agent_id = auth.uid());

-- Create policy that allows agents to DELETE their own payments
CREATE POLICY "Agents can delete their own payments" 
  ON public.till_payments 
  FOR DELETE 
  USING (agent_id = auth.uid());

-- Create index for better performance when querying by agent_id and till_number
CREATE INDEX idx_till_payments_agent_id ON public.till_payments(agent_id);
CREATE INDEX idx_till_payments_till_number ON public.till_payments(till_number);
