import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import mockData from '../assets/data/mockCustomers.json';

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
  loadMock: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const MOCK_CUSTOMERS = mockData as unknown as Customer[];

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('customers');
        setCustomers(raw ? JSON.parse(raw) : MOCK_CUSTOMERS);
      } catch {
        setCustomers(MOCK_CUSTOMERS);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem('customers', JSON.stringify(customers)).catch(() => {});
    }, 300);
    return () => clearTimeout(id);
  }, [customers, loaded]);

  const addCustomer = useCallback((c: Partial<Customer>) => {
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
      },
      ...prev,
    ]);
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const loadMock = useCallback(() => {
    setCustomers(MOCK_CUSTOMERS);
    AsyncStorage.setItem('customers', JSON.stringify(MOCK_CUSTOMERS)).catch(() => {});
  }, [MOCK_CUSTOMERS]);

  if (!loaded) return null;

  return (
    <StoreCtx.Provider value={{ customers, loaded, addCustomer, updateCustomer, deleteCustomer, loadMock }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('Store not mounted');
  return v;
}
