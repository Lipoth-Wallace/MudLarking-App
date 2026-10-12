import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/supabase';
import { colors } from '@/theme';

const MAX_ACCURACY_M = 20;

type Find = {
  photoUri: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
};

async function getFix(): Promise<Location.LocationObject | null> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) {
    Alert.alert('Location needed', 'Allow location access in Settings to record where finds are.');
    return null;
  }
  return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
}

// Resolves with a fix the user accepted, or null if they cancelled.
async function getGoodFix(): Promise<Location.LocationObject | null> {
  const fix = await getFix();
  if (!fix) return null;
  const acc = fix.coords.accuracy;
  if (acc !== null && acc <= MAX_ACCURACY_M) return fix;
  return new Promise((resolve) =>
    Alert.alert(
      'Weak GPS fix',
      `Accuracy is ${acc === null ? 'unknown' : `±${Math.round(acc)} m`}. Move into the open and try again for a better fix.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        { text: 'Use anyway', onPress: () => resolve(fix) },
        { text: 'Try again', style: 'default', onPress: () => getGoodFix().then(resolve) },
      ],
    ),
  );
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [find, setFind] = useState<Find | null>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>MudLarking needs the camera to photograph finds.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  async function recordFind() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Sign in first', 'Sign in on the Settings tab so your finds are saved.');
      return;
    }
    setBusy(true);
    try {
      const photo = await camera.current?.takePictureAsync();
      if (!photo) return;
      const fix = await getGoodFix();
      if (!fix) return;
      // Photos live in a folder named after the user, which the storage policy checks.
      const photoPath = `${user.id}/${fix.timestamp}.jpg`;
      const body = await (await fetch(photo.uri)).arrayBuffer();
      const upload = await supabase.storage.from('photos').upload(photoPath, body, { contentType: 'image/jpeg' });
      if (upload.error) throw upload.error;
      const insert = await supabase.from('finds').insert({
        photo_path: photoPath,
        latitude: fix.coords.latitude,
        longitude: fix.coords.longitude,
        accuracy_m: fix.coords.accuracy,
        found_at: new Date(fix.timestamp).toISOString(),
      });
      if (insert.error) throw insert.error;
      setFind({
        photoUri: photo.uri,
        latitude: fix.coords.latitude,
        longitude: fix.coords.longitude,
        accuracy: fix.coords.accuracy,
        timestamp: fix.timestamp,
      });
    } catch (e) {
      Alert.alert('Find not saved', (e as { message?: string }).message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  if (find) {
    return (
      <View style={styles.center}>
        <Image source={{ uri: find.photoUri }} style={styles.photo} />
        <Text style={styles.text}>Latitude: {find.latitude.toFixed(6)}</Text>
        <Text style={styles.text}>Longitude: {find.longitude.toFixed(6)}</Text>
        <Text style={styles.text}>Accuracy: ±{find.accuracy === null ? '?' : Math.round(find.accuracy)} m</Text>
        <Text style={styles.text}>Saved ✓</Text>
        <Text style={styles.text}>Time: {new Date(find.timestamp).toLocaleString()}</Text>
        <Pressable style={styles.button} onPress={() => setFind(null)}>
          <Text style={styles.buttonText}>New find</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={camera} style={styles.container} />
      <Pressable style={[styles.button, styles.shutter]} onPress={recordFind} disabled={busy}>
        {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Record find</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greyLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.greyLight },
  text: { color: colors.grey, fontSize: 16, marginVertical: 2, textAlign: 'center' },
  photo: { width: 240, height: 320, borderRadius: 8, marginBottom: 16 },
  button: { backgroundColor: colors.green, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 28, marginTop: 16 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  shutter: { position: 'absolute', bottom: 32, alignSelf: 'center' },
});
