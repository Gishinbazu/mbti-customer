// app/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import 'react-native-gesture-handler'; // 👈 important : tout en haut
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GlobalFooter from '../components/GlobalFooter';
import GlobalHeader from '../components/GlobalHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import { StoreProvider } from '../lib/store';

export default function RootLayout() {
  const pathname = usePathname();

  const isWelcome = pathname === '/(public)/welcome';
  const inTabs = pathname.startsWith('/(tabs)');
  const showChrome = !isWelcome && !inTabs;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {showChrome && <GlobalHeader />}
            {showChrome && <HeaderSpacer />}

            <Stack initialRouteName="(public)" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(public)" />
              {inTabs && <Stack.Screen name="(tabs)" />}
            </Stack>

            {showChrome && <GlobalFooter />}
          </View>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
