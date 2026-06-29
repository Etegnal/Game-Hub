import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
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
    </>
  );
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, highScores }) => {
  const bodyScroll = useBodyScrollLayout();
  const { width } = useWindowDimensions();
  const cardSize = Math.floor((width - H_PAD * 2 - GRID_GAP * (COLS - 1)) / COLS);
  const [scoresVisible, setScoresVisible] = useState(false);

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
        
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <View style={styles.logoContainer}>
            <Text style={styles.infinityLogo}>∞</Text>
            <Text style={styles.logoText}>ETERNAL</Text>
          </View>
          <TouchableOpacity 
            style={styles.trophyButton} 
            onPress={() => setScoresVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.trophyIcon}>🏆</Text>
          </TouchableOpacity>
        </View>

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

      {/* Leaderboard Modal */}
      <Modal visible={scoresVisible} transparent animationType="fade" onRequestClose={() => setScoresVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Lider Tablosu</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setScoresVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.leaderboardScroll} showsVerticalScrollIndicator={false}>
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
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    marginBottom: 12,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infinityLogo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00D4FF', // Beautiful neon blue infinity logo
    marginRight: 8,
    lineHeight: 32,
    marginTop: -4,
  },
  logoText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  trophyButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  trophyIcon: {
    fontSize: 18,
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
    marginVertical: 12,
    paddingHorizontal: 10,
    width: '100%',
  },
  heroDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '60%',
  },
  heroLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glassBorder,
    marginHorizontal: 5,
  },
  heroStar: {
    color: colors.accentSoft,
    fontSize: 10,
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
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: 'rgba(9,15,32,0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    padding: 20,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  modalCloseText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardScroll: {
    maxHeight: 320,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  leaderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  leaderEmoji: {
    fontSize: 18,
    width: 32,
  },
  leaderName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  leaderScore: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '900',
  },
});
