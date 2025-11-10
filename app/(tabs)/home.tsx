//'use client';

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

const FILTERS = ['오늘', '최근 7일', '최근 30일'];

export default function Home() {
  const { customers, loaded, loadMock } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Aujourd’hui');

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
      <View style={styles.loadingWrap}>
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
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.topHello}>안녕하세요</Text>
            <Text style={styles.topSubtitle}>MBTI 고객 대시보드 요약</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>MB</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            >
              <Text
                style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

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
            <Text style={styles.heroBadgeHint}>실시간 기준</Text>
          </View>
        </View>

        {/* KPI Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>핵심 KPI</Text>
          <Text style={styles.sectionHint}>{activeFilter} 기준</Text>
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

        {/* Insight card */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>AI 인사이트</Text>
          {repurch >= 60 ? (
            <Text style={styles.insightText}>
              이번 주는 재구매율이 높아요. 충성 고객 리텐션 캠페인을 그대로 유지하세요.
            </Text>
          ) : repurch >= 30 ? (
            <Text style={styles.insightText}>
              중간 수준의 재구매율입니다. 이탈 위험 고객에게 쿠폰/알림을 보내는 것을 권장합니다.
            </Text>
          ) : (
            <Text style={styles.insightText}>
              재구매율이 낮습니다. “최근 방문 고객”에게 집중해서 프로모션을 발송해 보세요.
            </Text>
          )}
        </View>

        {/* Segments (static demo) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>주요 고객 세그먼트</Text>
        </View>
        <View style={styles.segmentWrap}>
          <View style={styles.segmentItem}>
            <Text style={styles.segmentTitle}>LOYAL (충성형)</Text>
            <Text style={styles.segmentDesc}>정기적으로 방문하고 재구매하는 핵심 고객</Text>
            <Text style={styles.segmentNumber}>32명</Text>
          </View>
          <View style={styles.segmentItem}>
            <Text style={styles.segmentTitle}>BROWSER (눈팅형)</Text>
            <Text style={styles.segmentDesc}>방문은 잦지만 구매는 적은 고객</Text>
            <Text style={styles.segmentNumber}>18명</Text>
          </View>
          <View style={styles.segmentItem}>
            <Text style={styles.segmentTitle}>CHURN (이탈예정)</Text>
            <Text style={styles.segmentDesc}>90일 이상 미방문 고객</Text>
            <Text style={[styles.segmentNumber, { color: '#dc2626' }]}>7명</Text>
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
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: {},
  }) || {};

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: '#64748b', marginTop: 8 },

  topHeader: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topHello: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  topSubtitle: { color: '#94a3b8', marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#e0ecff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontWeight: '800', color: '#1d4ed8' },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#1d4ed8',
  },
  filterChipText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },

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

  heroBadgeWrap: { alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
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
  heroBadgeHint: { color: '#94a3b8', fontSize: 11 },

  sectionHeader: {
    marginTop: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  sectionHint: { color: '#94a3b8', fontSize: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridItem: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },

  insightCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  insightTitle: { color: '#e2e8f0', fontWeight: '700', marginBottom: 4 },
  insightText: { color: '#cbd5f5', lineHeight: 20 },

  segmentWrap: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  segmentItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    ...cardShadow,
  },
  segmentTitle: { fontWeight: '700', color: '#0f172a' },
  segmentDesc: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  segmentNumber: { marginTop: 8, fontWeight: '800', color: '#0f172a' },

  emptyCard: {
    marginTop: 16,
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
