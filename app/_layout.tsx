// app/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GlobalFooter from '../components/GlobalFooter';
import GlobalHeader from '../components/GlobalHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import { StoreProvider } from '../lib/store';

export default function RootLayout() {
  const pathname = usePathname();

  // La welcome est sous le groupe (public)
  const isWelcome = pathname === '/(public)/welcome';
  const inTabs = pathname.startsWith('/(tabs)');

  // Chrome (header/footer/spacer) masqué sur welcome et sur toutes les tabs
  const showChrome = !isWelcome && !inTabs;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          {showChrome && <GlobalHeader />}
          {showChrome && <HeaderSpacer />}

          <Stack initialRouteName="(public)" screenOptions={{ headerShown: false }}>
            {/* Groupe public (contient welcome) */}
            <Stack.Screen name="(public)" />
            {/* 👉 On n’enregistre (tabs) que si on y est déjà, pour éviter toute frame de flash */}
            {inTabs && <Stack.Screen name="(tabs)" />}
          </Stack>

          {showChrome && <GlobalFooter />}
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
