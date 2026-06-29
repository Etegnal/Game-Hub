import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const { width: SW, height: SH } = Dimensions.get('window');
const AREA_W = SW - 48;
const AREA_H = SH * 0.55;
const BALL_R = 16;
const GRAVITY = 0.45;
const JUMP = -8;

interface Hoop {
  id: number;
  x: number;
  y: number;
  passed: boolean;
}

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const FlappyBasketScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'flappyBasket',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [ballY, setBallY] = useState(AREA_H / 2);
  const [ballX, setBallX] = useState(60);
  const vyRef = useRef(0);
  const [hoops, setHoops] = useState<Hoop[]>([]);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const spawnHoop = (existing: Hoop[]) => {
    idRef.current += 1;
    // Spawn hoops offscreen on the right so they scroll in naturally
    return [
      ...existing,
      {
        id: idRef.current,
        x: AREA_W + Math.random() * 40,
        y: 40 + Math.random() * (AREA_H - 140),
        passed: false,
      },
    ];
  };

  const endGame = async () => {
    if (phase !== 'play') return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    setHoops(spawnHoop([]));
    const loop = () => {
      vyRef.current += GRAVITY;
      setBallY((y) => {
        const ny = y + vyRef.current;
        if (ny < BALL_R || ny > AREA_H - BALL_R) {
          endGame();
          return y;
        }
        return ny;
      });
      setHoops((hs) => {
        const speed = 2.2 + scoreRef.current * 0.08; // progressive scroll speed
        let list = hs.map((h) => ({ ...h, x: h.x - speed })).filter((h) => h.x > -80);
        if (list.length < 2) list = spawnHoop(list);
        list.forEach((h) => {
          // Check collision with the center of the hoop rim
          // The rim width is 44px (center is x+22). The backboard is 48px, rim overlap is -4px, rim height is 44px (center is y+66)
          const rimCenterX = h.x + 22;
          const rimCenterY = h.y + 66;
          
          if (
            !h.passed &&
            Math.abs(60 - rimCenterX) < 18 &&
            Math.abs(ballY - rimCenterY) < 22
          ) {
            h.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        });
        return list;
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [phase, ballY]);

  const startGame = () => {
    resetScore();
    scoreRef.current = 0;
    vyRef.current = 0;
    setBallY(AREA_H / 2);
    setBallX(60);
    setHoops([]);
    setPhase('play');
  };

  const jump = () => {
    if (phase !== 'play') return;
    vyRef.current = JUMP;
  };

  return (
    <GameShell title="BASKET AT" score={score} accent="#FB923C" onBack={onBack}>
      <Pressable style={styles.area} onPress={jump}>
        <View style={[styles.court, { width: AREA_W, height: AREA_H }]}>
          {hoops.map((h) => (
            <View key={h.id} style={[styles.hoopWrap, { left: h.x, top: h.y }]}>
              <View style={styles.backboard} />
              <View style={[styles.rim, h.passed && styles.rimPassed]} />
            </View>
          ))}
          <View
            style={[
              styles.ball,
              {
                left: ballX - BALL_R,
                top: ballY - BALL_R,
                shadowColor: '#FB923C',
              },
            ]}
          >
            <Text style={styles.ballEmoji}>🏀</Text>
          </View>
        </View>
        <Text style={styles.hint}>Dokun → zıpla · Potadan geçir</Text>
      </Pressable>

      {phase === 'start' && (
        <StartOverlay
          emoji="🏀"
          title="Basket At"
          instructions="Flappy tarzı zıpla, potaların içinden geç. Yere veya tavana çarpma!"
          highScore={highScore}
          accent="#FB923C"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#FB923C"
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
    backgroundColor: '#120A08',
  },
  court: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(251,146,60,0.06)',
    overflow: 'hidden',
    position: 'relative',
  },
  hoopWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  backboard: {
    width: 6,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  rim: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#FB923C',
    marginTop: -4,
    backgroundColor: 'transparent',
  },
  rimPassed: {
    borderColor: colors.success,
  },
  ball: {
    position: 'absolute',
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,146,60,0.2)',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  ballEmoji: {
    fontSize: 22,
  },
  hint: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 12,
  },
});
