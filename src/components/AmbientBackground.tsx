import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export const AmbientBackground: React.FC = () => (
  <View style={styles.container} pointerEvents="none">
    <View style={[styles.orb, styles.orbTop]} />
    <View style={[styles.orb, styles.orbBottom]} />
    <View style={styles.gridOverlay} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTop: {
    width: 280,
    height: 280,
    top: -80,
    right: -60,
    backgroundColor: colors.accentGlow,
    opacity: 0.55,
  },
  orbBottom: {
    width: 220,
    height: 220,
    bottom: 120,
    left: -70,
    backgroundColor: 'rgba(26, 35, 126, 0.45)',
    opacity: 0.7,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.04,
    backgroundColor: colors.accent,
  },
});
