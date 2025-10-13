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
import { classify, nextRepurchaseEtaDays, thresholdsFromData } from '../../lib/slassifier';
import { useStore } from '../../lib/store';

type Code = 'LOYAL' | 'BROWSER' | 'SNIPER' | 'CHURN';
type ClassifyResult = { code: Code; label: string; desc: string };

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

// Mapping lisible pour l’historique de type (valeur numérique)
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

  // ----------------------------
  // Historique pour les mini charts
  // ----------------------------
  type Pt = { x: number; y: number };
  const [etaSeries, setEtaSeries] = useState<Pt[]>([{ x: 0, y: eta }]);
  const [typeSeries, setTypeSeries] = useState<Pt[]>([{ x: 0, y: TYPE_INDEX[result.code] }]);
  const [tick, setTick] = useState(1);

  // A chaque changement d’inputs → on push un point (limité à 40)
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
    <Screen scroll extraBottom={90}>
      <TopBar title="시뮬레이터" />

      {/* Presets */}
      <View style={styles.presetsRow}>
        {QUICK_PRESETS.map((p) => (
          <Pressable
            key={p.name}
            onPress={() => applyPreset(p.visit_days, p.avg_duration_min)}
            style={({ pressed }) => [styles.presetBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.presetText}>{p.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* Sliders */}
      <View style={styles.card}>
        <Text style={styles.h3}>
          출석일수: <Text style={styles.value}>{visit}</Text>일
        </Text>
        <Slider minimumValue={0} maximumValue={30} step={1} value={visit} onValueChange={setVisit} />

        <View style={{ height: 12 }} />

        <Text style={styles.h3}>
          체류시간(분): <Text style={styles.value}>{dur}</Text>분
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={240}
          step={5}
          value={dur}
          onValueChange={setDur}
        />
      </View>

      {/* Switches */}
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

      {/* Résultat */}
      <View style={styles.card}>
        <Text style={styles.h3}>예상 결과</Text>
        <TypeBadge type={result.code} label={`예상 유형: ${result.label}`} />
        {!!result.desc && <Text style={{ marginTop: 8, color: '#475569' }}>{result.desc}</Text>}
        <Text style={{ marginTop: 6, fontWeight: '600' }}>다음 재구매 ETA: {eta}일</Text>
      </View>

      {/* Recommandations */}
      <View style={styles.card}>
        <Text style={styles.h3}>추천 액션</Text>
        {RECO_BY_TYPE[result.code].map((t) => (
          <Text key={t} style={styles.recoItem}>
            • {t}
          </Text>
        ))}
      </View>

      {/* --- Mini charts --------------------------------------------------- */}
      <Text style={[styles.h3, { marginTop: 6 }]}>미니 그래프</Text>

      {/* Sparkline ETA */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>ETA 변화 (일)</Text>
        <VictoryChart
          padding={{ top: 8, bottom: 26, left: 36, right: 8 }}
          height={160}
          theme={VictoryTheme.material}
          domainPadding={{ x: [6, 6], y: [6, 6] }}
        >
          <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} style={{ tickLabels: { fontSize: 10 } }} />
          <VictoryAxis tickFormat={() => ''} />
          <VictoryArea
            interpolation="monotoneX"
            data={etaSeries}
            style={{ data: { opacity: 0.25 } }}
          />
          <VictoryLine interpolation="monotoneX" data={etaSeries} />
        </VictoryChart>
      </View>

      {/* Historique de type (0..3) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>유형 전환 (0:Churn, 1:Sniper, 2:Browser, 3:Loyal)</Text>
        <VictoryChart
          padding={{ top: 8, bottom: 26, left: 36, right: 8 }}
          height={160}
          theme={VictoryTheme.material}
          domain={{ y: [-0.2, 3.2] }}
        >
          <VictoryAxis dependentAxis tickValues={[0, 1, 2, 3]} style={{ tickLabels: { fontSize: 10 } }} />
          <VictoryAxis tickFormat={() => ''} />
          <VictoryLine interpolation="stepAfter" data={typeSeries} />
        </VictoryChart>
      </View>
      {/* ------------------------------------------------------------------ */}
    </Screen>
  );
}

const styles = StyleSheet.create({
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

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  h3: { fontSize: 15, fontWeight: '700' },
  value: { color: '#0f172a' },

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

  recoItem: { color: '#334155', marginTop: 6 },

  chartCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  chartTitle: { fontWeight: '700', color: '#0f172a', marginBottom: 6 },
});
