
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('wallet-balance');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('wallet-balance', balance.toString());
  }, [balance]);

  const addToBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const deductFromBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <WalletContext.Provider value={{ balance, addToBalance, deductFromBalance }}>
      {children}
    </WalletContext.Provider>
  );
};
