// components/Screen.tsx
import React, { forwardRef, memo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;

  /** Active le scroll sur l’écran */
  scroll?: boolean;

  /** Espace en haut (ex: si header global est fixé sur le web) */
  extraTop?: number;

  /** Espace en bas (ex: pour une tab bar flottante) */
  extraBottom?: number;

  /** Padding horizontal par défaut */
  px?: number;

  /** Couleur de fond (défaut: #f8fafc) */
  backgroundColor?: string;

  /** Style externe pour le container (ScrollView ou View) */
  style?: StyleProp<ViewStyle>;

  /** Style appliqué au contentContainer (quand scroll = true) */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /** Props supplémentaires à passer au ScrollView */
  scrollProps?: Partial<ScrollViewProps>;
};

/**
 * Écran générique avec Safe Area, padding cohérent, gestion du clavier et option scroll.
 * - iOS: KeyboardAvoidingView 'padding' (soulève le contenu avec le clavier)
 * - Android: comportement par défaut (évite les glitches avec certaines vues)
 * - Web: insets = 0, mais extraTop/extraBottom restent appliqués
 */
const Screen = forwardRef<ScrollView, Props>(function Screen(
  {
    children,
    scroll = false,
    extraTop = 0,
    extraBottom = 0,
    px = 16,
    backgroundColor = '#f8fafc',
    style,
    contentContainerStyle,
    scrollProps,
  },
  ref
) {
  const insets = useSafeAreaInsets();

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: (insets?.top ?? 0) + extraTop,
    paddingBottom: (insets?.bottom ?? 0) + extraBottom,
  };

  // Contenu non scrollable : on garde un seul niveau de padding horizontal
  if (!scroll) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[baseStyle, style]}>
          <View style={{ flex: 1, paddingHorizontal: px }}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Contenu scrollable : padding horizontal sur le contentContainer
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        ref={ref}
        style={[baseStyle, style]}
        contentContainerStyle={[
          { paddingHorizontal: px, paddingBottom: 12, flexGrow: 1 },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

export default memo(Screen);
