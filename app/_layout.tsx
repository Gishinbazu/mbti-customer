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
  const isWelcome = pathname === '/welcome';

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          {/* Header global (se cache lui-même sur /(tabs) et mobile) */}
          {!isWelcome && <GlobalHeader />}

          {/* Espace sous le header fixe (web large, hors tabs) */}
          {!isWelcome && <HeaderSpacer />}

          {/* Navigation (welcome puis tabs) */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="(tabs)" />
          </Stack>

          {/* Footer global (se cache lui-même sur /(tabs) et mobile) */}
          {!isWelcome && <GlobalFooter />}
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
