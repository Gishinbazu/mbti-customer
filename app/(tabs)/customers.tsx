import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EmptyState from '../../components/EmptyState';
import TopBar from '../../components/TopBar';
import { useStore } from '../../lib/store';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, loaded } = useStore();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return customers;
    const q = query.toLowerCase();
    return customers.filter((c) => `${c.name}`.toLowerCase().includes(q));
  }, [customers, query]);

  const [form, setForm] = useState({
    name: '',
    region: '서울',
    age_group: '20s',
    visit_days: 5,
    avg_duration_min: 30,
    payment_amount: 0,
    retained_june_august: false,
    retained_90: false,
  });

  if (!loaded) return <View />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar title="고객 관리" />
      <View style={{ padding: 16 }}>
        <Text style={styles.h2}>고객 추가</Text>
        <View style={styles.row}>
          <TextInput placeholder="이름" style={styles.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
          <TextInput placeholder="지역" style={styles.input} value={form.region} onChangeText={(t) => setForm({ ...form, region: t })} />
        </View>
        <View style={styles.row}>
          <TextInput placeholder="연령대" style={styles.input} value={form.age_group} onChangeText={(t) => setForm({ ...form, age_group: t })} />
          <TextInput
            placeholder="출석일수"
            keyboardType="numeric"
            style={styles.input}
            value={String(form.visit_days)}
            onChangeText={(t) => setForm({ ...form, visit_days: Number(t) || 0 })}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            placeholder="체류시간(분)"
            keyboardType="numeric"
            style={styles.input}
            value={String(form.avg_duration_min)}
            onChangeText={(t) => setForm({ ...form, avg_duration_min: Number(t) || 0 })}
          />
          <TextInput
            placeholder="결제금액"
            keyboardType="numeric"
            style={styles.input}
            value={String(form.payment_amount)}
            onChangeText={(t) => setForm({ ...form, payment_amount: Number(t) || 0 })}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.tag(form.retained_june_august)}
            onPress={() => setForm({ ...form, retained_june_august: !form.retained_june_august })}
          >
            <Text style={styles.tagText}>6~8월 재구매</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tag(form.retained_90)} onPress={() => setForm({ ...form, retained_90: !form.retained_90 })}>
            <Text style={styles.tagText}>90일내 재구매</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.primary}
          onPress={() => {
            addCustomer(form);
            setForm({ ...form, name: '' });
          }}
        >
          <Text style={styles.primaryText}>추가</Text>
        </TouchableOpacity>

        <Text style={[styles.h2, { marginTop: 16 }]}>검색</Text>
        <TextInput placeholder="이름 검색" style={styles.input} value={query} onChangeText={setQuery} />
      </View>

      <ScrollView style={{ padding: 16 }}>
        {!filtered.length ? (
          <EmptyState />
        ) : (
          filtered.map((c) => (
            <View key={c.id} style={styles.card}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.meta}>
                {c.region} · {c.age_group}
              </Text>
              <Text style={styles.meta}>
                출석 {c.visit_days}일 · 체류 {c.avg_duration_min}분 · 결제 {c.payment_amount}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity style={styles.secondary} onPress={() => updateCustomer(c.id, { visit_days: (c.visit_days || 0) + 1 })}>
                  <Text>출석+1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.warn} onPress={() => deleteCustomer(c.id)}>
                  <Text style={{ color: '#fff' }}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, height: 44 },
  primary: { backgroundColor: '#111827', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  warn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  tag: (active: boolean) => ({ backgroundColor: active ? '#111827' : '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }),
  tagText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 2 },
});
