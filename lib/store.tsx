import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import mock from '../assets/data/mockCustomers.json';

export type Customer = {
  id: string;
  name: string;
  region: string;
  age_group: string;
  month: string;
  visit_days: number;
  avg_duration_min: number;
  retained_june_august: boolean;
  retained_90: boolean;
  payment_amount: number;
};

type Ctx = {
  customers: Customer[];
  loaded: boolean;
  addCustomer: (c: Partial<Customer>) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // ✅ ajoute ceci
  loadMock: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('customers');
        if (raw) setCustomers(JSON.parse(raw));
        else setCustomers(mock as any);
      } catch (_) {
        setCustomers(mock as any);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('customers', JSON.stringify(customers));
  }, [customers, loaded]);

  const addCustomer = (c: Partial<Customer>) =>
    setCustomers((prev) => [
      {
        id: Date.now().toString(),
        name: 'New',
        region: '서울',
        age_group: '20s',
        month: '2025-08',
        visit_days: 0,
        avg_duration_min: 0,
        retained_june_august: false,
        retained_90: false,
        payment_amount: 0,
        ...c,
      } as Customer,
      ...prev,
    ]);

  const updateCustomer = (id: string, patch: Partial<Customer>) =>
    setCustomers((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const deleteCustomer = (id: string) =>
    setCustomers((prev) => prev.filter((v) => v.id !== id));

  // ✅ nouvelle action
  const loadMock = useCallback(() => {
    setCustomers((mock as unknown as Customer[]) || []);
    // on peut aussi persister tout de suite si tu veux :
    AsyncStorage.setItem('customers', JSON.stringify((mock as unknown as Customer[]) || [])).catch(() => {});
  }, []);

  return (
    <StoreCtx.Provider
      value={{
        customers,
        loaded,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        loadMock, // ✅ expose
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('Store not mounted');
  return v;
}
