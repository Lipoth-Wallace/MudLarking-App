import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// The publishable key is meant to ship inside the app; row level security protects the data.
export const supabase = createClient(
  'https://sktsjudjfqcvbodawtdx.supabase.co',
  'sb_publishable_ipa775HOgKSf_oX89mvO4g_6QUP5kGa',
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } },
);
