import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { DynamicIsland } from '../components/DynamicIsland';
import { AmbientBackground } from '../components/AmbientBackground';
import { colors } from '../theme/colors';
import { fonts, loadWebFonts } from '../theme/typography';

interface EscapeGameScreenProps {
  onBack: () => void;
}

export const EscapeGameScreen: React.FC<EscapeGameScreenProps> = ({ onBack }) => {
  useEffect(() => {
    loadWebFonts();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AmbientBackground />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <DynamicIsland title="KAÇIŞ OYUNU" subtitle="Eternal Game Hub" badge="YAKINDA" />

        <View style={styles.content}>
          <View style={styles.iconGlow}>
            <Text style={styles.emoji}>🚧</Text>
          </View>
          <Text style={styles.title}>Yapım Aşamasında</Text>
          <Text style={styles.description}>
            Engellerden sıyrılarak hayatta kalmaya çalışacağın Kaçış Oyunu çok yakında burada olacak!
          </Text>
          <TouchableOpacity style={styles.homeButton} onPress={onBack}>
            <Text style={styles.homeButtonText}>ANA MENÜYE DÖN</Text>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginBottom: 60,
  },
  iconGlow: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: colors.escapeGame + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  homeButtonText: {
    fontFamily: fonts.display,
    color: colors.bg,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
