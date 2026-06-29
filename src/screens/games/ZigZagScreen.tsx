import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const { width: SW } = Dimensions.get('window');
const PATH_W = Math.min(SW - 80, 280);
const SEG = 44;
const BALL = 14;

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const ZigZagScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'zigZag',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [ball, setBall] = useState({ x: PATH_W / 2, y: 0 });
  const dirRef = useRef(1);
  const frameRef = useRef<number | null>(null);
  const scoreRef = useRef(0);

  const pathPoints = () => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 1000; i++) {
      const y = i * (SEG / 2);
      const x = PATH_W / 2 + Math.sin(y / 70) * (PATH_W / 2 - 32);
      pts.push({ x, y });
    }
    return pts;
  };

  const points = pathPoints();

  const endGame = async () => {
    if (phase !== 'play') return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = (now - last) / 16;
      last = now;
      setBall((b) => {
        const nx = b.x + dirRef.current * 3.0 * dt;
        const ny = b.y + 2.6 * dt;
        const corridor = PATH_W / 2 + Math.sin(ny / 70) * (PATH_W / 2 - 32);
        
        if (Math.abs(nx - corridor) > 28) {
          endGame();
          return b;
        }
        
        const currentScore = Math.floor(ny / 120);
        if (currentScore > scoreRef.current) {
          scoreRef.current = currentScore;
          setScore(scoreRef.current);
        }
        return { x: nx, y: ny };
      });
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
    dirRef.current = 1;
    setBall({ x: PATH_W / 2, y: 0 });
    setPhase('play');
  };

  const handleTap = () => {
    if (phase !== 'play') return;
    dirRef.current *= -1;
  };

  // Only render path segments that are visible on the screen
  const visiblePoints = points.filter((p) => Math.abs(p.y - ball.y) < 320);

  return (
    <GameShell title="ZORLU DÖNÜŞ" score={score} accent="#F59E0B" onBack={onBack}>
      <Pressable style={styles.area} onPress={handleTap}>
        <View style={[styles.pathBox, { width: PATH_W }]}>
          {visiblePoints.map((p, i) => (
            <View
              key={i}
              style={[
                styles.pathSeg,
                {
                  left: p.x - 12,
                  top: p.y - ball.y + 160, // Scroll path segments
                  backgroundColor: Math.floor(p.y / SEG) % 2 === 0 ? '#F59E0B55' : '#FBBF2455',
                },
              ]}
            />
          ))}
          <View
            style={[
              styles.ball,
              { left: ball.x - BALL / 2, top: 160, shadowColor: '#FBBF24' }, // Lock ball vertically
            ]}
          />
        </View>
        <Text style={styles.hint}>Dokun → 90° dön · Yoldan düşme</Text>
      </Pressable>

      {phase === 'start' && (
        <StartOverlay
          emoji="⚡"
          title="Zorlu Dönüş"
          instructions="Top otomatik ilerler. Dokunarak yön değiştir, zikzak yolda kal."
          highScore={highScore}
          accent="#F59E0B"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#F59E0B"
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
    backgroundColor: '#0A0E18',
    paddingTop: 20,
  },
  pathBox: {
    height: 480,
    position: 'relative',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.glassBorder,
  },
  pathSeg: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  ball: {
    position: 'absolute',
    width: BALL,
    height: BALL,
    borderRadius: BALL / 2,
    backgroundColor: '#FBBF24',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  hint: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 12,
  },
});
