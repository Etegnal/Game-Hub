import React from 'react';
import { StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';

interface DynamicIslandProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ title, subtitle, badge }) => {
  const { width } = useWindowDimensions();
  // Ensure the pill adapts to screen width, capped at a nice size
  const maxPillWidth = Math.min(width - 40, 360);

  return (
    <View style={styles.container}>
      <View style={[styles.pill, { width: maxPillWidth }]}>
        <View style={styles.leftSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
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
    paddingTop: Platform.OS === 'ios' ? 10 : 25, // Account for status bar spacing
    paddingBottom: 15,
  },
  pill: {
    height: 48,
    backgroundColor: '#1E1E24', // Premium dark grey/black
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFDF6', // Pastel light color
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#A0A0AB',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  badgeContainer: {
    backgroundColor: '#7052FF', // Purple brand accent
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
