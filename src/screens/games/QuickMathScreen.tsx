import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

const TIME_MS = 1500;

interface Question {
  text: string;
  isCorrect: boolean;
}

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

function buildQuestion(): Question {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const op = Math.random() > 0.5 ? '+' : '-';
  const real = op === '+' ? a + b : a - b;
  const showWrong = Math.random() > 0.5;
  const shown = showWrong ? real + (Math.random() > 0.5 ? 1 : -1) : real;
  return {
    text: `${a} ${op} ${b} = ${shown}`,
    isCorrect: shown === real,
  };
}

export const QuickMathScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'quickMath',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [question, setQuestion] = useState<Question>(buildQuestion());
  const timerAnim = useRef(new Animated.Value(1)).current;
  const scoreRef = useRef(0);
  const timerRef = useRef<Animated.CompositeAnimation | null>(null);

  const stopTimer = () => {
    timerRef.current?.stop();
    timerRef.current = null;
  };

  const endGame = useCallback(async () => {
    stopTimer();
    setPhase('over');
    await finishGame(scoreRef.current);
  }, [finishGame]);

  const nextQuestion = useCallback(() => {
    setQuestion(buildQuestion());
    timerAnim.setValue(1);
    stopTimer();
    const duration = Math.max(650, TIME_MS - scoreRef.current * 45);
    timerRef.current = Animated.timing(timerAnim, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false,
    });
    timerRef.current.start(({ finished }) => {
      if (finished) endGame();
    });
  }, [timerAnim, endGame]);

  useEffect(() => {
    if (phase === 'play') nextQuestion();
    return stopTimer;
  }, [phase]);

  const startGame = () => {
    resetScore();
    scoreRef.current = 0;
    setPhase('play');
  };

  const answer = (userSaysCorrect: boolean) => {
    if (phase !== 'play') return;
    stopTimer();
    if (userSaysCorrect === question.isCorrect) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      nextQuestion();
    } else {
      endGame();
    }
  };

  return (
    <GameShell title="HIZLI MATEMATİK" score={score} accent="#F472B6" onBack={onBack}>
      <View style={styles.area}>
        <View style={styles.timerTrack}>
          <Animated.View
            style={[
              styles.timerFill,
              {
                width: timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              },
            ]}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.equation}>{question.text}</Text>
          <Text style={styles.sub}>İşlem doğru mu?</Text>
        </View>

        <View style={styles.buttons}>
          <Pressable style={[styles.btn, styles.btnYes]} onPress={() => answer(true)}>
            <Text style={styles.btnText}>✓ DOĞRU</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnNo]} onPress={() => answer(false)}>
            <Text style={styles.btnText}>✗ YANLIŞ</Text>
          </Pressable>
        </View>
      </View>

      {phase === 'start' && (
        <StartOverlay
          emoji="🧮"
          title="Hızlı Matematik"
          instructions="1.5 saniyede işlemin doğru olup olmadığına karar ver. Hata = oyun biter."
          highScore={highScore}
          accent="#F472B6"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#F472B6"
        onReplay={() => setPhase('start')}
        onHome={onBack}
      />
    </GameShell>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    padding: 20,
    backgroundColor: '#100818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 32,
  },
  timerFill: {
    height: '100%',
    backgroundColor: '#F472B6',
    borderRadius: 4,
  },
  card: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F472B666',
    backgroundColor: 'rgba(244,114,182,0.08)',
    alignItems: 'center',
    marginBottom: 32,
  },
  equation: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  sub: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  btnYes: {
    backgroundColor: 'rgba(0,229,160,0.15)',
    borderColor: colors.success,
  },
  btnNo: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: '#EF4444',
  },
  btnText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
});
