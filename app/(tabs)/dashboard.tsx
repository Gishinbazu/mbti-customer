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

    const keys = Object.keys(byMonth).sort((a, b) => {
      // Prefer YYYY-MM sort; then numeric; then alpha
      const rx = /^(\d{4})-(\d{2})$/;
      const ma = a.match(rx);
      const mb = b.match(rx);
      if (ma && mb) return a.localeCompare(b);
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });

    return keys.map((m) => {
      const arr = byMonth[m] ?? [];
      const loyalCount = arr.filter((v: any) => {
        const cls = classify(v, th) as ClassifyResult | string;
        const code = typeof cls === 'string' ? cls : (cls as ClassifyResult)?.code;
        return code === 'LOYAL';
      }).length;
      return { x: safeKey(m), y: loyalCount };
    });
  }, [customers, loaded, th]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;

  const empty = !customers?.length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar title="대시보드" />
      <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {empty ? (
          <Text style={styles.empty}>데이터가 없습니다.</Text>
        ) : (
          <>
            <Text style={styles.h2}>지역별 분포</Text>
            <VictoryChart domainPadding={{ x: 24, y: [10, 10] }} containerComponent={<VictoryVoronoiContainer />}>
              <VictoryBar
                data={regionData}
                labels={({ datum }) => `${datum.x}\n${datum.y}`}
                labelComponent={<VictoryTooltip constrainToVisibleArea />}
                animate={{ duration: 600 }}
              />
              <VictoryAxis style={{ tickLabels: { angle: -25, fontSize: 9, padding: 12 } }} />
              <VictoryAxis dependentAxis />
            </VictoryChart>

            <Text style={styles.h2}>연령대 분포</Text>
            <VictoryChart domainPadding={{ x: 24, y: [10, 10] }} containerComponent={<VictoryVoronoiContainer />}>
              <VictoryBar
                data={ageData}
                labels={({ datum }) => `${datum.x}\n${datum.y}`}
                labelComponent={<VictoryTooltip constrainToVisibleArea />}
                animate={{ duration: 600 }}
              />
              <VictoryAxis style={{ tickLabels: { fontSize: 10 } }} />
              <VictoryAxis dependentAxis />
            </VictoryChart>

            <Text style={styles.h2}>월별 충성형 추이</Text>
            <VictoryChart containerComponent={<VictoryVoronoiContainer />}>
              <VictoryLine
                data={monthSeries}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                labelComponent={<VictoryTooltip constrainToVisibleArea />}
                animate={{ duration: 650 }}
              />
              <VictoryAxis style={{ tickLabels: { angle: -25, fontSize: 9, padding: 12 } }} />
              <VictoryAxis dependentAxis />
            </VictoryChart>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: 16, fontWeight: '700', marginVertical: 8 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24, fontSize: 14 },
});
