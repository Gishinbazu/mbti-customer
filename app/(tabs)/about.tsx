import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import TopBar from '../../components/TopBar';

export default function About() {
  return (
    <View style={styles.screen}>
      <TopBar title="프로젝트 소개" />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Hero / intro */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Ionicons name="sparkles-outline" size={14} color="#0f172a" />
            <Text style={styles.badgeText}>MBTI × 고객 분석</Text>
          </View>
          <Text style={styles.title}>프로젝트 비전</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.bold}>고객 행동 분석을 쉽고, 재미있고, 실용적으로</Text> 만드는 것을 목표로 합니다.
            MBTI에서 영감을 받은 (출석률 × 재구매율) 세분화 시스템을 통해
            기업은 고객 충성도를 높이고 고객은 자신의 소비 패턴을 이해할 수 있습니다.
          </Text>
        </View>

        {/* Vision / purpose */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>목표</Text>
          <View style={styles.listItem}>
            <Ionicons name="person-circle-outline" size={20} color="#0f172a" />
            <Text style={styles.listText}>
              <Text style={styles.bold}>소비자 :</Text> 자신의 출석 및 재구매 패턴을 시각화하고 다음 구매 시점을 예측합니다.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="business-outline" size={20} color="#0f172a" />
            <Text style={styles.listText}>
              <Text style={styles.bold}>기업 / 운영자 :</Text> 고객을 4가지 유형으로 분류하고 유형별 맞춤형 마케팅 전략을 수립합니다.
            </Text>
          </View>
        </View>

        {/* Value proposition */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>핵심 가치</Text>
          <Text style={styles.p}>데이터를 단순히 보는 것을 넘어, 실시간으로 행동 가능한 인사이트로 전환합니다.</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>LOYAL</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>BROWSER</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>SNIPER</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>CHURN</Text></View>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="pulse-outline" size={20} color="#0f172a" />
            <Text style={styles.listText}>행동 기반 실시간 고객 분석</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="time-outline" size={20} color="#0f172a" />
            <Text style={styles.listText}>예상 재구매 시점(ETA) 계산</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="map-outline" size={20} color="#0f172a" />
            <Text style={styles.listText}>지역, 연령, 기간별 데이터 시각화</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="flask-outline" size={20} color="#0f172a" />
            <Text style={styles.listText}>가상 시나리오 시뮬레이션 기능</Text>
          </View>
        </View>

        {/* Product goals */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>제품 목표</Text>
          <Text style={styles.p}>V1/V2 버전에서 달성해야 할 주요 기능:</Text>
          <View style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>O1. 전체 고객의 90% 이상을 4가지 유형으로 분류</Text></View>
          <View style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>O2. ETA 계산을 통해 최적의 마케팅 시점 도출</Text></View>
          <View style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>O3. KPI 및 세그먼트별 대시보드 시각화</Text></View>
          <View style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>O4. 고객 CRUD 관리 (로컬 → 서버)</Text></View>
          <View style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>O5. 재미있는 UX (“당신은 충성형 고객입니다!”)</Text></View>
        </View>

        {/* KPIs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>핵심 지표 (KPIs)</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}><Text style={styles.kpiLabel}>90일 재구매율</Text><Text style={styles.kpiValue}>↑</Text></View>
            <View style={styles.kpiCard}><Text style={styles.kpiLabel}>전환율</Text><Text style={styles.kpiValue}>Seg.</Text></View>
            <View style={styles.kpiCard}><Text style={styles.kpiLabel}>운영자 사용률</Text><Text style={styles.kpiValue}>주간</Text></View>
          </View>
          <Text style={styles.p}>공유 횟수, 체류 시간, 재방문율 등 고객 참여 지표도 함께 추적합니다.</Text>
        </View>

        {/* Data & ethics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>데이터 및 윤리</Text>
          <View style={styles.listItem}><Ionicons name="document-text-outline" size={20} color="#0f172a" /><Text style={styles.listText}>사용 변수: visit_days, avg_duration_min, retained_90 등</Text></View>
          <View style={styles.listItem}><Ionicons name="shield-checkmark-outline" size={20} color="#0f172a" /><Text style={styles.listText}>익명화 및 최소 데이터 사용 원칙</Text></View>
          <View style={styles.listItem}><Ionicons name="eye-outline" size={20} color="#0f172a" /><Text style={styles.listText}>투명한 분류 기준 공개</Text></View>
        </View>

        {/* Roadmap */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>로드맵</Text>
          <View style={styles.timelineItem}><View style={styles.timelineDot} /><View style={styles.timelineContent}><Text style={styles.bold}>V1</Text><Text style={styles.timelineText}>Expo 프론트엔드 + 유형 분석 + 대시보드 + 시뮬레이터</Text></View></View>
          <View style={styles.timelineItem}><View style={styles.timelineDot} /><View style={styles.timelineContent}><Text style={styles.bold}>V2</Text><Text style={styles.timelineText}>Express API + CSV 업로드 + DB 연동</Text></View></View>
          <View style={styles.timelineItem}><View style={styles.timelineDot} /><View style={styles.timelineContent}><Text style={styles.bold}>V3</Text><Text style={styles.timelineText}>AI 기반 재구매 예측 + A/B 테스트</Text></View></View>
          <View style={styles.timelineItem}><View style={styles.timelineDot} /><View style={styles.timelineContent}><Text style={styles.bold}>V4</Text><Text style={styles.timelineText}>게이미피케이션, 알림, 다국어 지원</Text></View></View>
        </View>

        {/* Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>문의</Text>
          <Text style={styles.p}>문의나 제안 사항은 아래 이메일로 보내주세요.</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('mailto:product@yourdomain.com')}
          >
            product@yourdomain.com
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e2e8f0' },
  container: { padding: 16, paddingBottom: 120 },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(248,250,252,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#0f172a' },
  title: { fontSize: 20, fontWeight: '800', color: 'white', marginBottom: 6 },
  subtitle: { color: 'rgba(241,245,249,0.9)', lineHeight: 20 },
  bold: { fontWeight: '700' },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  p: { color: '#334155', lineHeight: 20, marginBottom: 6 },
  listItem: { flexDirection: 'row', gap: 10, marginBottom: 6, alignItems: 'flex-start' },
  listText: { flex: 1, color: '#334155', lineHeight: 20 },
  bullet: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  bulletDot: { color: '#0f172a', fontWeight: '700', marginTop: 1 },
  bulletText: { color: '#334155', flex: 1 },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kpiLabel: { fontSize: 12, color: '#475569', marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  timelineItem: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  timelineDot: {
    width: 10,
    height: 10,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    marginTop: 4,
  },
  timelineContent: { flex: 1 },
  timelineText: { color: '#334155', lineHeight: 18 },
  contactCard: {
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    marginBottom: 50,
  },
  link: { color: '#0ea5e9', textDecorationLine: 'underline', fontWeight: '600' },
});
