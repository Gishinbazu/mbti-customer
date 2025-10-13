import { useMemo, useState } from 'react';
import { Button, Share as RNShare, ScrollView, StyleSheet, Text, View } from 'react-native';
import TopBar from '../../components/TopBar';
import TypeBadge from '../../components/TypeBadge';
import { classify, thresholdsFromData } from '../../lib/slassifier';
import { useStore } from '../../lib/store';

export default function Share() {
  const { customers, loaded } = useStore();
  const th = useMemo(() => thresholdsFromData(customers), [customers]);
  const [idx, setIdx] = useState(0);

  if (!loaded) return <View />;

  const user = customers[idx % customers.length];
  const type = classify(user, th);
  const cardText = `나는 ${user.name} · ${type.label} (${type.code})`;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar title="공유" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.name}>{user.name}</Text>
          <TypeBadge type={type.code} label={type.label} />
          <Text style={{ marginTop: 6, color: '#475569' }}>
            {user.region} · {user.age_group}
          </Text>
          <Text style={{ marginTop: 6 }}>
            출석 {user.visit_days}일 · 체류 {user.avg_duration_min}분
          </Text>
        </View>
        <Button title="다음 유저" onPress={() => setIdx(idx + 1)} />
        <View style={{ height: 12 }} />
        <Button title="SNS 공유" onPress={() => RNShare.share({ message: cardText })} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, alignItems: 'flex-start', gap: 6 },
  name: { fontSize: 18, fontWeight: '800' },
});
