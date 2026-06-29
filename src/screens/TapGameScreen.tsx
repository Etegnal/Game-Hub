import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import { getHighScore, saveHighScore } from '../utils/storage';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface TapGameScreenProps {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

const EMOJIS = ['🎯', '👾', '⚡', '🔥', '⭐️', '🦄', '🍎', '🦊', '🚀', '🍩'];
const TARGET_SIZE = 64;
const INITIAL_MAX_TIME = 1200; // ms
const MIN_MAX_TIME = 350; // ms
const DIFFICULTY_DECREASE_STEP = 65; // ms faster every 5 points

export const TapGameScreen: React.FC<TapGameScreenProps> = ({ onBack, onUpdateHighScore }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 100, y: 150 });
  const [currentEmoji, setCurrentEmoji] = useState('🎯');

  // Container dimensions
  const [containerSize, setContainerSize] = useState({ width: 300, height: 400 });

  // Animation values
  const timerAnim = useRef(new Animated.Value(1)).current;
  const targetScaleAnim = useRef(new Animated.Value(0)).current;

  // Active timers
  const timerRef = useRef<Animated.CompositeAnimation | null>(null);

  // Load high score
  useEffect(() => {
    const loadScore = async () => {
      const scoreValue = await getHighScore('tapGame');
      setHighScore(scoreValue);
    };
    loadScore();
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, []);

  // Calculate speed based on current score
  const getMaxTime = (currentScore: number) => {
    const speedLevels = Math.floor(currentScore / 5);
    const calculatedTime = INITIAL_MAX_TIME - speedLevels * DIFFICULTY_DECREASE_STEP;
    return Math.max(MIN_MAX_TIME, calculatedTime);
  };

  // Spawn Target at random position
  const spawnTarget = () => {
    const maxX = containerSize.width - TARGET_SIZE - 20;
    const maxY = containerSize.height - TARGET_SIZE - 20;

    // Ensure we don't get negative positions on tiny layouts
    const randomX = Math.max(10, Math.floor(Math.random() * Math.max(maxX, 10)));
    const randomY = Math.max(10, Math.floor(Math.random() * Math.max(maxY, 10)));

    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    setTargetPos({ x: randomX, y: randomY });
    setCurrentEmoji(randomEmoji);

    // Bounce target scale animation
    targetScaleAnim.setValue(0);
    Animated.spring(targetScaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      friction: 5,
      tension: 150,
    }).start();
  };

  // Start the timer bar animation
  const startTimer = (currentScore: number) => {
    if (timerRef.current) {
      timerRef.current.stop();
    }

    timerAnim.setValue(1);
    const duration = getMaxTime(currentScore);

    timerRef.current = Animated.timing(timerAnim, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false, // width/scale animations don't support native driver well
    });

    timerRef.current.start(({ finished }) => {
      if (finished) {
        handleGameOver();
      }
    });
  };

  const handleStartGame = () => {
    setScore(0);
    setGameState('PLAYING');
    spawnTarget();
    startTimer(0);
  };

  const handleTargetTap = () => {
    if (gameState !== 'PLAYING') return;

    const newScore = score + 1;
    setScore(newScore);
    spawnTarget();
    startTimer(newScore);
  };

  const handleGameOver = async () => {
    setGameState('GAMEOVER');
    if (timerRef.current) {
      timerRef.current.stop();
    }

    // Save score if it's a new high score
    const isNewHigh = await saveHighScore('tapGame', score);
    if (isNewHigh) {
      setHighScore(score);
      onUpdateHighScore(); // Refresh score in home screen
    }
  };

  const handlePlayAgain = () => {
    handleStartGame();
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation & Status Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>SKOR: <Text style={styles.scoreNumber}>{score}</Text></Text>
        </View>

        <View style={styles.speedIndicator}>
          <Text style={styles.speedText}>
            Hız: {((1000 / getMaxTime(score)).toFixed(1))}x
          </Text>
        </View>
      </View>

      {/* Countdown Timer Bar */}
      <View style={styles.timerBarContainer}>
        <Animated.View
          style={[
            styles.timerBar,
            {
              width: timerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: timerAnim.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: ['#FF4466', '#FFB020', colors.accent],
              }),
            },
          ]}
        />
      </View>

      {/* Main Play Area */}
      <View
        style={styles.playArea}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ width, height });
        }}
      >
        {gameState === 'START' && (
          <View style={styles.centeredContent}>
            <Text style={styles.gameTitle}>🎯 DOKUNMA OYUNU</Text>
            <Text style={styles.gameInstructions}>
              Rastgele beliren emojilere süre bitmeden dokun! Her 5 puanda süre kısalır.
            </Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleStartGame}>
              <Text style={styles.actionButtonText}>BAŞLA</Text>
            </TouchableOpacity>
            <Text style={styles.highScoreText}>En Yüksek Skor: {highScore}</Text>
          </View>
        )}

        {gameState === 'PLAYING' && (
          <Animated.View
            style={[
              styles.target,
              {
                left: targetPos.x,
                top: targetPos.y,
                transform: [{ scale: targetScaleAnim }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.targetInner}
              onPress={handleTargetTap}
            >
              <Text style={styles.targetEmoji}>{currentEmoji}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Game Over Modal */}
      <Modal visible={gameState === 'GAMEOVER'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Oyun Bitti! 😢</Text>
            
            <View style={styles.modalStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Skorun</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>En Yüksek</Text>
                <Text style={styles.statValue}>{highScore}</Text>
              </View>
            </View>

            {score >= highScore && score > 0 && (
              <View style={styles.newRecordBadge}>
                <Text style={styles.newRecordText}>🎉 YENİ REKOR! 🎉</Text>
              </View>
            )}

            <TouchableOpacity style={styles.modalButtonPrimary} onPress={handlePlayAgain}>
              <Text style={styles.modalButtonTextPrimary}>TEKRAR OYNA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButtonSecondary} onPress={onBack}>
              <Text style={styles.modalButtonTextSecondary}>ANA MENÜ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    backgroundColor: 'rgba(0, 196, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
  },
  scoreText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  scoreNumber: {
    color: colors.accent,
    fontWeight: '900',
  },
  speedIndicator: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  speedText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  timerBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  timerBar: {
    height: '100%',
  },
  playArea: {
    flex: 1,
    position: 'relative',
    margin: 15,
    backgroundColor: colors.surfaceSolid,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  gameTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  gameInstructions: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  actionButtonText: {
    fontFamily: fonts.display,
    color: colors.bg,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  highScoreText: {
    fontFamily: fonts.body,
    marginTop: 20,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
  },
  targetInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 196, 255, 0.15)',
    borderRadius: TARGET_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  targetEmoji: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.surfaceSolid,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '45%',
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '900',
    color: colors.accent,
    marginTop: 4,
  },
  newRecordBadge: {
    backgroundColor: 'rgba(0, 229, 160, 0.12)',
    borderColor: colors.success,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  newRecordText: {
    fontFamily: fonts.body,
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  modalButtonPrimary: {
    backgroundColor: colors.accent,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonTextPrimary: {
    fontFamily: fonts.display,
    color: colors.bg,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonTextSecondary: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
