// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

type Dest = '/welcome' | '/(tabs)/home';

function normalizeFlag(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  const s = v.trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

export default function Index() {
  const [dest, setDest] = useState<Dest | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // 1) AsyncStorage (mobile + web)
        const v = await AsyncStorage.getItem('onboarded');

        // 2) Fallback localStorage (web uniquement)
        let webV: string | null = null;
        if (Platform.OS === 'web' && typeof window !== 'undefined' && 'localStorage' in window) {
          try {
            webV = window.localStorage.getItem('onboarded');
          } catch {
            // ignore
          }
        }

        const isOnboarded = normalizeFlag(v) || normalizeFlag(webV || '');
        if (!alive) return;
        setDest(isOnboarded ? '/(tabs)/home' : '/welcome');
      } catch {
        if (!alive) return;
        setDest('/welcome');
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Écran de boot minimal pendant la résolution
  if (dest === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={dest as Href} />;
}
