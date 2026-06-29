import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { DynamicIsland } from '../components/DynamicIsland';
import { GameButton } from '../components/GameButton';
import { GradientText } from '../components/GradientText';
import { AmbientBackground } from '../components/AmbientBackground';
import { colors } from '../theme/colors';
import { fonts, loadWebFonts } from '../theme/typography';
import { useBodyScrollLayout } from '../utils/webShell';

interface HomeScreenProps {
  onNavigate: (screen: 'HOME' | 'TAP_GAME' | 'ESCAPE_GAME' | 'COLOR_GAME') => void;
  highScores: {
    tapGame: number;
    escapeGame: number;
    colorGame: number;
  };
}

const GAMES = [
  {
    id: 'TAP_GAME' as const,
    title: 'Dokunma Oyunu',
    subtitle: 'Hedefleri yakala, reflekslerini test et!',
    emoji: '🎯',
    accent: colors.tapGame,
    variant: 'active' as const,
  },
  {
    id: 'ESCAPE_GAME' as const,
    title: 'Kaçış Oyunu',
    subtitle: 'Engellerden sıyrıl, hayatta kal!',
    emoji: '🕹️',
    accent: colors.escapeGame,
    variant: 'locked' as const,
    badge: 'YAKINDA',
  },
  {
    id: 'COLOR_GAME' as const,
    title: 'Renk Oyunu',
    subtitle: 'Doğru renge hızlıca odaklan!',
    emoji: '🎨',
    accent: colors.colorGame,
    variant: 'locked' as const,
    badge: 'YAKINDA',
  },
];

function HomeContent({
  onNavigate,
  highScores,
}: HomeScreenProps) {
  const scores = [
    { label: 'Dokunma', emoji: '🎯', value: highScores.tapGame, accent: colors.tapGame },
    { label: 'Kaçış', emoji: '🕹️', value: highScores.escapeGame, accent: colors.escapeGame },
    { label: 'Renk', emoji: '🎨', value: highScores.colorGame, accent: colors.colorGame },
  ];

  return (
    <>
      <View style={styles.heroSection}>
        <GradientText size={28}>Eternal Game Hub</GradientText>
        <Text style={styles.tagline}>Reflekslerini test et · Rekor kır · Dostlarınla yarış</Text>
        <View style={styles.heroDivider}>
          <View style={styles.heroLine} />
          <Text style={styles.heroStar}>✦</Text>
          <View style={styles.heroLine} />
        </View>
      </View>

      <Text style={styles.sectionLabel}>OYUNLAR</Text>
      <View style={styles.buttonContainer}>
        {GAMES.map((game) => (
          <GameButton
            key={game.id}
            title={game.title}
            subtitle={game.subtitle}
            emoji={game.emoji}
            accentColor={game.accent}
            variant={game.variant}
            badge={game.badge}
            onPress={() => onNavigate(game.id)}
          />
        ))}
      </View>

      <View style={styles.scoreboard}>
        <View style={styles.scoreboardHeader}>
          <Text style={styles.scoreboardIcon}>🏆</Text>
          <Text style={styles.scoreboardTitle}>Lider Tablosu</Text>
        </View>

        {scores.map((item, index) => (
          <View
            key={item.label}
            style={[styles.scoreRow, index < scores.length - 1 && styles.scoreRowBorder]}
          >
            <View style={styles.scoreLeft}>
              <View style={[styles.scoreEmojiBg, { backgroundColor: item.accent + '22' }]}>
                <Text style={styles.scoreEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.scoreLabel}>{item.label}</Text>
            </View>
            <View style={[styles.scorePill, { borderColor: item.accent + '55' }]}>
              <Text style={[styles.scoreValue, { color: item.accent }]}>{item.value}</Text>
              <Text style={styles.scoreUnit}>puan</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

interface ScrollableProps {
  bodyScroll: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Scrollable({ bodyScroll, children, style }: ScrollableProps) {
  if (bodyScroll) {
    return <View style={[styles.scrollContent, style]}>{children}</View>;
  }

  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, highScores }) => {
  const bodyScroll = useBodyScrollLayout();

  useEffect(() => {
    loadWebFonts();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, bodyScroll && styles.safeAreaBodyScroll]}>
      <AmbientBackground />
      <View style={[styles.container, bodyScroll && styles.containerBodyScroll]}>
        <DynamicIsland title="ETERNAL GAME HUB" subtitle="Arcade Collection" badge="v1.0" />

        <Scrollable bodyScroll={bodyScroll}>
          <HomeContent onNavigate={onNavigate} highScores={highScores} />
        </Scrollable>
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
    paddingHorizontal: 20,
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
    ...Platform.select({
      web: { minHeight: 0 },
    }),
  },
  scrollContent: {
    paddingVertical: 8,
    alignItems: 'center',
    width: '100%',
    paddingBottom: 36,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 10,
    width: '100%',
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  heroDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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
    marginBottom: 4,
    marginLeft: 4,
    opacity: 0.85,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 20,
  },
  scoreboard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 22,
    padding: 18,
  },
  scoreboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  scoreboardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  scoreboardTitle: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scoreRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreEmojiBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  scoreEmoji: {
    fontSize: 16,
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  scoreValue: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '900',
    marginRight: 4,
  },
  scoreUnit: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
