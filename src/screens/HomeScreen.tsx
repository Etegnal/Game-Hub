import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { DynamicIsland } from '../components/DynamicIsland';
import { GradientText } from '../components/GradientText';
import { AmbientBackground } from '../components/AmbientBackground';
import { GameGridCard } from '../components/game/GameGridCard';
import { GAMES } from '../games/registry';
import type { GameScreenId, GameScoreKey } from '../games/types';
import { colors } from '../theme/colors';
import { fonts, loadWebFonts } from '../theme/typography';
import { useBodyScrollLayout } from '../utils/webShell';

const GRID_GAP = 10;
const COLS = 3;
const H_PAD = 20;

interface HomeScreenProps {
  onNavigate: (screen: GameScreenId) => void;
  highScores: Record<GameScoreKey, number>;
}

function HomeContent({
  onNavigate,
  highScores,
  cardSize,
}: HomeScreenProps & { cardSize: number }) {
  return (
    <>
      <View style={styles.heroSection}>
        <GradientText size={26}>Eternal Game Hub</GradientText>
        <Text style={styles.tagline}>7 oyun · Rekor kır · Dostlarınla yarış</Text>
        <View style={styles.heroDivider}>
          <View style={styles.heroLine} />
          <Text style={styles.heroStar}>✦</Text>
          <View style={styles.heroLine} />
        </View>
      </View>

      <Text style={styles.sectionLabel}>OYUNLAR</Text>
      <View style={styles.grid}>
        {Array.from({ length: Math.ceil(GAMES.length / COLS) }, (_, rowIdx) => (
          <View key={rowIdx} style={styles.gridRow}>
            {GAMES.slice(rowIdx * COLS, rowIdx * COLS + COLS).map((game) => (
              <GameGridCard
                key={game.id}
                game={game}
                bestScore={highScores[game.scoreKey]}
                size={cardSize}
                onPress={() => onNavigate(game.id)}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.leaderboard}>
        <Text style={styles.leaderTitle}>🏆 Lider Tablosu</Text>
        {GAMES.map((game, i) => (
          <View
            key={game.scoreKey}
            style={[styles.leaderRow, i < GAMES.length - 1 && styles.leaderBorder]}
          >
            <Text style={styles.leaderEmoji}>{game.emoji}</Text>
            <Text style={styles.leaderName}>{game.title}</Text>
            <Text style={[styles.leaderScore, { color: game.accent }]}>
              {highScores[game.scoreKey]}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, highScores }) => {
  const bodyScroll = useBodyScrollLayout();
  const { width } = useWindowDimensions();
  const cardSize = Math.floor((width - H_PAD * 2 - GRID_GAP * (COLS - 1)) / COLS);

  useEffect(() => {
    loadWebFonts();
  }, []);

  const content = (
    <HomeContent onNavigate={onNavigate} highScores={highScores} cardSize={cardSize} />
  );

  return (
    <SafeAreaView style={[styles.safeArea, bodyScroll && styles.safeAreaBodyScroll]}>
      <AmbientBackground />
      <View style={[styles.container, bodyScroll && styles.containerBodyScroll]}>
        <DynamicIsland title="ETERNAL GAME HUB" subtitle="Arcade Collection" badge="v1.0" />

        {bodyScroll ? (
          <View style={styles.scrollContent}>{content}</View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeAreaBodyScroll: {
    flex: 0,
    minHeight: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: H_PAD,
    backgroundColor: colors.bg,
  },
  containerBodyScroll: {
    flex: 0,
    width: '100%',
    paddingBottom: 32,
  },
  scrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bg,
    ...Platform.select({ web: { minHeight: 0 } }),
  },
  scrollContent: {
    paddingVertical: 8,
    alignItems: 'center',
    width: '100%',
    paddingBottom: 36,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 10,
    width: '100%',
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  heroDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    width: '70%',
  },
  heroLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glassBorder,
    marginHorizontal: 5,
  },
  heroStar: {
    color: colors.accentSoft,
    fontSize: 12,
    marginHorizontal: 5,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentSoft,
    letterSpacing: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 4,
    width: '100%',
  },
  grid: {
    width: '100%',
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  leaderboard: {
    width: '100%',
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 22,
    padding: 16,
    marginBottom: 8,
  },
  leaderTitle: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leaderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  leaderEmoji: {
    fontSize: 16,
    width: 28,
  },
  leaderName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  leaderScore: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '900',
  },
});
