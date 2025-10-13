import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import TopBar from '../../components/TopBar';

export default function About() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar title="프로젝트 소개" />
      <ScrollView style={{ padding: 16 }}>
        <Text style={s.h1}>프로젝트 비전 (Vision)</Text>
        <Text style={s.p}>
          고객 행동 분석을 <Text style={s.bold}>쉽고, 재미있고, 실행 가능하게</Text> 만드는 것을 목표로 합니다.  
          MBTI에서 영감을 받은 고객 유형화(출석률 × 재구매율)를 통해  
          기업은 고객 충성도를 높이고, 고객은 스스로의 소비 패턴을 이해할 수 있도록 합니다.
        </Text>

        <Text style={s.h2}>목적 (Purpose)</Text>
        <Text style={s.li}>• <Text style={s.bold}>소비자</Text>: 자신의 출석 및 재구매 패턴을 MBTI식으로 확인하고, 다음 재구매 예상 시점을 예측합니다.</Text>
        <Text style={s.li}>• <Text style={s.bold}>운영자/기업</Text>: 고객을 4가지 유형으로 세분화하여 유형별 맞춤 대응 및 마케팅 전략을 수립합니다.</Text>

        <Text style={s.h2}>핵심 가치 (Value Proposition)</Text>
        <Text style={s.li}>• 실시간 유형 분석: 충성형(LOYAL) / 눈팅형(BROWSER) / 기습형(SNIPER) / 이탈형(CHURN)</Text>
        <Text style={s.li}>• 재구매 예상 시점(ETA) 계산 기능</Text>
        <Text style={s.li}>• 지역·연령대·월별 추이 대시보드 시각화</Text>
        <Text style={s.li}>• 시뮬레이터를 통한 가상 시나리오 테스트</Text>

        <Text style={s.h2}>제품 목표 (Product Goals)</Text>
        <Text style={s.li}>• O1. 전체 고객의 90% 이상을 4가지 유형 중 하나로 분류</Text>
        <Text style={s.li}>• O2. 재구매 시점(ETA)을 계산하여 적절한 시점에 마케팅 제공</Text>
        <Text style={s.li}>• O3. 통계 및 지표를 한눈에 볼 수 있는 대시보드</Text>
        <Text style={s.li}>• O4. 고객 관리 CRUD 기능 (V1: 로컬, V2: 서버 연동)</Text>
        <Text style={s.li}>• O5. 재미있는 사용자 경험 (“당신은 충성형 고객입니다!”)</Text>

        <Text style={s.h2}>핵심 지표 (KPIs)</Text>
        <Text style={s.li}>• 90일 재구매율 상승률</Text>
        <Text style={s.li}>• 세그먼트별 캠페인 전환율</Text>
        <Text style={s.li}>• 운영자 주간 사용률</Text>
        <Text style={s.li}>• 고객 참여도 (공유 횟수, 체류시간, 재방문율)</Text>

        <Text style={s.h2}>데이터 및 윤리 (Data & Ethics)</Text>
        <Text style={s.li}>• 사용 변수: visit_days, avg_duration_min, retained_june_august, retained_90 (+ 메타데이터)</Text>
        <Text style={s.li}>• 개인정보 보호: 익명화, 최소 데이터 사용, 투명한 분류 기준</Text>

        <Text style={s.h2}>로드맵 (Roadmap)</Text>
        <Text style={s.li}>• V1: Expo 프론트엔드 + 유형분석 로직 + KPI + 대시보드 + 시뮬레이터</Text>
        <Text style={s.li}>• V2: Express API + CSV 업로드 + DB 연동 (KPI, 유형, ETA API)</Text>
        <Text style={s.li}>• V3: AI 기반 재구매 예측 모델 + A/B 테스트</Text>
        <Text style={s.li}>• V4: 게이미피케이션, 알림 기능, 다국어 지원</Text>

        <Text style={s.h2}>문의 (Contact)</Text>
        <Text style={s.p}>
          문의나 제안사항은 아래 이메일로 연락해주세요.{"\n"}
          <Text style={s.link} onPress={() => Linking.openURL('mailto:product@yourdomain.com')}>
            product@yourdomain.com
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  h2: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  p: { color: '#334155', lineHeight: 22, marginBottom: 8 },
  li: { color: '#334155', lineHeight: 22, marginBottom: 4 },
  bold: { fontWeight: '700' },
  link: { color: '#0ea5e9', textDecorationLine: 'underline' },
});
