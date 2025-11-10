// components/TopBar.tsx
import { ArrowLeft } from 'lucide-react-native'; // ou tout autre icône, dispo via lucide-react-native
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  onBackPress?: () => void;      // pour afficher un bouton retour
  rightLabel?: string;           // texte bouton droit
  onRightPress?: () => void;     // action bouton droit
  center?: boolean;              // centre le titre
  style?: ViewStyle;
};

export default function TopBar({
  title,
  onBackPress,
  rightLabel,
  onRightPress,
  center = false,
  style,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: (insets.top ?? 0) + 6, shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.15 },
        style,
      ]}
    >
      <View style={styles.inner}>
        {/* Bouton retour gauche */}
        {onBackPress ? (
          <Pressable
            onPress={onBackPress}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <ArrowLeft size={22} color="#0f172a" />
          </Pressable>
        ) : (
          <View style={{ width: 32 }} /> // espace réservé
        )}

        {/* Titre */}
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            center && { textAlign: 'center', flex: 1 },
          ]}
        >
          {title}
        </Text>

        {/* Bouton droit (texte ou rien) */}
        {rightLabel ? (
          <Pressable
            onPress={onRightPress}
            hitSlop={12}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 32 }} /> // espace réservé
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    elevation: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: '#2563eb',
  },
});
