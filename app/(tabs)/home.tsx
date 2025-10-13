'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import KpiCard from '../../components/KpiCard';
import { kpis } from '../../lib/metrics';
import { useStore } from '../../lib/store';

/** Tiny count-up animation hook for numbers */
function useCountUp(target: number, durationMs = 600) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    const animate = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      setValue(target * (0.5 - Math.cos(Math.PI * p) / 2)); // ease-in-out
      if (p < 1) frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      startRef.current = null;
    };
  }, [target, durationMs]);

  return Math.round(value);
}

export default function Home() {
  const { customers, loaded, loadMock } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const hasData = Array.isArray(customers) && customers.length > 0;

  const { total, avgVisit, repurch } = useMemo(() => {
    if (!hasData) return { total: 0, avgVisit: 0, repurch: 0 };
    try {
      return kpis(customers!);
    } catch {
      const total = customers!.length;
      const avgVisit =
        total === 0 ? 0 : customers!.reduce((s, c) => s + (Number(c.visit_days) || 0), 0) / total;
      const repurch =
        total === 0
          ? 0
          : (100 * customers!.filter((c) => c?.retained_90 || c?.retained_june_august).length) /
            total;
      return { total, avgVisit, repurch };
    }
  }, [customers, hasData]);

  const fmtInt = (n: number) => Math.round(n).toLocaleString();
  const fmt1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '0.0');
  const totalAnimated = useCountUp(total, 650);

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>데이터 로딩 중…</Text>
      </View>
    );
  }

  const repurchTone =
    repurch >= 60 ? styles.badgeGood : repurch >= 30 ? styles.badgeWarn : styles.badgeBad;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        style={{ paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Hero section */}
        <View style={styles.hero}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.heroEyebrow}>고객 요약</Text>
            <Text style={styles.heroTitle}>오늘의 지표를 빠르게 확인해 보세요.</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.pill, styles.badgePrimary]}>
                <Text style={styles.pillText}>총 고객</Text>
                <Text style={styles.pillValue}>{fmtInt(total)}</Text>
              </View>
              <View style={[styles.pill, repurchTone]}>
                <Text style={styles.pillText}>재구매율</Text>
                <Text style={styles.pillValue}>{fmt1(repurch)}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroBadgeWrap}>
            <Text style={styles.heroBadgeLabel}>오늘 총계</Text>
            <Text style={styles.heroBadge}>{fmtInt(totalAnimated)}</Text>
          </View>
        </View>

        {/* Section: KPI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>핵심 KPI</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <KpiCard title="전체 고객 수" value={fmtInt(total)} />
          </View>
          <View style={styles.gridItem}>
            <KpiCard title="평균 출석일수" value={fmt1(avgVisit)} />
          </View>
          <View style={styles.gridItem}>
            <KpiCard title="재구매율" value={fmt1(repurch)} suffix="%" />
          </View>
        </View>

        {/* Empty state */}
        {!hasData && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>데이터가 없습니다</Text>
            <Text style={styles.emptyText}>
              고객을 추가하면 지표가 자동으로 업데이트됩니다. 샘플 데이터를 불러올 수도 있어요.
            </Text>

            <Pressable
              onPress={loadMock}
              style={({ pressed }) => [
                styles.emptyBtn,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
            >
              <Text style={styles.emptyBtnText}>샘플 데이터 불러오기</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const cardShadow =
  Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 2 },
    default: {},
  }) || {};

const styles = StyleSheet.create({
  loadingText: { color: '#64748b', marginTop: 8 },

  /** Header bar */
  appHeader: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', textAlign: 'center', flex: 1 },
  profileBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: { fontSize: 18 },

  /** Hero Section */
  hero: {
    marginTop: 6,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...cardShadow,
  },
  heroEyebrow: { color: '#6366f1', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  heroTitle: { marginTop: 4, fontSize: 18, fontWeight: '800', letterSpacing: -0.2, color: '#0f172a' },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  pillText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  pillValue: { color: '#0f172a', fontSize: 14, fontWeight: '800' },
  badgePrimary: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' },
  badgeGood: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  badgeWarn: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  badgeBad: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },

  heroBadgeWrap: { alignItems: 'flex-end', justifyContent: 'center', gap: 6 },
  heroBadgeLabel: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  heroBadge: {
    backgroundColor: '#eef2ff',
    color: '#3730a3',
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    minWidth: 84,
    textAlign: 'center',
  },

  /** KPI section */
  sectionHeader: { marginTop: 6, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridItem: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },

  /** Empty state */
  emptyCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    ...cardShadow,
  },
  emptyTitle: { fontWeight: '800', marginBottom: 6, color: '#0f172a', fontSize: 16 },
  emptyText: { color: '#64748b', textAlign: 'center' },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3730a3',
  },
  emptyBtnText: { color: '#fff', fontWeight: '800' },
});
