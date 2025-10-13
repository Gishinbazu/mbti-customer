// app/(public)/welcome.tsx
'use client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Welcome() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const continueToApp = useCallback(async () => {
    if (saving) return; // extra guard
    try {
      setSaving(true);
      await AsyncStorage.setItem('onboarded', '1');
      router.replace('/(tabs)/home');
    } finally {
      setSaving(false);
    }
  }, [saving, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero */}
        <LinearGradient
          colors={['#0f172a', '#111827']}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>환영합니다 👋</Text>
            <Text style={styles.subtitle}>
              고객 행동을 분석하고 재구매를 예측해 더 높은 성과를 만들어요.
            </Text>
          </View>
          <Image
            // Adjust this path if your file sits elsewhere
            source={require('../../assets/images/welcome-icon.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </LinearGradient>

        {/* Features */}
        <View style={styles.featuresWrap}>
          <Feature title="KPI 한눈에" desc="핵심 지표를 한 화면에서 빠르게 확인" />
          <Feature title="유형 분석" desc="충성·눈팅·기습·이탈 유형 분류" />
          <Feature title="재구매 예측" desc="간단 입력으로 ETA 추정" />
        </View>

        {/* Call To Action */}
        <View style={styles.ctaWrap}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={continueToApp}
            disabled={saving}
            android_ripple={{ color: '#4338ca' }}
            accessibilityRole="button"
            accessibilityLabel="시작하기"
          >
            <Text style={styles.primaryText}>{saving ? '시작하는 중…' : '시작하기'}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/customers')}
            android_ripple={{ color: '#e0e7ff' }}
            accessibilityRole="button"
            accessibilityLabel="고객 추가하기"
          >
            <Text style={styles.secondaryText}>고객 추가하기</Text>
          </Pressable>
        </View>

        <Text style={styles.note}>언제든지 설정에서 다시 볼 수 있어요.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

const shadow =
  Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
    android: { elevation: 4 },
    default: {},
  }) || {};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadow,
  },
  title: { color: '#e5e7eb', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { color: '#cbd5e1', marginTop: 6, lineHeight: 20 },
  heroImage: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#0b1220' },

  featuresWrap: { gap: 10 },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  featureTitle: { fontWeight: '800', color: '#0f172a' },
  featureDesc: { marginTop: 4, color: '#475569' },

  ctaWrap: { gap: 10, marginTop: 2 },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },
  primaryText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  secondaryText: { color: '#3730a3', fontWeight: '800' },
  pressed: { opacity: 0.9 },

  note: { textAlign: 'center', color: '#94a3b8', marginTop: 4 },
});
