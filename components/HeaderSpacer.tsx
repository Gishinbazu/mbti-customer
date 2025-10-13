import { usePathname } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function HeaderSpacer() {
  const pathname = usePathname();
  const isTabs = pathname?.startsWith('/(tabs)');
  const isWelcome = pathname === '/welcome';

  // le header global n’est affiché que sur web large, hors tabs
  if (Platform.OS !== 'web' || isTabs || isWelcome) return null;

  // même hauteur que ton header fixe (GlobalHeader)
  return <View style={styles.spacer} />;
}

const styles = StyleSheet.create({
  spacer: {
    height: 80, // ajuste selon ton header (≈56px + marges)
    width: '100%',
  },
});
