// app/(public)/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function PublicLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack
        initialRouteName="welcome"
        screenOptions={{
          headerShown: false,
          animation: 'fade',                  // transition discrète
          contentStyle: { backgroundColor: '#0f172a' }, // fond de welcome
        }}
      >
        <Stack.Screen name="welcome" />
        {/* Ajoute ici d'autres écrans publics si besoin */}
      </Stack>
    </>
  );
}
