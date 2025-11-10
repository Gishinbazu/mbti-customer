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
  thresholdsFromData,
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

  // seuils (tu peux les garder même si tu n'utilises pas thMean)
  const thMean = useMemo(() => thresholdsFromData(customers || []), [customers]);
  const thRobust = useMemo(() => robustThresholdsFromData(customers || []), [customers]);

  const [input, setInput] = useState({ ...DEFAULT_INPUT });

  const toNumber = (t: string) => {
    const n = Number((t || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // classification entrée
  const robust = classifyRobust({ ...input }, customers || []);
  const result: ClassifyResult = { code: robust.code, label: robust.label, desc: robust.desc };
  const eta = nextRepurchaseEtaDays(input, thRobust);

  // distribution globale
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

  // 🔥 KPIs dérivés (ajout retained90Ratio ici)
  const kpis = useMemo(() => {
    const total = customers?.length ?? 0;
    if (!customers || total === 0) {
      return {
        total,
        loyalRatio: 0,
        churnRatio: 0,
        retained90Ratio: 0,
      };
    }
    let loyal = 0;
    let churn = 0;
    let retained90 = 0;
    customers.forEach((c: any) => {
      const r = classifyRobust(c, customers);
      if (r.code === 'LOYAL') loyal += 1;
      if (r.code === 'CHURN') churn += 1;
      if (c.retained_90) retained90 += 1;
    });
    return {
      total,
      loyalRatio: Math.round((loyal / total) * 100),
      churnRatio: Math.round((churn / total) * 100),
      retained90Ratio: Math.round((retained90 / total) * 100),
    };
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
    <Screen scroll extraBottom={90} style={{ backgroundColor: '#eef2f7' }}>
      <TopBar title="유형 분석" />

      {/* KPI banner (scrollable pour 4 cartes) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.kpiScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        <View style={[styles.kpiCard, { backgroundColor: '#ffffff' }]}>
          <Text style={styles.kpiLabel}>총 고객수</Text>
          <Text style={styles.kpiValue}>{kpis.total}</Text>
          <Text style={styles.kpiHelp}>현재 스토어에 적재된 고객 수</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#ecfdf3', borderColor: '#bbf7d0' }]}>
          <Text style={styles.kpiLabel}>충성형 비율</Text>
          <Text style={styles.kpiValue}>{kpis.loyalRatio}%</Text>
          <Text style={styles.kpiHelp}>리워드/업셀 대상</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
          <Text style={styles.kpiLabel}>이탈 위험</Text>
          <Text style={[styles.kpiValue, { color: '#c05621' }]}>{kpis.churnRatio}%</Text>
          <Text style={styles.kpiHelp}>복귀 캠페인 우선 대상</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
          <Text style={styles.kpiLabel}>90일내 재구매</Text>
          <Text style={[styles.kpiValue, { color: '#1d4ed8' }]}>{kpis.retained90Ratio}%</Text>
          <Text style={styles.kpiHelp}>최근 3개월 내 재방문 고객</Text>
        </View>
      </ScrollView>

      {/* sous-titre */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>고객 행동 기반 MBTI 분석</Text>
        <Text style={styles.subHeaderDesc}>
          출석일수, 체류시간, 재구매 여부를 입력하면 고객 유형과 추천 액션이 자동으로 생성됩니다.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 14 }}>
        {/* 1. Input */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>1. 입력값</Text>
          <Text style={styles.sectionDesc}>실제 고객 데이터를 대입하거나 아래 프리셋을 눌러보세요.</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>출석일수</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(input.visit_days)}
                onChangeText={(t) => setInput((p) => ({ ...p, visit_days: toNumber(t) }))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>체류시간(분)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(input.avg_duration_min)}
                onChangeText={(t) => setInput((p) => ({ ...p, avg_duration_min: toNumber(t) }))}
              />
            </View>
          </View>

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

          <View style={styles.actionsRow}>
            <Pressable onPress={resetInputs} style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.9 }]}>
              <Text style={styles.resetText}>초기화</Text>
            </Pressable>
            <Pressable onPress={loadMock} style={({ pressed }) => [styles.fillBtn, pressed && { opacity: 0.9 }]}>
              <Text style={styles.fillText}>예시 데이터 불러오기</Text>
            </Pressable>
          </View>
        </View>

        {/* 2. Résultat */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>2. 분석 결과</Text>
          <Text style={styles.sectionDesc}>입력값을 기준으로 현재 고객의 행동 유형을 진단합니다.</Text>

          <TypeBadge type={result.code} label={`당신은 ${result.label} 고객입니다!`} />

          {!!result.desc && <Text style={styles.descText}>{result.desc}</Text>}

          {!!robust?.why && (
            <View style={styles.insightBox}>
              <Text style={styles.insightTitle}>분류 근거</Text>
              <Text style={styles.insightText}>{robust.why}</Text>
            </View>
          )}

          <View style={styles.etaBox}>
            <Text style={styles.etaLabel}>다음 재구매 예상 시점</Text>
            <Text style={styles.etaValue}>{eta}일 이내</Text>
            <Text style={styles.etaHelp}>이 시점에 맞춰 캠페인을 발송하면 효율이 높습니다.</Text>
          </View>
        </View>

        {/* 3. Recos */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>3. 추천 액션</Text>
          <Text style={styles.sectionDesc}>해당 유형 고객에게 가장 효과적인 캠페인 예시입니다.</Text>
          {RECO_BY_TYPE[result.code].map((t) => (
            <Text key={t} style={styles.recoItem}>
              • {t}
            </Text>
          ))}
        </View>

        {/* 4. Pie */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>4. 전체 고객 분포</Text>
          <Text style={styles.sectionDesc}>현재 보유 중인 고객이 어떤 유형에 많이 분포하는지 확인하세요.</Text>
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
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { color: '#64748b' },

  // KPI scrollable
  kpiScroll: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  kpiCard: {
    width: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  kpiLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  kpiHelp: { fontSize: 10, color: '#94a3b8', marginTop: 4 },

  subHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  subHeaderDesc: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  sectionDesc: { fontSize: 12, color: '#94a3b8' },

  row: { flexDirection: 'row', gap: 12, marginTop: 4 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchLabel: { fontWeight: '700', color: '#0f172a' },
  switchHelp: { color: '#94a3b8', fontSize: 11, marginTop: 2 },

  presetsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
  },
  presetText: { fontWeight: '700', color: '#3730a3', fontSize: 12 },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  resetBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  resetText: { fontWeight: '700', color: '#0f172a', fontSize: 12 },
  fillBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  fillText: { fontWeight: '700', color: '#3730a3', fontSize: 12 },

  descText: { marginTop: 6, color: '#475569', fontSize: 12, lineHeight: 18 },

  insightBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginTop: 6,
  },
  insightTitle: { fontWeight: '700', color: '#0f172a', marginBottom: 2, fontSize: 12 },
  insightText: { color: '#64748b', fontSize: 12 },

  etaBox: {
    marginTop: 8,
    backgroundColor: '#ecfdf3',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 10,
  },
  etaLabel: { fontSize: 11, color: '#166534', fontWeight: '600' },
  etaValue: { fontSize: 20, fontWeight: '800', color: '#166534', marginTop: 2 },
  etaHelp: { fontSize: 11, color: '#166534', marginTop: 3 },

  recoItem: { color: '#334155', marginTop: 4, fontSize: 12 },

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
