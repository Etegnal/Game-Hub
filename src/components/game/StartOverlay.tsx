import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface StartOverlayProps {
  emoji: string;
  title: string;
  instructions: string;
  highScore: number;
  accent?: string;
  onStart: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  emoji,
  title,
  instructions,
  highScore,
  accent = colors.accent,
  onStart,
}) => (
  <View style={styles.overlay}>
    <View style={[styles.iconRing, { borderColor: accent + '88', shadowColor: accent }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.instructions}>{instructions}</Text>
    <TouchableOpacity style={[styles.btn, { backgroundColor: accent }]} onPress={onStart}>
      <Text style={styles.btnText}>BAŞLA</Text>
    </TouchableOpacity>
    <Text style={styles.highScore}>Rekor: {highScore}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7,11,20,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    zIndex: 10,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    marginBottom: 18,
  },
  emoji: {
    fontSize: 42,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 18,
    marginBottom: 14,
  },
  btnText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '900',
    color: colors.bg,
    letterSpacing: 1.5,
  },
  highScore: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
