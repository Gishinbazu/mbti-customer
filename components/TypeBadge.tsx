// components/TypeBadge.tsx
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { Code } from '../lib/metrics';

type Props = {
  type: Code;                // 'LOYAL' | 'BROWSER' | 'SNIPER' | 'CHURN'
  label?: string;            // Texte à afficher (ex: "당신은 충성형 고객입니다!")
  compact?: boolean;         // Si true, badge plus petit
  style?: ViewStyle;         // Styles externes supplémentaires
  onPress?: () => void;      // Optionnel: action au clic
};

export const getTypeMeta = (code: Code) => {
  switch (code) {
    case 'LOYAL':
      return { color: '#2563eb', text: '충성형 / Loyal' };
    case 'BROWSER':
      return { color: '#eab308', text: '눈팅형 / Browser' };
    case 'SNIPER':
      return { color: '#22c55e', text: '기습형 / Sniper' };
    case 'CHURN':
    default:
      return { color: '#ef4444', text: '이탈형 / Churn' };
  }
};

function TypeBadgeBase({ type, label, compact, style, onPress }: Props) {
  const meta = getTypeMeta(type);
  const content = label ?? meta.text;

  const badge = (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.color, paddingVertical: compact ? 4 : 6, paddingHorizontal: compact ? 8 : 12 },
        style,
      ]}
      accessible
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={content}
    >
      <Text style={[styles.text, compact && { fontSize: 12 }]} numberOfLines={1}>
        {content}
      </Text>
    </View>
  );

  if (!onPress) return badge;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      {badge}
    </Pressable>
  );
}

export default memo(TypeBadgeBase);

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
    // Petite ombre douce (iOS/Android/Web)
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
