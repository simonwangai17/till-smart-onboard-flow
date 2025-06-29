
import React, { createContext, useContext } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface WalletContextType {
  balance: number;
  addToBalance: (amount: number) => void;
  deductFromBalance: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletBalance } = useSupabaseData();

  const addToBalance = (amount: number) => {
    // This is now handled by Supabase transactions
    console.log(`Adding ${amount} to balance`);
  };

  const deductFromBalance = (amount: number): boolean => {
    // This is now handled by Supabase transactions
    console.log(`Deducting ${amount} from balance`);
    return walletBalance >= amount;
  };

  return (
    <WalletContext.Provider value={{ balance: walletBalance, addToBalance, deductFromBalance }}>
      {children}
    </WalletContext.Provider>
  );
};
