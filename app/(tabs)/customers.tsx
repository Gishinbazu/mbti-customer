import { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import EmptyState from '../../components/EmptyState';
import TopBar from '../../components/TopBar';
import { useStore } from '../../lib/store';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, loaded } = useStore();
  const [query, setQuery] = useState('');
  const [editTarget, setEditTarget] = useState(null);

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

  // shared value pour l’animation du sheet
  const sheetProgress = useSharedValue(0); // 0 = fermé, 1 = ouvert

  const filtered = useMemo(() => {
    if (!query) return customers;
    const q = query.toLowerCase();
    return customers.filter((c) => `${c.name}`.toLowerCase().includes(q));
  }, [customers, query]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addCustomer(form);
    setForm((prev) => ({ ...prev, name: '' }));
  };

  const openSheet = (customer) => {
    setEditTarget(customer);
    sheetProgress.value = withTiming(1, { duration: 200 });
  };

  const closeSheet = () => {
    sheetProgress.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setEditTarget)(null);
      }
    });
  };

  return (
    <View style={styles.container}>
      <TopBar title="고객 관리" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Formulaire d’ajout */}
        <View style={styles.card}>
          <Text style={styles.title}>고객 추가</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="이름"
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
            <TextInput
              placeholder="지역"
              style={styles.input}
              value={form.region}
              onChangeText={(t) => setForm({ ...form, region: t })}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              placeholder="연령대"
              style={styles.input}
              value={form.age_group}
              onChangeText={(t) => setForm({ ...form, age_group: t })}
            />
            <TextInput
              placeholder="출석일수"
              keyboardType="numeric"
              style={styles.input}
              value={String(form.visit_days)}
              onChangeText={(t) => setForm({ ...form, visit_days: Number(t) || 0 })}
            />
          </View>
          <TouchableOpacity style={styles.primary} onPress={handleAdd}>
            <Text style={styles.primaryText}>추가</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.title}>검색</Text>
          <TextInput
            placeholder="이름 검색"
            style={styles.input}
            value={query}
            onChangeText={setQuery}
          />
          <Text style={styles.helper}>
            총 {filtered.length}명 / 전체 {customers.length}명
          </Text>
        </View>

        {/* Liste clients */}
        <View style={{ marginTop: 16 }}>
          {!filtered.length ? (
            <EmptyState />
          ) : (
            filtered.map((c) => (
              <View key={c.id} style={styles.customerCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.customerName}>{c.name}</Text>
                    <Text style={styles.customerMeta}>
                      {c.region} · {c.age_group}
                    </Text>
                  </View>
                </View>
                <Text style={styles.customerStats}>
                  출석 {c.visit_days}일 · 체류 {c.avg_duration_min}분 · 결제 {c.payment_amount}
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.secondary}
                    onPress={() => openSheet(c)}
                  >
                    <Text style={styles.secondaryText}>편집</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCustomer(c.id)}>
                    <Text style={styles.deleteText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Sheet animé */}
      {editTarget ? (
        <>
          <AnimatedOverlay progress={sheetProgress} onPress={closeSheet} />
          <EditSheet
            customer={editTarget}
            onChange={(data) => setEditTarget(data)}
            onSave={(data) => {
              updateCustomer(data.id, data);
              closeSheet();
            }}
            onClose={closeSheet}
            progress={sheetProgress}
          />
        </>
      ) : null}
    </View>
  );
}

/* --- Overlay animé --- */
function AnimatedOverlay({ progress, onPress }) {
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(progress.value, { duration: 150 }),
    };
  });

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onPress} />
    </Animated.View>
  );
}

/* --- Bottom Sheet animé + drag --- */
function EditSheet({ customer, onChange, onSave, onClose, progress }) {
  const translateY = useSharedValue(0);

  // quand on ouvre -> on le met en bas puis on l’anime
  // mais ici on se base surtout sur progress

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY > 0 ? e.translationY : 0;
    })
    .onEnd((e) => {
      if (e.translationY > 120) {
        // fermer
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, { duration: 150 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => {
    const baseTranslate = interpolate(
      progress.value,
      [0, 1],
      [SCREEN_HEIGHT, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        {
          translateY: baseTranslate + translateY.value,
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>고객 정보 수정</Text>

        <TextInput
          style={styles.sheetInput}
          value={customer.name}
          onChangeText={(t) => onChange({ ...customer, name: t })}
          placeholder="이름"
        />
        <TextInput
          style={styles.sheetInput}
          value={customer.region}
          onChangeText={(t) => onChange({ ...customer, region: t })}
          placeholder="지역"
        />
        <TextInput
          style={styles.sheetInput}
          value={String(customer.visit_days || 0)}
          onChangeText={(t) => onChange({ ...customer, visit_days: Number(t) || 0 })}
          placeholder="출석일수"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.sheetInput}
          value={String(customer.avg_duration_min || 0)}
          onChangeText={(t) => onChange({ ...customer, avg_duration_min: Number(t) || 0 })}
          placeholder="체류시간(분)"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(customer)}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>닫기</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#0f172a' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
  },
  primary: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  helper: { marginTop: 6, fontSize: 12, color: '#94a3b8' },

  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  customerName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  customerMeta: { color: '#94a3b8', marginTop: 2 },
  customerStats: { color: '#475569', marginTop: 8, fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  secondary: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryText: { color: '#0f172a', fontWeight: '500' },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: { color: '#fff', fontWeight: '600' },

  // overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },

  // sheet animé
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sheetInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveText: { color: '#fff', fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: { color: '#0f172a', fontWeight: '600' },
});
