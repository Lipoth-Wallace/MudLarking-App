import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { supabase } from '@/supabase';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Sign in failed', error.message);
  }

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Sign up failed', error.message);
    else if (!data.session) Alert.alert('Check your email', 'Tap the link we sent you, then sign in.');
  }

  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Signed in as {session.user.email}</Text>
        <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword}
        secureTextEntry autoComplete="password" />
      <Pressable style={styles.button} onPress={signIn}>
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
      <Pressable onPress={signUp}>
        <Text style={styles.link}>Create account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.greyLight },
  text: { color: colors.grey, fontSize: 16 },
  input: { width: '100%', backgroundColor: colors.white, borderColor: colors.greenLight, borderWidth: 1,
    borderRadius: 8, padding: 12, marginVertical: 6, fontSize: 16 },
  button: { backgroundColor: colors.green, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 28, marginTop: 16 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  link: { color: colors.green, marginTop: 16, fontSize: 16 },
});
