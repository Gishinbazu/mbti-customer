import { StyleSheet, Text, View } from 'react-native';

export default function KpiCard({ title, value, suffix }: { title: string; value: string | number; suffix?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>
        {value}
        {suffix ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  title: { fontSize: 14, color: '#666', marginBottom: 6 },
  value: { fontSize: 22, fontWeight: '700' },
});
