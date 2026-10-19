import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { fetchProfiles, login, forgotPassword } from '../services/authApi';

export default function LoginScreen({ onLoginSuccess, onGoToSignup }) {
  const { width } = useWindowDimensions();
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState('');

  const numColumns = width >= 900 ? 4 : width >= 600 ? 3 : 2;

  useEffect(() => {
    fetchProfiles().then((data) => {
      setProfiles(data);
      setLoadingProfiles(false);
    });
  }, []);

  const handleSelectProfile = (profile) => {
    if (!profile.verified) return;
    setSelected(profile);
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);
    const result = await login(selected.id, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    onLoginSuccess?.(result.profile);
  };

  const handleForgotPassword = async () => {
  setError('');
  setInfo('');
  const result = await forgotPassword(selected.id);
  if (!result.success) {
    setError(result.error);
    return;
  }
  setInfo('Reset link sent! Check your email (and spam folder).');
};

  if (loadingProfiles) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (selected) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.passwordCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{selected.name.charAt(0)}</Text>
          </View>
          <Text style={styles.title}>{selected.name}</Text>
          <Text style={styles.subtitle}>Enter your password</Text>

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9AA0A6"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoFocus
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!!info && <Text style={styles.infoText}>{info}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={submitting || !password}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => setSelected(null)}>
            <Text style={styles.backText}>← Choose a different profile</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <Text style={styles.headerTitle}>Who's logging in?</Text>
      <FlatList
        key={numColumns}
        data={profiles}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.profileTile, !item.verified && styles.profileTilePending]}
            onPress={() => handleSelectProfile(item)}
            activeOpacity={item.verified ? 0.7 : 1}
          >
            <View style={[styles.avatar, !item.verified && styles.avatarPending]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.profileName}>{item.name}</Text>
            {!item.verified && <Text style={styles.pendingLabel}>Pending approval</Text>}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.createLink} onPress={onGoToSignup}>
        <Text style={styles.createLinkText}>+ Create a new profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F6F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F6F8' },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
  },
  grid: { paddingHorizontal: 16, alignItems: 'center' },
  profileTile: { alignItems: 'center', margin: 12, width: 120 },
  profileTilePending: { opacity: 0.5 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#5d4738',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarPending: { backgroundColor: '#9CA3AF' },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  profileName: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'center' },
  pendingLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  createLink: { alignSelf: 'center', marginVertical: 24 },
  createLinkText: { color: '#5d4738', fontWeight: '600', fontSize: 14 },
  passwordCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#5d4738',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  input: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  errorText: { color: '#DC2626', fontSize: 13, marginBottom: 12 },
  button: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#5d4738',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: { color: '#16A34A', fontSize: 13, marginBottom: 12 },
  forgotButton: { marginTop: 16 },
  forgotText: { color: '#5d4738', fontSize: 13, fontWeight: '600' },  
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  backButton: { marginTop: 20 },
  backText: { color: '#6B7280', fontSize: 13 },
});