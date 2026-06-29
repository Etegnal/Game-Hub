import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, Animated, Platform, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  accentColor?: string;
  subtitle?: string;
  emoji?: string;
  variant?: 'active' | 'locked';
  badge?: string;
}

export const GameButton: React.FC<GameButtonProps> = ({
  title,
  onPress,
  accentColor = colors.tapGame,
  subtitle,
  emoji = '🎮',
  variant = 'active',
  badge,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isLocked = variant === 'locked';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: Platform.OS !== 'web',
      tension: 120,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      tension: 120,
      friction: 6,
    }).start();
  };

  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          isLocked ? styles.cardLocked : styles.cardActive,
          {
            borderColor: isLocked ? colors.glassBorder : accentColor + '55',
            shadowColor: isLocked ? 'transparent' : accentColor,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={[styles.iconRing, { borderColor: accentColor + (isLocked ? '33' : '88') }]}>
          <View style={[styles.iconInner, { backgroundColor: accentColor + (isLocked ? '18' : '28') }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        </View>

        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isLocked && styles.titleLocked]}>{title}</Text>
            {badge && (
              <View style={[styles.badge, { backgroundColor: accentColor + '22', borderColor: accentColor + '44' }]}>
                <Text style={[styles.badgeText, { color: accentColor }]}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={[styles.subtitle, isLocked && styles.subtitleLocked]}>{subtitle}</Text>
          )}
        </View>

        <View style={[styles.playDot, { backgroundColor: isLocked ? colors.textMuted : accentColor }]}>
          <Text style={styles.playArrow}>{isLocked ? '🔒' : '▶'}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
    marginVertical: 7,
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.surface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
      },
    }),
  },
  cardActive: {
    backgroundColor: 'rgba(10, 22, 48, 0.85)',
  },
  cardLocked: {
    backgroundColor: 'rgba(8, 14, 28, 0.6)',
    borderStyle: 'dashed',
  },
  iconRing: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  textBlock: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  titleLocked: {
    color: colors.textSecondary,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  subtitleLocked: {
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  playDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playArrow: {
    fontSize: 12,
    color: colors.textPrimary,
  },
});
