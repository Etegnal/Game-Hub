import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface GameShellProps {
  title: string;
  score: number;
  accent?: string;
  extra?: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({
  title,
  score,
  accent = colors.accent,
  extra,
  onBack,
  children,
}) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>✕</Text>
      </TouchableOpacity>
      <View style={[styles.titlePill, { borderColor: accent + '66' }]}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <View style={[styles.scorePill, { borderColor: accent + '66' }]}>
        <Text style={styles.scoreLabel}>SKOR</Text>
        <Text style={[styles.scoreValue, { color: accent }]}>{score}</Text>
      </View>
    </View>
    {extra}
    <View style={styles.body}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 24,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  titlePill: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  scorePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
  },
  scoreValue: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    margin: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surfaceSolid,
    overflow: 'hidden',
  },
});
