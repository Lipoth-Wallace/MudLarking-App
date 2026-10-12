import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.text}>Your finds will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greyLight },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.green },
  text: { marginTop: 8, color: colors.grey },
});
