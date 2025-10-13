import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({ message = '데이터가 없습니다.' }: { message?: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#94a3b8' },
});
