import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Animated, Platform } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const LOG_SIZE = 140;
const KNIFE_W = 8;
const KNIFE_H = 50;
const TARGET_Y = 120; // Y center of the log inside the play area

interface Knife {
  id: number;
  angle: number; // Relative angle on the log
}

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const KnifeHitScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'knifeHit',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [logAngle, setLogAngle] = useState(0);
  const [knives, setKnives] = useState<Knife[]>([]);
  const [isThrowing, setIsThrowing] = useState(false);

  const angleRef = useRef(0);
  const speedRef = useRef(1.8);
  const dirRef = useRef(1);
  const knivesRef = useRef<Knife[]>([]);
  const frameRef = useRef<number | null>(null);

  // Knife throw animation
  const knifeYAnim = useRef(new Animated.Value(320)).current; // Starting Y position at bottom of container

  const endGame = async () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  const scoreRef = useRef(0);

  useEffect(() => {
    if (phase !== 'play') return;
    let last = Date.now();
    let changeTimer = 0;

    const loop = () => {
      const now = Date.now();
      const dt = (now - last) / 16;
      last = now;

      // Randomly change speed and direction of log to make it challenging
      changeTimer += dt;
      if (changeTimer > 90) {
        changeTimer = 0;
        if (Math.random() > 0.6) {
          dirRef.current *= -1;
        }
        speedRef.current = 1.2 + Math.random() * 2.2 + (scoreRef.current * 0.08);
      }

      angleRef.current = (angleRef.current + dirRef.current * speedRef.current * dt) % 360;
      if (angleRef.current < 0) angleRef.current += 360;
      setLogAngle(angleRef.current);

      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [phase]);

  const startGame = () => {
    resetScore();
    scoreRef.current = 0;
    knivesRef.current = [];
    setKnives([]);
    setIsThrowing(false);
    knifeYAnim.setValue(320);
    speedRef.current = 1.8;
    dirRef.current = 1;
    angleRef.current = 0;
    setLogAngle(0);
    setPhase('play');
  };

  const throwKnife = () => {
    if (phase !== 'play' || isThrowing) return;
    setIsThrowing(true);

    // Animate knife shooting up
    Animated.timing(knifeYAnim, {
      toValue: TARGET_Y + LOG_SIZE / 2 - 10,
      duration: 120,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleKnifeHit();
      }
    });
  };

  const handleKnifeHit = () => {
    // A knife thrown from bottom hits at exactly 180 degrees (6 o'clock in CSS space)
    // Relative angle on the log is (180 - logAngle)
    const hitAngle = (180 - angleRef.current + 360) % 360;

    // Check collision with existing knives
    const collision = knivesRef.current.some((k) => {
      let diff = Math.abs(k.angle - hitAngle) % 360;
      if (diff > 180) diff = 360 - diff;
      return diff < 15; // 15 degrees tolerance
    });

    if (collision) {
      endGame();
    } else {
      // Success: add knife to log
      const newKnife = { id: Date.now(), angle: hitAngle };
      knivesRef.current.push(newKnife);
      setKnives([...knivesRef.current]);

      scoreRef.current += 1;
      setScore(scoreRef.current);

      // Increase speed slightly
      speedRef.current = speedRef.current + 0.1;

      // Reset throw animation
      knifeYAnim.setValue(320);
      setIsThrowing(false);
    }
  };

  return (
    <GameShell title="BIÇAK FIRLAT" score={score} accent="#10B981" onBack={onBack}>
      <Pressable style={styles.area} onPress={throwKnife}>
        <View style={styles.gameContainer}>
          {/* Dönen Kütük (Log Target) */}
          <View
            style={[
              styles.log,
              {
                transform: [{ rotate: `${logAngle}deg` }],
              },
            ]}
          >
            <View style={styles.logCore} />
            <Text style={styles.logTargetEmoji}>🎯</Text>

            {/* Kütüğe saplanmış bıçaklar */}
            {knives.map((k) => (
              <View
                key={k.id}
                style={[
                  styles.embeddedKnifeWrap,
                  {
                    transform: [{ rotate: `${k.angle}deg` }],
                  },
                ]}
              >
                <View style={styles.knifeBlade} />
                <View style={styles.knifeHandle} />
              </View>
            ))}
          </View>

          {/* Fırlatılan Bıçak (Flying Knife) */}
          <Animated.View
            style={[
              styles.flyingKnife,
              {
                top: knifeYAnim,
                opacity: isThrowing ? 1 : 0.8,
              },
            ]}
          >
            <View style={styles.knifeBlade} />
            <View style={styles.knifeHandle} />
          </Animated.View>
        </View>
        <Text style={styles.hint}>Dokun → Bıçağı fırlat · Diğer bıçaklara çarpma</Text>
      </Pressable>

      {phase === 'start' && (
        <StartOverlay
          emoji="🗡️"
          title="Bıçak Fırlat"
          instructions="Dönen kütüğe bıçakları sapla. Önceden saplanmış olan bıçaklara çarparsan yanarsın!"
          highScore={highScore}
          accent="#10B981"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#10B981"
        onReplay={() => setPhase('start')}
        onHome={onBack}
      />
    </GameShell>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#051210',
  },
  gameContainer: {
    width: 280,
    height: 400,
    position: 'relative',
    alignItems: 'center',
  },
  log: {
    position: 'absolute',
    top: TARGET_Y - LOG_SIZE / 2,
    width: LOG_SIZE,
    height: LOG_SIZE,
    borderRadius: LOG_SIZE / 2,
    backgroundColor: '#8B4513', // Wood brown
    borderWidth: 6,
    borderColor: '#A0522D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  logCore: {
    width: LOG_SIZE - 40,
    height: LOG_SIZE - 40,
    borderRadius: (LOG_SIZE - 40) / 2,
    borderWidth: 2,
    borderColor: '#CD853F',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  logTargetEmoji: {
    position: 'absolute',
    fontSize: 32,
  },
  embeddedKnifeWrap: {
    position: 'absolute',
    width: KNIFE_W,
    height: LOG_SIZE + KNIFE_H * 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: -KNIFE_H,
  },
  flyingKnife: {
    position: 'absolute',
    width: KNIFE_W,
    height: KNIFE_H,
    alignItems: 'center',
  },
  knifeBlade: {
    width: KNIFE_W,
    height: KNIFE_H * 0.65,
    backgroundColor: '#E2E8F0', // Silver metal color
    borderTopLeftRadius: KNIFE_W / 2,
    borderTopRightRadius: KNIFE_W / 2,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  knifeHandle: {
    width: KNIFE_W - 2,
    height: KNIFE_H * 0.35,
    backgroundColor: '#EF4444', // Red handle
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  hint: {
    marginTop: 20,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
