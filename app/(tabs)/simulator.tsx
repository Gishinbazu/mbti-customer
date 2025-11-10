// app/(tabs)/simulator.tsx
'use client';

import Slider from '@react-native-community/slider';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import Screen from '../../components/Screen';
import TopBar from '../../components/TopBar';
import TypeBadge from '../../components/TypeBadge';
// ⚠️ si ton fichier s'appelle classifier.ts, corrige l'import ici
import { classify, nextRepurchaseEtaDays, thresholdsFromData } from '../../lib/slassifier';
import { useStore } from '../../lib/store';

type Code = 'LOYAL' | 'BROWSER' | 'SNIPER' | 'CHURN';
type ClassifyResult = { code: Code; label: string; desc: string };

const QUICK_PRESETS = [
  { name: '낮음', visit_days: 2, avg_duration_min: 15 },
  { name: '보통', visit_days: 6, avg_duration_min: 40 },
  { name: '높음', visit_days: 12, avg_duration_min: 90 },
];

const RECO_BY_TYPE: Record<Code, string[]> = {
  LOYAL: ['리워드/멤버십 강화', 'VIP 전용 혜택', '추천/리뷰 유도'],
  BROWSER: ['장바구니 할인 쿠폰', '첫 구매 인센티브', '베스트셀러 추천'],
  SNIPER: ['재입고/한정 수량 알림', '번들 제안', '구매 주기 맞춤 리마인더'],
  CHURN: ['복귀 쿠폰', '이탈 이유 설문', '맞춤 콘텐츠/뉴스레터'],
};

// Historique type → graphique step
const TYPE_INDEX: Record<Code, number> = { CHURN: 0, SNIPER: 1, BROWSER: 2, LOYAL: 3 };

export default function Simulator() {
  const { customers } = useStore();
  const th = useMemo(() => thresholdsFromData(customers || []), [customers]);

  const [visit, setVisit] = useState(5);
  const [dur, setDur] = useState(30);
  const [retSummer, setRetSummer] = useState(false);
  const [ret90, setRet90] = useState(false);

  const sample = {
    visit_days: visit,
    avg_duration_min: dur,
    retained_june_august: retSummer,
    retained_90: ret90,
  };

  const result = classify(sample, th) as ClassifyResult;
  const eta = nextRepurchaseEtaDays(sample);

  // --- historique pour mini-charts ---
  type Pt = { x: number; y: number };
  const [etaSeries, setEtaSeries] = useState<Pt[]>([{ x: 0, y: eta }]);
  const [typeSeries, setTypeSeries] = useState<Pt[]>([{ x: 0, y: TYPE_INDEX[result.code] }]);
  const [tick, setTick] = useState(1);

  useEffect(() => {
    setEtaSeries((s) => {
      const next = [...s, { x: tick, y: eta }];
      return next.length > 40 ? next.slice(next.length - 40) : next;
    });
    setTypeSeries((s) => {
      const next = [...s, { x: tick, y: TYPE_INDEX[result.code] }];
      return next.length > 40 ? next.slice(next.length - 40) : next;
    });
    setTick((t) => t + 1);
  }, [visit, dur, retSummer, ret90, eta, result.code]);

  const applyPreset = (v: number, m: number) => {
    setVisit(v);
    setDur(m);
  };

  return (
    <Screen scroll extraBottom={110} style={{ backgroundColor: '#e2e8f0' }}>
      <TopBar title="시뮬레이터" />

      {/* en-tête résumé */}
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>고객 행동 가상 시뮬레이션</Text>
        <Text style={styles.headerSub}>
          방문일수, 체류시간, 재구매 여부를 조절해보면 고객 유형과 다음 구매 예상일(ETA)이 바로 업데이트됩니다.
        </Text>
      </View>

      {/* Presets */}
      <View style={styles.presetsRow}>
        {QUICK_PRESETS.map((p) => (
          <Pressable
            key={p.name}
            onPress={() => applyPreset(p.visit_days, p.avg_duration_min)}
            style={({ pressed }) => [styles.presetBtn, pressed && { opacity: 0.75 }]}
          >
            <Text style={styles.presetTitle}>{p.name}</Text>
            <Text style={styles.presetMeta}>
              {p.visit_days}j • {p.avg_duration_min}min
            </Text>
          </Pressable>
        ))}
      </View>

      {/* petit résumé KPI */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>예상 유형</Text>
          <Text style={styles.kpiValue}>{result.label}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ETA</Text>
          <Text style={styles.kpiValue}>{eta}일</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>방문일수</Text>
          <Text style={styles.kpiValue}>{visit}일</Text>
        </View>
      </View>

      {/* Sliders */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>입력 값 조절</Text>
        <View style={styles.sliderBlock}>
          <Text style={styles.h3}>
            출석일수 <Text style={styles.value}>{visit}일</Text>
          </Text>
          <Slider minimumValue={0} maximumValue={30} step={1} value={visit} onValueChange={setVisit} />
        </View>

        <View style={styles.sliderBlock}>
          <Text style={styles.h3}>
            체류시간(분) <Text style={styles.value}>{dur}분</Text>
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={240}
            step={5}
            value={dur}
            onValueChange={setDur}
          />
        </View>
      </View>

      {/* Switches */}
      <View style={styles.inlineRow}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>6~8월 재구매</Text>
            <Text style={styles.switchHelp}>여름 시즌에 재구매 여부</Text>
          </View>
          <Switch value={retSummer} onValueChange={setRetSummer} />
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>90일내 재구매</Text>
            <Text style={styles.switchHelp}>최근 90일 내 재구매 여부</Text>
          </View>
          <Switch value={ret90} onValueChange={setRet90} />
        </View>
      </View>

      {/* Résultat */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>예상 결과</Text>
        <TypeBadge type={result.code} label={`예상 유형: ${result.label}`} />
        {!!result.desc && <Text style={styles.resultDesc}>{result.desc}</Text>}
        <Text style={styles.etaText}>다음 재구매 ETA: <Text style={{ fontWeight: '700' }}>{eta}일</Text></Text>
      </View>

      {/* Recommandations */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>추천 액션</Text>
        <Text style={styles.recoHint}>해당 유형에게 효과적인 마케팅/운영 액션입니다.</Text>
        {RECO_BY_TYPE[result.code].map((t) => (
          <View key={t} style={styles.recoPill}>
            <Text style={styles.recoText}>{t}</Text>
          </View>
        ))}
      </View>

      {/* --- Mini charts --------------------------------------------------- */}
      <Text style={[styles.sectionTitle, { marginTop: 6 }]}>변화 추적</Text>

      {/* Sparkline ETA */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>ETA 변화 (일)</Text>
        <VictoryChart
          padding={{ top: 8, bottom: 26, left: 36, right: 8 }}
          height={160}
          theme={VictoryTheme.material}
          domainPadding={{ x: [6, 6], y: [6, 6] }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}`}
            style={{ tickLabels: { fontSize: 10 } }}
          />
          <VictoryAxis tickFormat={() => ''} />
          <VictoryArea
            interpolation="monotoneX"
            data={etaSeries}
            style={{ data: { opacity: 0.25 } }}
          />
          <VictoryLine interpolation="monotoneX" data={etaSeries} />
        </VictoryChart>
      </View>

      {/* Historique de type */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>유형 전환 (0:Churn, 1:Sniper, 2:Browser, 3:Loyal)</Text>
        <VictoryChart
          padding={{ top: 8, bottom: 26, left: 36, right: 8 }}
          height={160}
          theme={VictoryTheme.material}
          domain={{ y: [-0.2, 3.2] }}
        >
          <VictoryAxis
            dependentAxis
            tickValues={[0, 1, 2, 3]}
            style={{ tickLabels: { fontSize: 10 } }}
          />
          <VictoryAxis tickFormat={() => ''} />
          <VictoryLine interpolation="stepAfter" data={typeSeries} />
        </VictoryChart>
      </View>
      {/* ------------------------------------------------------------------ */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  headerSub: { fontSize: 12, color: '#64748b', lineHeight: 18 },

  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  presetBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  presetTitle: { fontWeight: '700', color: '#3730a3', fontSize: 13 },
  presetMeta: { color: '#4b5563', fontSize: 11, marginTop: 2 },

  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kpiLabel: { fontSize: 11, color: '#64748b' },
  kpiValue: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 2 },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6, color: '#0f172a' },
  h3: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginBottom: 6 },
  value: { color: '#0f172a', fontWeight: '700' },

  sliderBlock: { marginBottom: 14 },

  inlineRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  switchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchLabel: { fontWeight: '700', color: '#0f172a' },
  switchHelp: { color: '#94a3b8', fontSize: 11, marginTop: 2 },

  resultDesc: { marginTop: 8, color: '#475569', lineHeight: 18, fontSize: 12 },
  etaText: { marginTop: 8, color: '#0f172a' },

  recoHint: { fontSize: 11, color: '#94a3b8', marginBottom: 8 },
  recoPill: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
  },
  recoText: { color: '#312e81', fontWeight: '500', fontSize: 12 },

  chartCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 6,
  },
  chartTitle: { fontWeight: '700', color: '#0f172a', marginBottom: 6, fontSize: 13 },
});
