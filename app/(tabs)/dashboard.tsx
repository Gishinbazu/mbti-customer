'use client';

import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory-native';
import TopBar from '../../components/TopBar';
import { classify, groupBy, thresholdsFromData } from '../../lib/metrics';
import { useStore } from '../../lib/store';

type Code = 'LOYAL' | 'BROWSER' | 'SNIPER' | 'CHURN';
type ClassifyResult = { code: Code; label?: string; desc?: string };
type XY = { x: string | number; y: number };

export default function Dashboard() {
  const { customers, loaded } = useStore();

  const th = useMemo(() => thresholdsFromData(customers || []), [customers]);
  const safeKey = (v: unknown) =>
    v === undefined || v === null || v === '' ? 'UNKNOWN' : String(v);

  // ---------------- KPIs ----------------
  const { total, loyalCount, browserCount, sniperCount, churnCount } = useMemo(() => {
    if (!loaded || !customers?.length)
      return { total: 0, loyalCount: 0, browserCount: 0, sniperCount: 0, churnCount: 0 };

    let loyal = 0,
      browser = 0,
      sniper = 0,
      churn = 0;

    customers.forEach((c: any) => {
      const cls = classify(c, th) as ClassifyResult | string;
      const code = typeof cls === 'string' ? cls : (cls as ClassifyResult)?.code;
      switch (code) {
        case 'LOYAL':
          loyal++;
          break;
        case 'BROWSER':
          browser++;
          break;
        case 'SNIPER':
          sniper++;
          break;
        case 'CHURN':
          churn++;
          break;
      }
    });

    return {
      total: customers.length,
      loyalCount: loyal,
      browserCount: browser,
      sniperCount: sniper,
      churnCount: churn,
    };
  }, [customers, loaded, th]);

  // ---------------- Data by group ----------------
  const regionData: XY[] = useMemo(() => {
    if (!loaded || !customers?.length) return [];
    const byRegion = groupBy(customers, 'region');
    return Object.keys(byRegion).map((k) => ({ x: safeKey(k), y: byRegion[k].length }));
  }, [customers, loaded]);

  const ageData: XY[] = useMemo(() => {
    if (!loaded || !customers?.length) return [];
    const byAge = groupBy(customers, 'age_group');
    return Object.keys(byAge).map((k) => ({ x: safeKey(k), y: byAge[k].length }));
  }, [customers, loaded]);

  const monthSeries: XY[] = useMemo(() => {
    if (!loaded || !customers?.length) return [];
    const byMonth = groupBy(customers, 'month');
    const keys = Object.keys(byMonth).sort((a, b) => a.localeCompare(b));
    return keys.map((m) => {
      const arr = byMonth[m] ?? [];
      const loyal = arr.filter((v: any) => {
        const cls = classify(v, th) as ClassifyResult | string;
        const code = typeof cls === 'string' ? cls : (cls as ClassifyResult)?.code;
        return code === 'LOYAL';
      }).length;
      return { x: safeKey(m), y: loyal };
    });
  }, [customers, loaded, th]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;
  const empty = !customers?.length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar title="대시보드" />
      <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 28 }}>
        <Text style={st.title}>고객 분석 개요</Text>
        <Text style={st.subtitle}>MBTI-Customer 데이터 기반 세그먼트 현황입니다.</Text>

        {/* KPI Cards */}
        <View style={st.kpiRow}>
          <KpiCard label="전체 고객" value={total} accent="#0f172a" />
          <KpiCard label="충성형 (LOYAL)" value={loyalCount} accent="#0ea5e9" />
        </View>
        <View style={st.kpiRow}>
          <KpiCard label="관망형 (BROWSER)" value={browserCount} accent="#f97316" />
          <KpiCard label="이탈 위험 (CHURN)" value={churnCount} accent="#ef4444" />
        </View>
        {sniperCount > 0 && (
          <View style={st.kpiRow}>
            <KpiCard label="기습형 (SNIPER)" value={sniperCount} accent="#6366f1" />
          </View>
        )}

        {empty ? (
          <Text style={st.empty}>데이터가 없습니다. 고객을 추가하면 대시보드가 표시됩니다.</Text>
        ) : (
          <>
            {/* 지역별 분포 */}
            <View style={st.card}>
              <Text style={st.cardTitle}>지역별 분포</Text>
              <Text style={st.cardSubtitle}>고객이 어느 지역에 분포하는지 보여줍니다.</Text>
              <VictoryChart
                style={{ parent: { height: 220 } }}
                domainPadding={{ x: 24, y: [10, 10] }}
                containerComponent={<VictoryVoronoiContainer />}
              >
                <VictoryBar
                  data={regionData}
                  labels={({ datum }) => `${datum.x}\n${datum.y}`}
                  labelComponent={<VictoryTooltip constrainToVisibleArea />}
                  style={{
                    data: { fill: '#3b82f6', width: 18, borderRadius: 4 },
                    labels: { fontSize: 10, fill: '#0f172a', fontWeight: '500' },
                  }}
                  animate={{ duration: 600 }}
                />
                <VictoryAxis
                  style={{
                    axis: { stroke: '#cbd5e1' },
                    tickLabels: { angle: -25, fontSize: 9, padding: 12, fill: '#475569' },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: '#cbd5e1' },
                    tickLabels: { fontSize: 10, fill: '#475569' },
                    grid: { stroke: '#e2e8f0', strokeDasharray: '4 4' },
                  }}
                />
              </VictoryChart>
            </View>

            {/* 연령대 분포 */}
            <View style={st.card}>
              <Text style={st.cardTitle}>연령대 분포</Text>
              <Text style={st.cardSubtitle}>연령 그룹별 고객 수를 나타냅니다.</Text>
              <VictoryChart
                style={{ parent: { height: 220 } }}
                domainPadding={{ x: 24, y: [10, 10] }}
                containerComponent={<VictoryVoronoiContainer />}
              >
                <VictoryBar
                  data={ageData}
                  labels={({ datum }) => `${datum.x}\n${datum.y}`}
                  labelComponent={<VictoryTooltip constrainToVisibleArea />}
                  style={{
                    data: { fill: '#6366f1', width: 18, borderRadius: 4 },
                    labels: { fontSize: 10, fill: '#0f172a' },
                  }}
                  animate={{ duration: 600 }}
                />
                <VictoryAxis
                  style={{
                    axis: { stroke: '#cbd5e1' },
                    tickLabels: { fontSize: 10, fill: '#475569' },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: '#cbd5e1' },
                    tickLabels: { fontSize: 10, fill: '#475569' },
                    grid: { stroke: '#e2e8f0', strokeDasharray: '4 4' },
                  }}
                />
              </VictoryChart>
            </View>

            {/* 월별 충성형 추이 */}
            <View style={st.card}>
              <Text style={st.cardTitle}>월별 충성형 고객 추이</Text>
              <Text style={st.cardSubtitle}>시간에 따라 LOYAL 고객이 어떻게 변하는지 확인하세요.</Text>
              <VictoryChart
                style={{ parent: { height: 220 } }}
                containerComponent={<VictoryVoronoiContainer />}
              >
                <VictoryLine
                  data={monthSeries}
                  labels={({ datum }) => `${datum.x}: ${datum.y}`}
                  labelComponent={<VictoryTooltip constrainToVisibleArea />}
                  style={{
                    data: { stroke: '#0ea5e9', strokeWidth: 3 },
                  }}
                  animate={{ duration: 650 }}
                />
                <VictoryAxis
                  style={{
                    axis: { stroke: '#cbd5e1' },
                    tickLabels: { angle: -25, fontSize: 9, padding: 12, fill: '#475569' },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: '#cbd5e1' },
                    tickLabels: { fontSize: 10, fill: '#475569' },
                    grid: { stroke: '#e2e8f0', strokeDasharray: '4 4' },
                  }}
                />
              </VictoryChart>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={[st.kpiCard, { borderLeftColor: accent }]}>
      <Text style={st.kpiLabel}>{label}</Text>
      <Text style={st.kpiValue}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  subtitle: { color: '#64748b', marginTop: 4, marginBottom: 14 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 4,
    shadowColor: '#0f172a',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  kpiLabel: { fontSize: 12, color: '#475569' },
  kpiValue: { fontSize: 20, fontWeight: '800', marginTop: 4, color: '#0f172a' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  // ↓ tailles réduites comme tu voulais
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2, color: '#0f172a' },
  cardSubtitle: { fontSize: 11, color: '#94a3b8', marginBottom: 6 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24, fontSize: 14 },
});
