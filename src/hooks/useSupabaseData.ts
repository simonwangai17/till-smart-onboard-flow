
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [tillRegistrations, setTillRegistrations] = useState([]);
  const [airtimePurchases, setAirtimePurchases] = useState([]);
  const [bundlePurchases, setBundlePurchases] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTillRegistrations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('till_registrations')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTillRegistrations(data);
    }
  };

  const fetchWalletBalance = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .rpc('get_wallet_balance', { user_id: user.id });
    
    if (!error && data !== null) {
      setWalletBalance(Number(data));
    }
  };

  const fetchAirtimePurchases = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('airtime_purchases')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAirtimePurchases(data);
    }
  };

  const fetchBundlePurchases = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bundle_purchases')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setBundlePurchases(data);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchTillRegistrations(),
        fetchWalletBalance(),
        fetchAirtimePurchases(),
        fetchBundlePurchases()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const submitTillRegistration = async (formData: any) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('till_registrations')
      .insert([{
        ...formData,
        agent_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    // Add earning transaction
    await supabase
      .from('wallet_transactions')
      .insert([{
        agent_id: user.id,
        transaction_type: 'earning',
        amount: 100,
        description: 'Till registration commission',
        reference_id: data.id,
        reference_type: 'till_registration'
      }]);

    await fetchTillRegistrations();
    await fetchWalletBalance();
    
    return data;
  };

  const purchaseAirtime = async (purchaseData: any) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('airtime_purchases')
      .insert([{
        ...purchaseData,
        agent_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    // Add expense transaction
    await supabase
      .from('wallet_transactions')
      .insert([{
        agent_id: user.id,
        transaction_type: 'expense',
        amount: purchaseData.amount,
        description: `Airtime purchase for ${purchaseData.phone_number}`,
        reference_id: data.id,
        reference_type: 'airtime_purchase'
      }]);

    await fetchAirtimePurchases();
    await fetchWalletBalance();
    
    return data;
  };

  const purchaseBundle = async (purchaseData: any) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bundle_purchases')
      .insert([{
        ...purchaseData,
        agent_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    // Add expense transaction
    await supabase
      .from('wallet_transactions')
      .insert([{
        agent_id: user.id,
        transaction_type: 'expense',
        amount: purchaseData.amount,
        description: `${purchaseData.bundle_name} bundle for ${purchaseData.phone_number}`,
        reference_id: data.id,
        reference_type: 'bundle_purchase'
      }]);

    await fetchBundlePurchases();
    await fetchWalletBalance();
    
    return data;
  };

  return {
    tillRegistrations,
    airtimePurchases,
    bundlePurchases,
    walletBalance,
    loading,
    submitTillRegistration,
    purchaseAirtime,
    purchaseBundle,
    refetch: () => {
      fetchTillRegistrations();
      fetchWalletBalance();
      fetchAirtimePurchases();
      fetchBundlePurchases();
    }
  };
};
