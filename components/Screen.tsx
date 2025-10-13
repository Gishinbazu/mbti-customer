import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  /** active le scroll sur l’écran */
  scroll?: boolean;
  /** espace en haut (ex: si header global fixé sur le web) */
  extraTop?: number;
  /** espace en bas (ex: pour la floating bar) */
  extraBottom?: number;
  /** padding horizontal par défaut */
  px?: number;
};

export default function Screen({
  children,
  scroll = false,
  extraTop = 0,
  extraBottom = 0,
  px = 16,
}: Props) {
  const insets = useSafeAreaInsets();

  const styleBase = {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: insets.top + extraTop,
    paddingBottom: insets.bottom + extraBottom,
  } as const;

  const Container = scroll ? ScrollView : View;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Container
        style={styleBase as any}
        contentContainerStyle={scroll ? { paddingHorizontal: px, paddingBottom: 12 } : undefined}
      >
        {!scroll ? <View style={{ flex: 1, paddingHorizontal: px }}>{children}</View> : children}
      </Container>
    </KeyboardAvoidingView>
  );
}
