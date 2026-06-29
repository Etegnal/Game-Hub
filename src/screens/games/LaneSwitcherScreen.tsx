import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const { width: SW } = Dimensions.get('window');
const LANES = 3;

interface Obstacle {
  id: number;
  lane: number;
  y: number;
}

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const LaneSwitcherScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'laneSwitcher',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const passedIds = useRef(new Set<number>());
  const frameRef = useRef<number | null>(null);
  const laneW = (SW - 80) / LANES;

  const endGame = async () => {
    if (phase !== 'play') return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    let spawnTimer = 0;
    const loop = () => {
      spawnTimer += 1;
      if (spawnTimer > 55) {
        spawnTimer = 0;
        idRef.current += 1;
        setObstacles((o) => [
          ...o,
          { id: idRef.current, lane: Math.floor(Math.random() * LANES), y: -40 },
        ]);
      }
      setObstacles((obs) => {
        const next = obs
          .map((o) => ({ ...o, y: o.y + 4 }))
          .filter((o) => o.y < 520);
        const hit = next.some(
          (o) => o.lane === playerLane && o.y > 400 && o.y < 460
        );
        if (hit) {
          endGame();
          return obs;
        }
        next.forEach((o) => {
          if (o.y > 460 && !passedIds.current.has(o.id)) {
            passedIds.current.add(o.id);
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        });
        return next;
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [phase, playerLane]);

  const startGame = () => {
    resetScore();
    scoreRef.current = 0;
    passedIds.current.clear();
    setPlayerLane(1);
    setObstacles([]);
    setPhase('play');
  };

  const handlePress = (side: 'left' | 'right') => {
    if (phase !== 'play') return;
    setPlayerLane((l) => (side === 'left' ? Math.max(0, l - 1) : Math.min(LANES - 1, l + 1)));
  };

  return (
    <GameShell title="ŞERİT DEĞİŞTİR" score={score} accent="#8B5CF6" onBack={onBack}>
      <View style={styles.area}>
        <View style={styles.lanes}>
          {[0, 1, 2].map((lane) => (
            <View key={lane} style={[styles.lane, { width: laneW }]}>
              <View style={styles.laneLine} />
              {obstacles
                .filter((o) => o.lane === lane)
                .map((o) => (
                  <View key={o.id} style={[styles.obstacle, { top: o.y }]} />
                ))}
            </View>
          ))}
          <View
            style={[
              styles.player,
              { left: playerLane * laneW + laneW / 2 - 16, shadowColor: '#8B5CF6' },
            ]}
          />
        </View>
        <View style={styles.controls}>
          <Pressable style={styles.controlBtn} onPress={() => handlePress('left')}>
            <Text style={styles.controlText}>◀ SOL</Text>
          </Pressable>
          <Pressable style={styles.controlBtn} onPress={() => handlePress('right')}>
            <Text style={styles.controlText}>SAĞ ▶</Text>
          </Pressable>
        </View>
      </View>

      {phase === 'start' && (
        <StartOverlay
          emoji="🛣️"
          title="Şerit Değiştir"
          instructions="3 şeritte engeller düşer. Sol/sağ butonlarla şerit değiştir, çarpma!"
          highScore={highScore}
          accent="#8B5CF6"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#8B5CF6"
        onReplay={() => setPhase('start')}
        onHome={onBack}
      />
    </GameShell>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: '#0A0818' },
  lanes: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  lane: {
    height: '100%',
    position: 'relative',
    borderColor: colors.glassBorder,
    borderLeftWidth: 1,
  },
  laneLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.glassBorder,
  },
  obstacle: {
    position: 'absolute',
    left: '15%',
    width: '70%',
    height: 28,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  player: {
    position: 'absolute',
    bottom: 40,
    width: 32,
    height: 32,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
    shadowOpacity: 0.8,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
  },
  controlBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderWidth: 1,
    borderColor: '#8B5CF688',
    alignItems: 'center',
  },
  controlText: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
});
