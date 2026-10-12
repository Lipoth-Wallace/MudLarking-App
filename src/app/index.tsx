import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/supabase';
import { colors } from '@/theme';

type Find = { id: string; latitude: number; longitude: number; accuracy_m: number | null; found_at: string };

export default function HomeScreen() {
  const [finds, setFinds] = useState<Find[]>([]);
  const [message, setMessage] = useState('Loading…');

  // Reload whenever the tab is opened, so a new find shows up straight away.
  useFocusEffect(
    useCallback(() => {
      supabase.from('finds').select('id, latitude, longitude, accuracy_m, found_at')
        .order('found_at', { ascending: false })
        .then(({ data, error }) => {
          setFinds(data ?? []);
          setMessage(error ? error.message : 'No finds yet. Sign in on Settings, then use the Camera tab.');
        });
    }, []),
  );

  return (
    <FlatList
      style={styles.container}
      data={finds}
      keyExtractor={(f) => f.id}
      ListEmptyComponent={<Text style={styles.empty}>{message}</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.title}>{new Date(item.found_at).toLocaleString()}</Text>
          <Text style={styles.text}>
            {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}  ±{item.accuracy_m === null ? '?' : Math.round(item.accuracy_m)} m
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greyLight },
  row: { backgroundColor: colors.white, margin: 8, marginBottom: 0, padding: 12, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: colors.green },
  title: { fontWeight: 'bold', color: colors.green },
  text: { marginTop: 4, color: colors.grey },
  empty: { textAlign: 'center', margin: 24, color: colors.grey },
});
