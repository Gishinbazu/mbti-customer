// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

type Dest = '/(public)/welcome' | '/(tabs)/home';

function normalizeFlag(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  const s = v.trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

// Empêche le splash de disparaître avant qu’on décide où aller
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const [dest, setDest] = useState<Dest | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      // 1) Web: décider immédiatement via localStorage si possible
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const webV = window.localStorage?.getItem('onboarded');
          if (webV != null) {
            if (!alive) return;
            setDest(normalizeFlag(webV) ? '/(tabs)/home' : '/(public)/welcome');
            return; // Pas besoin d’attendre AsyncStorage
          }
        } catch {
          // ignore
        }
      }

      // 2) Fallback: AsyncStorage (mobile + web si rien en localStorage)
      try {
        const v = await AsyncStorage.getItem('onboarded');
        if (!alive) return;
        setDest(normalizeFlag(v) ? '/(tabs)/home' : '/(public)/welcome');
      } catch {
        if (!alive) return;
        setDest('/(public)/welcome');
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Cacher le splash quand la destination est connue
  useEffect(() => {
    if (dest !== null) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [dest]);

  // Écran neutre pendant la décision (dev/web)
  if (dest === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={dest as Href} />;
}
