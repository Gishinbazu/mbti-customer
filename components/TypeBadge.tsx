import { StyleSheet, Text, View } from 'react-native';

const COLORS: Record<string, string> = {
  LOYAL: '#22c55e',
  BROWSER: '#3b82f6',
  SNIPER: '#f59e0b',
  CHURN: '#ef4444',
};

export default function TypeBadge({ type, label }: { type: string; label?: string }) {
  const bg = COLORS[type] || '#64748b';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label || type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  text: { color: '#fff', fontWeight: '700' },
});
