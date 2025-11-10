// app/(tabs)/analysis.tsx
'use client';

import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { VictoryPie } from 'victory-native';
import Screen from '../../components/Screen';
import TopBar from '../../components/TopBar';
import TypeBadge from '../../components/TypeBadge';
import {
  classifyRobust,
  nextRepurchaseEtaDays,
  robustThresholdsFromData,
  thresholdsFromData
} from '../../lib/metrics';
import { useStore } from '../../lib/store';

type Code = 'LOYAL' | 'BROWSER' | 'SNIPER' | 'CHURN';
type ClassifyResult = { code: Code; label: string; desc: string };

const DEFAULT_INPUT = {
  visit_days: 6,
  avg_duration_min: 40,
  retained_june_august: false,
  retained_90: false,
};

const QUICK_PRESETS = [
  { name: 'Faible', visit_days: 2, avg_duration_min: 15 },
  { name: 'Moyen', visit_days: 6, avg_duration_min: 40 },
  { name: 'Élevé', visit_days: 12, avg_duration_min: 90 },
];

const RECO_BY_TYPE: Record<Code, string[]> = {
  LOYAL: ['리워드/멤버십 강화', 'VIP 전용 혜택', '추천/리뷰 유도'],
  BROWSER: ['장바구니 할인 쿠폰', '첫 구매 인센티브', '베스트셀러 추천'],
  SNIPER: ['재입고/한정 수량 알림', '번들 제안', '구매 주기 맞춤 리마인더'],
  CHURN: ['복귀 쿠폰', '이탈 이유 설문', '맞춤 콘텐츠/뉴스레터'],
};

export default function Analysis() {
  const { customers, loaded, loadMock } = useStore();

  // Seuils (moyenne pour compat + médiane pour robustesse)
  const thMean = useMemo(() => thresholdsFromData(customers || []), [customers]);
  const thRobust = useMemo(() => robustThresholdsFromData(customers || []), [customers]);

  // Form inputs
  const [input, setInput] = useState({ ...DEFAULT_INPUT });

  // Parsing sûr
  const toNumber = (t: string) => {
    const n = Number((t || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // Classification (robuste) + ETA (avec seuils robustes)
  const robust = classifyRobust({ ...input }, customers || []);
  // Pour compatibilité avec ton TypeBadge + textes existants
  const result: ClassifyResult = { code: robust.code, label: robust.label, desc: robust.desc };
  const eta = nextRepurchaseEtaDays(input, thRobust);

  // Distribution globale (camembert)
  const dist = useMemo(() => {
    const map: Record<Code, number> = { LOYAL: 0, BROWSER: 0, SNIPER: 0, CHURN: 0 };
    (customers || []).forEach((c: any) => {
      const r = classifyRobust(c, customers || []);
      map[r.code] += 1;
    });
    return [
      { x: '충성형', y: map.LOYAL },
      { x: '눈팅형', y: map.BROWSER },
      { x: '기습형', y: map.SNIPER },
      { x: '이탈형', y: map.CHURN },
    ];
  }, [customers]);

  const empty = !customers || customers.length === 0;
  const resetInputs = () => setInput({ ...DEFAULT_INPUT });

  if (!loaded) {
    return (
      <Screen>
        <TopBar title="유형 분석" />
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>데이터 로딩 중…</Text>
        </View>
      </Screen>
    );
  }

  return (
    // marge bas pour ne pas être sous la FloatingBar
    <Screen scroll extraBottom={90}>
      <TopBar title="유형 분석" />

      <ScrollView style={{ paddingHorizontal: 0 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.h2}>입력값 → 유형</Text>

        {/* Champs numériques */}
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="출석일수"
            value={String(input.visit_days)}
            onChangeText={(t) => setInput((p) => ({ ...p, visit_days: toNumber(t) }))}
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="체류시간(분)"
            value={String(input.avg_duration_min)}
            onChangeText={(t) => setInput((p) => ({ ...p, avg_duration_min: toNumber(t) }))}
          />
        </View>

        {/* Switch booléens */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>6~8월 재구매</Text>
            <Text style={styles.switchHelp}>여름 시즌에 재구매 여부</Text>
          </View>
          <Switch
            value={input.retained_june_august}
            onValueChange={(v) => setInput((p) => ({ ...p, retained_june_august: v }))}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>90일내 재구매</Text>
            <Text style={styles.switchHelp}>최근 90일 내 재구매 여부</Text>
          </View>
          <Switch
            value={input.retained_90}
            onValueChange={(v) => setInput((p) => ({ ...p, retained_90: v }))}
          />
        </View>

        {/* Presets rapides */}
        <View style={styles.presetsRow}>
          {QUICK_PRESETS.map((p) => (
            <Pressable
              key={p.name}
              onPress={() =>
                setInput((prev) => ({
                  ...prev,
                  visit_days: p.visit_days,
                  avg_duration_min: p.avg_duration_min,
                }))
              }
              style={({ pressed }) => [styles.presetBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.presetText}>{p.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Résumé + actions */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.h3}>요약</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={resetInputs}
                accessibilityRole="button"
                style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.resetText}>초기화</Text>
              </Pressable>

              <Pressable
                onPress={loadMock}
                accessibilityRole="button"
                style={({ pressed }) => [styles.fillBtn, pressed && { opacity: 0.95 }]}
              >
                <Text style={styles.fillText}>예시 채우기</Text>
              </Pressable>
            </View>
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipKey}>출석일수</Text>
              <Text style={styles.chipVal}>{input.visit_days}일</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipKey}>체류시간</Text>
              <Text style={styles.chipVal}>{input.avg_duration_min}분</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipKey}>6~8월 재구매</Text>
              <Text style={[styles.chipVal, input.retained_june_august ? styles.ok : styles.no]}>
                {input.retained_june_august ? '예' : '아니오'}
              </Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipKey}>90일내 재구매</Text>
              <Text style={[styles.chipVal, input.retained_90 ? styles.ok : styles.no]}>
                {input.retained_90 ? '예' : '아니오'}
              </Text>
            </View>
          </View>
        </View>

        {/* Résultat typologie */}
        <View style={styles.card}>
          <Text style={styles.h3}>결과</Text>
          {/* TypeBadge: garde ton API (type + label) */}
          <TypeBadge type={result.code} label={`당신은 ${result.label} 고객입니다!`} />
          {!!result.desc && <Text style={{ marginTop: 8, color: '#475569' }}>{result.desc}</Text>}
          {/* Explication robuste (facultatif, utile pour démo) */}
          {!!robust?.why && (
            <Text style={{ marginTop: 6, color: '#64748b' }}>
              근거: {robust.why}
            </Text>
          )}
          <Text style={{ marginTop: 6, fontWeight: '600' }}>다음 재구매 예상: {eta}일 내</Text>
        </View>

        {/* Recos par type */}
        <View style={styles.card}>
          <Text style={styles.h3}>추천 액션</Text>
          {RECO_BY_TYPE[result.code].map((t) => (
            <Text key={t} style={styles.recoItem}>• {t}</Text>
          ))}
        </View>

        {/* Global pie */}
        <Text style={[styles.h2, { marginTop: 16 }]}>전체 고객 분포</Text>
        <View style={styles.pieCard}>
          {empty ? (
            <Text style={{ color: '#64748b' }}>데이터가 없습니다.</Text>
          ) : (
            <VictoryPie
              data={dist}
              innerRadius={60}
              padAngle={2}
              labels={({ datum }) => `${datum.x} ${datum.y}`}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { color: '#64748b' },

  h2: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  h3: { fontSize: 15, fontWeight: '700' },

  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
  },
  switchLabel: { fontWeight: '700', color: '#0f172a' },
  switchHelp: { color: '#64748b', fontSize: 12, marginTop: 2 },

  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
  },
  presetText: { fontWeight: '700', color: '#3730a3', fontSize: 12 },

  summaryCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f1f5f9',
  },
  resetText: { fontWeight: '700', color: '#0f172a', fontSize: 12 },

  fillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
  },
  fillText: { fontWeight: '700', color: '#3730a3', fontSize: 12 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  chipKey: { fontSize: 11, color: '#64748b' },
  chipVal: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  ok: { color: '#166534' },
  no: { color: '#7f1d1d' },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  recoItem: { color: '#334155', marginTop: 6 },

  pieCard: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
