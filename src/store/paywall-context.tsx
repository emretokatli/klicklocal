'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { PaywallModal } from '@/components/billing/PaywallModal';
import { setPaywallHandler, type PaywallReason } from '@/lib/paywall-bus';

type PaywallContextValue = {
  /** Open the central paywall modal, optionally tailoring the headline. */
  open: (reason?: PaywallReason) => void;
  close: () => void;
};

const PaywallContext = createContext<PaywallContextValue | null>(null);

/**
 * Holds the global paywall state and renders the single PaywallModal instance.
 * Registers an `open` handler on the module-level bus so the axios interceptor
 * can trigger the modal on any 402, from anywhere — no redirect, no token clear.
 */
export function PaywallProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<PaywallReason>('default');

  const open = useCallback((next?: PaywallReason) => {
    setReason(next ?? 'default');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  // Bridge the (React-less) api-client interceptor to this React state.
  useEffect(() => {
    setPaywallHandler((next) => open(next));
    return () => setPaywallHandler(null);
  }, [open]);

  const value = useMemo<PaywallContextValue>(
    () => ({ open, close }),
    [open, close],
  );

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <PaywallModal open={isOpen} reason={reason} onClose={close} />
    </PaywallContext.Provider>
  );
}

export function usePaywall(): PaywallContextValue {
  const ctx = useContext(PaywallContext);
  if (ctx === null) {
    throw new Error('usePaywall must be used within PaywallProvider');
  }
  return ctx;
}
