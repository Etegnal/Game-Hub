import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
} from 'react-native';
import { GradientText } from '../components/GradientText';
import { AmbientBackground } from '../components/AmbientBackground';
import { registerUser } from '../utils/firebase';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { GameScreenId } from '../games/types';

interface Props {
  onNavigate: (screen: GameScreenId) => void;
}

export const RegisterScreen: React.FC<Props> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (password.length < 4) {
      setError('Şifre en az 4 karakter uzunluğunda olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const res = await registerUser(username, password);
    setLoading(false);

    if (res.success) {
      setSuccess('Hesabın başarıyla oluşturuldu! Giriş ekranına yönlendiriliyorsun...');
      setTimeout(() => {
        onNavigate('LOGIN');
      }, 1500);
    } else {
      setError(res.error || 'Kayıt sırasında bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AmbientBackground />
      <View style={styles.container}>
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('LOGIN')}>
          <Text style={styles.backText}>◀ Giriş Ekranı</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.logoIcon}>∞</Text>
          <GradientText size={26}>Kayıt Ol</GradientText>
          <Text style={styles.subtitle}>Yeni bir oyuncu hesabı oluştur!</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>🎉 {success}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>KULLANICI ADI</Text>
            <TextInput
              style={styles.input}
              placeholder="Oyuncu adını belirle..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ŞİFRE</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 4 karakter gir..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ŞİFREYİ ONAYLA</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifreni tekrar yaz..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Hesap Oluşturuluyor...' : 'HESAP OLUŞTUR'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(9,15,32,0.96)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 44,
    fontWeight: '900',
    color: '#00D4FF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  successBox: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  successText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#34D399',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentSoft,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    color: '#FFF',
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00D4FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '900',
    color: colors.bg,
    letterSpacing: 1.5,
  },
});
