import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export default function CameraScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera</Text>
      <Text style={styles.text}>Take a photo of a find here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greyLight },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.green },
  text: { marginTop: 8, color: colors.grey },
});
