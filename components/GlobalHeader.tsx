import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname } from 'expo-router';
import * as React from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function GlobalHeader() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // Cache sur mobile et sur toutes les routes sous /(tabs)
  const isTabsRoute = pathname?.startsWith('/(tabs)');
  const isNarrow = width < 1024; // web étroit => on cache
  const shouldHide = Platform.OS !== 'web' || isTabsRoute || isNarrow;

  if (shouldHide) return null;

  return (
    <View style={styles.wrap}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.row}>
        {/* Branding à gauche */}
        <View style={styles.brand}>
          <Feather name="aperture" size={18} color="#0f172a" />
          <Text style={styles.brandText}>MBTI Customer</Text>
        </View>

        {/* Actions à droite (exemples) */}
        <View style={styles.actions}>
          <Pressable style={styles.btn}>
            <Feather name="help-circle" size={16} color="#0f172a" />
            <Text style={styles.btnText}>Docs</Text>
          </Pressable>
          <Pressable style={styles.btn}>
            <Feather name="mail" size={16} color="#0f172a" />
            <Text style={styles.btnText}>Contact</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'fixed', // RN Web ok
    top: 12,
    left: 12,
    right: 12,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    zIndex: 100,
    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  row: {
    flex: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.06)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnText: { color: '#0f172a', fontWeight: '700', fontSize: 12 },
});
