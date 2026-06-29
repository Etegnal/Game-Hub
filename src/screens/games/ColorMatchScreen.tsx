import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const WHEEL = 220;
const QUAD = [
  { color: '#3B82F6', label: 'Mavi' },
  { color: '#EAB308', label: 'Sarı' },
  { color: '#EC4899', label: 'Pembe' },
  { color: '#22C55E', label: 'Yeşil' },
];

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const ColorMatchScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'colorMatch',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [rotation, setRotation] = useState(0);
  const [ballColorIdx, setBallColorIdx] = useState(0);
  const [ballY, setBallY] = useState(-30);
  const scoreRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const spawnBall = () => {
    setBallColorIdx(Math.floor(Math.random() * 4));
    setBallY(-150);
  };

  const endGame = async () => {
    if (phase !== 'play') return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    spawnBall();
    const loop = () => {
      setBallY((y) => {
        const speed = 1.8 + scoreRef.current * 0.1; // slower, more playable initial speed
        const ny = y + speed;
        if (ny >= 110) {
          const step = Math.round((rotation % 360) / 90) % 4;
          const normalizedStep = (step + 4) % 4;
          
          // Quadrants at top-left:
          // 0deg: q0 (Blue, index 0)
          // 90deg (clockwise): q2 (Pink, index 2, rotated from bottom-left)
          // 180deg: q3 (Green, index 3, rotated from bottom-right)
          // 270deg: q1 (Yellow, index 1, rotated from top-right)
          const topLeftColors = [0, 2, 3, 1];
          const activeColorIdx = topLeftColors[normalizedStep];

          if (activeColorIdx !== ballColorIdx) {
            endGame();
            return y;
          }
          scoreRef.current += 1;
          setScore(scoreRef.current);
          spawnBall();
          return -30;
        }
        return ny;
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [phase, rotation, ballColorIdx]);

  const startGame = () => {
    resetScore();
    scoreRef.current = 0;
    setRotation(0);
    setPhase('play');
  };

  const handleTap = () => {
    if (phase !== 'play') return;
    setRotation((r) => r + 90);
  };

  return (
    <GameShell title="RENK EŞLE" score={score} accent="#22D3EE" onBack={onBack}>
      <Pressable style={styles.area} onPress={handleTap}>
        <View style={styles.gameContainer}>
          <View
            style={[
              styles.fallingBall,
              {
                backgroundColor: QUAD[ballColorIdx].color,
                top: ballY,
                shadowColor: QUAD[ballColorIdx].color,
              },
            ]}
          />
          <View style={[styles.wheel, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <View style={[styles.quad, styles.q0, { backgroundColor: QUAD[0].color }]} />
            <View style={[styles.quad, styles.q1, { backgroundColor: QUAD[1].color }]} />
            <View style={[styles.quad, styles.q2, { backgroundColor: QUAD[2].color }]} />
            <View style={[styles.quad, styles.q3, { backgroundColor: QUAD[3].color }]} />
            <View style={styles.wheelCore} />
          </View>
        </View>
        <Text style={styles.hint}>Dokun → çarkı döndür · Renkleri eşle</Text>
      </Pressable>

      {phase === 'start' && (
        <StartOverlay
          emoji="🎨"
          title="Renk Eşle"
          instructions="Düşen topun rengiyle çarkın denk gelen çeyreği eşleşmeli. Dokunarak 90° döndür."
          highScore={highScore}
          accent="#22D3EE"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#22D3EE"
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
    backgroundColor: '#081018',
  },
  gameContainer: {
    width: 260,
    height: 360,
    position: 'relative',
  },
  fallingBall: {
    position: 'absolute',
    left: 61, // Centered horizontally on the top-left quadrant of the wheel
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    zIndex: 2,
  },
  wheel: {
    position: 'absolute',
    bottom: 20,
    left: 20, // Centered horizontally in the 260px container (260 - 220) / 2 = 20
    width: WHEEL,
    height: WHEEL,
    borderRadius: WHEEL / 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.glassBorderBright,
  },
  quad: {
    position: 'absolute',
    width: '50%',
    height: '50%',
  },
  q0: { top: 0, left: 0, borderTopLeftRadius: WHEEL / 2 },
  q1: { top: 0, right: 0, borderTopRightRadius: WHEEL / 2 },
  q2: { bottom: 0, left: 0, borderBottomLeftRadius: WHEEL / 2 },
  q3: { bottom: 0, right: 0, borderBottomRightRadius: WHEEL / 2 },
  wheelCore: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    top: WHEEL / 2 - 20,
    left: WHEEL / 2 - 20,
    borderWidth: 2,
    borderColor: colors.glassBorder,
  },
  hint: {
    marginTop: 28,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
