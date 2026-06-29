import React, { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { GameDefinition } from '../../games/types';

interface GameGridCardProps {
  game: GameDefinition;
  bestScore: number;
  size: number;
  onPress: () => void;
}

export const GameGridCard: React.FC<GameGridCardProps> = ({ game, bestScore, size, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: Platform.OS !== 'web',
      friction: 6,
      tension: 140,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      friction: 6,
      tension: 140,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: size, marginBottom: 12 }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={({ pressed }) => [styles.card, { width: size, opacity: pressed ? 0.92 : 1 }]}
      >
        <View style={[styles.glowBorder, { backgroundColor: game.gradient[0] + '33' }]} />
        <View style={[styles.inner, { borderColor: game.accent + '55' }]}>
          <View style={[styles.emojiBox, { backgroundColor: game.accent + '22' }]}>
            <Text style={styles.emoji}>{game.emoji}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {game.title}
          </Text>
          <View style={[styles.scoreChip, { borderColor: game.accent + '44' }]}>
            <Text style={[styles.scoreText, { color: game.accent }]}>{bestScore}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  glowBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
  },
  inner: {
    flex: 1,
    margin: 2,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(10,18,40,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 14,
    minHeight: 28,
  },
  scoreChip: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scoreText: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '900',
  },
});
