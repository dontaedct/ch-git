'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isEnabled, getEnvironment, getFlagsForEnvironment } from './flags';

interface FlagsContextType {
  isEnabled: (flag: string) => boolean;
  getEnvironment: () => string;
  getAllFlags: () => Record<string, boolean>;
  refreshFlags: () => void;
}

const FlagsContext = createContext<FlagsContextType | null>(null);

interface FlagsProviderProps {
  children: React.ReactNode;
  initialEnv?: string;
}

export function FlagsProvider({ children, initialEnv }: FlagsProviderProps) {
  const [currentEnv, setCurrentEnv] = useState<string>(initialEnv ?? getEnvironment());
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const refreshFlags = () => {
    const newEnv = getEnvironment();
    setCurrentEnv(newEnv);
    setFlags(getFlagsForEnvironment(newEnv));
  };

  useEffect(() => {
    refreshFlags();
    
    // Listen for environment changes (useful for Vercel preview deployments)
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'NEXT_PUBLIC_ENV' || e.key === 'VERCEL_ENV') {
          refreshFlags();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const contextValue: FlagsContextType = {
    isEnabled: (flag: string) => isEnabled(flag, { env: currentEnv }),
    getEnvironment: () => currentEnv,
    getAllFlags: () => flags,
    refreshFlags,
  };

  return (
    <FlagsContext.Provider value={contextValue}>
      {children}
    </FlagsContext.Provider>
  );
}

export function useFlags() {
  const context = useContext(FlagsContext);
  if (!context) {
    throw new Error('useFlags must be used within a FlagsProvider');
  }
  return context;
}

export function useFeatureFlag(flag: string): boolean {
  const { isEnabled } = useFlags();
  return isEnabled(flag);
}
