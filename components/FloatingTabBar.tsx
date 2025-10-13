import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  home: 'home',
  analysis: 'pie-chart',
  dashboard: 'bar-chart-2',
  share: 'share-2',
  customers: 'users',
  simulator: 'sliders',
  about: 'info',
};

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
        {/* Fond flouté */}
        <BlurView intensity={45} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const options = descriptors[route.key].options;
            const label =
              (options.tabBarLabel as string) ??
              (options.title as string) ??
              route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            const iconName = ICONS[route.name] || 'circle';

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.item,
                  isFocused && styles.itemActive,
                  pressed && { opacity: 0.8 },
                ]}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                <Feather
                  name={iconName as any}
                  size={20}
                  color={isFocused ? '#0f172a' : '#6b7280'}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.label, isFocused && styles.labelActive]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 28,
    paddingHorizontal: 6,
    paddingVertical: 6,
    overflow: 'hidden',            // important pour que le flou ne déborde pas
    // ombre douce
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 22,
    flexDirection: 'column',
    gap: 2,
  },
  itemActive: {
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  labelActive: {
    color: '#0f172a',
  },
});
