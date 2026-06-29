import React from 'react';
import { StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface DynamicIslandProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ title, subtitle, badge }) => {
  const { width } = useWindowDimensions();
  const maxPillWidth = Math.min(width - 40, 380);

  return (
    <View style={styles.container}>
      <View style={[styles.pill, { width: maxPillWidth }]}>
        <View style={styles.glowLine} />
        <View style={styles.leftSection}>
          <View style={styles.liveDot} />
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 12,
  },
  pill: {
    height: 52,
    backgroundColor: 'rgba(8, 14, 28, 0.92)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      web: { backdropFilter: 'blur(16px)' },
    }),
  },
  glowLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: colors.accentSoft,
    opacity: 0.35,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.4,
  },
  badgeContainer: {
    backgroundColor: 'rgba(0, 196, 255, 0.15)',
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 10,
  },
  badgeText: {
    fontFamily: fonts.body,
    color: colors.accentSoft,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
