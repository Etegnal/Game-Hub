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
  
  const isSmall = size < 110;
  const emojiBoxSize = isSmall ? 38 : 46;
  const emojiFontSize = isSmall ? 20 : 24;
  const titleFontSize = isSmall ? 9.5 : 11;
  const scoreFontSize = isSmall ? 9.5 : 11;
  const cardPadding = isSmall ? 4 : 8;

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
    <Animated.View style={{ transform: [{ scale }], width: size, marginBottom: 10 }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={({ pressed }) => [styles.card, { width: size, opacity: pressed ? 0.92 : 1 }]}
      >
        <View style={[styles.glowBorder, { backgroundColor: game.gradient[0] + '22' }]} />
        <View style={[styles.inner, { borderColor: game.accent + '33', padding: cardPadding }]}>
          <View style={[styles.emojiBox, { backgroundColor: game.accent + '15', width: emojiBoxSize, height: emojiBoxSize, borderRadius: isSmall ? 10 : 14 }]}>
            <Text style={[styles.emoji, { fontSize: emojiFontSize }]}>{game.emoji}</Text>
          </View>
          <Text style={[styles.title, { fontSize: titleFontSize, lineHeight: isSmall ? 12 : 14 }]} numberOfLines={2}>
            {game.title}
          </Text>
          <View style={[styles.scoreChip, { borderColor: game.accent + '33', marginTop: isSmall ? 3 : 6 }]}>
            <Text style={[styles.scoreText, { color: game.accent, fontSize: scoreFontSize }]}>{bestScore}</Text>
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
    backgroundColor: 'rgba(9,15,32,0.95)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emojiBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.body,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginVertical: 2,
  },
  scoreChip: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scoreText: {
    fontFamily: fonts.display,
    fontWeight: '900',
  },
});
