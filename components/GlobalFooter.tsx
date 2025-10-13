import { usePathname } from 'expo-router';
import * as React from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function GlobalFooter() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // 1) Cache sur toutes les plateformes natives (iOS/Android)
  // 2) Cache sur le web si on est dans les tabs (/(tabs)/*) ou si l'écran est étroit
  const isTabsRoute = pathname?.startsWith('/(tabs)');
  const isNarrow = width < 1024;
  const shouldHide = Platform.OS !== 'web' || isTabsRoute || isNarrow;

  if (shouldHide) return null;

  // Visible seulement sur web large écran et hors des tabs (ex: pages marketing)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>© {new Date().getFullYear()} MBTI Customer · All rights reserved</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
});
