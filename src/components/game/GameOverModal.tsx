import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  highScore: number;
  isNewRecord: boolean;
  accent?: string;
  onReplay: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  highScore,
  isNewRecord,
  accent = colors.accent,
  onReplay,
  onHome,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={[styles.card, { borderColor: accent + '55' }]}>
        <Text style={styles.title}>Oyun Bitti</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Skor</Text>
            <Text style={[styles.statValue, { color: accent }]}>{score}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rekor</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{highScore}</Text>
          </View>
        </View>

        {isNewRecord && score > 0 && (
          <View style={[styles.badge, { borderColor: colors.success }]}>
            <Text style={styles.badgeText}>🎉 YENİ REKOR!</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: accent }]}
          onPress={onReplay}
        >
          <Text style={styles.primaryBtnText}>TEKRAR OYNA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onHome}>
          <Text style={styles.secondaryBtnText}>ANA MENÜ</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceSolid,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 14,
    marginHorizontal: 6,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  badge: {
    borderWidth: 1,
    backgroundColor: 'rgba(0,229,160,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: fonts.body,
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    fontFamily: fonts.display,
    color: colors.bg,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  secondaryBtnText: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
