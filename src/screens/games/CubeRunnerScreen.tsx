import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const CONTAINER_W = 320;
const CONTAINER_H = 260;
const FLOOR_Y = 200;
const CUBE_SIZE = 24;
const GRAVITY = 0.44;
const JUMP_FORCE = -7.8;

interface Obstacle {
  id: number;
  type: 'spike' | 'double-spike' | 'block' | 'double-block';
  x: number;
  width: number;
  height: number;
  passed: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const CubeRunnerScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'cubeRunner',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [playerY, setPlayerY] = useState(FLOOR_Y - CUBE_SIZE);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  const playerYRef = useRef(FLOOR_Y - CUBE_SIZE);
  const vyRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const isGroundedRef = useRef(true);
  const isDeadRef = useRef(false);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(2.8);
  const spawnTimerRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const spawnObstacle = () => {
    idRef.current += 1;
    const types: Obstacle['type'][] = ['spike', 'double-spike', 'block', 'double-block'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width = 24;
    let height = 24;

    if (type === 'double-spike') {
      width = 44;
      height = 24;
    } else if (type === 'double-block') {
      width = 24;
      height = 44;
    }

    const obs: Obstacle = {
      id: idRef.current,
      type,
      x: CONTAINER_W + 20,
      width,
      height,
      passed: false,
    };
    obstaclesRef.current.push(obs);
    setObstacles([...obstaclesRef.current]);
  };

  const createExplosion = (x: number, y: number) => {
    const list: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      list.push({
        id: i,
        x: x + CUBE_SIZE / 2,
        y: y + CUBE_SIZE / 2,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.75) * 6,
        size: 3 + Math.random() * 5,
        color: '#A855F7', // Cube purple
      });
    }
    particlesRef.current = list;
    setParticles(list);
  };

  const endGame = async () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  useEffect(() => {
    if (phase !== 'play') return;

    // Reset loop settings
    playerYRef.current = FLOOR_Y - CUBE_SIZE;
    vyRef.current = 0;
    obstaclesRef.current = [];
    particlesRef.current = [];
    isGroundedRef.current = true;
    isDeadRef.current = false;
    scoreRef.current = 0;
    speedRef.current = 2.8;
    spawnTimerRef.current = 0;

    setObstacles([]);
    setParticles([]);
    setPlayerY(FLOOR_Y - CUBE_SIZE);

    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = (now - last) / 16;
      last = now;

      if (isDeadRef.current) {
        // Animate explosion particles
        particlesRef.current = particlesRef.current.map((p) => {
          const ny = p.y + p.vy * dt;
          const nx = p.x + p.vx * dt;
          return {
            ...p,
            x: nx,
            y: ny,
            vy: p.vy + 0.22 * dt, // gravity for particles
          };
        });
        setParticles([...particlesRef.current]);
        
        // Wait a bit before loading score screen
        spawnTimerRef.current += dt;
        if (spawnTimerRef.current > 40) {
          endGame();
          return;
        }
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      // Physics: Apply gravity
      vyRef.current += GRAVITY * dt;
      let py = playerYRef.current + vyRef.current * dt;

      if (py >= FLOOR_Y - CUBE_SIZE) {
        py = FLOOR_Y - CUBE_SIZE;
        vyRef.current = 0;
        isGroundedRef.current = true;
      } else {
        isGroundedRef.current = false;
      }
      playerYRef.current = py;
      setPlayerY(py);

      // Obstacle spawner timing
      spawnTimerRef.current += dt;
      const minSpawnTime = Math.max(50, 95 - scoreRef.current * 1.5);
      if (spawnTimerRef.current > minSpawnTime && Math.random() > 0.4) {
        spawnTimerRef.current = 0;
        spawnObstacle();
      }

      // Move obstacles
      const currentSpeed = speedRef.current + scoreRef.current * 0.05;
      const nextObstacles = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - currentSpeed * dt }))
        .filter((o) => o.x > -60);

      // Check collision and points
      nextObstacles.forEach((o) => {
        // Player X bounds: X is 50, width is 24 (X bounds: 50 to 74)
        // Obstacle X bounds: o.x to o.x + o.width
        const playerLeft = 50;
        const playerRight = 50 + CUBE_SIZE;
        const playerTop = py;
        const playerBottom = py + CUBE_SIZE;

        const obsLeft = o.x;
        const obsRight = o.x + o.width;
        const obsTop = FLOOR_Y - o.height;
        const obsBottom = FLOOR_Y;

        // Collision Check (AABB box overlap)
        if (
          playerRight - 2 > obsLeft && // slight offset for fair collision
          playerLeft + 2 < obsRight &&
          playerBottom > obsTop &&
          playerTop + 2 < obsBottom
        ) {
          isDeadRef.current = true;
          spawnTimerRef.current = 0;
          createExplosion(playerLeft, py);
        }

        // Pass obstacle score increment
        if (!o.passed && o.x + o.width < 50) {
          o.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      });

      obstaclesRef.current = nextObstacles;
      setObstacles(nextObstacles);

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
    setPhase('play');
  };

  const jump = () => {
    if (phase !== 'play' || isDeadRef.current) return;
    if (isGroundedRef.current) {
      vyRef.current = JUMP_FORCE;
      isGroundedRef.current = false;
    }
  };

  return (
    <GameShell title="KÜP KOŞUCU" score={score} accent="#C084FC" onBack={onBack}>
      <Pressable style={styles.area} onPress={jump}>
        <View style={styles.gameContainer}>
          {/* Ground */}
          <View style={styles.ground} />

          {/* Player Cube */}
          {!isDeadRef.current && (
            <View
              style={[
                styles.player,
                {
                  top: playerY,
                  // Simple rotation effect when jumping
                  transform: [
                    {
                      rotate: isGroundedRef.current
                        ? '0deg'
                        : `${(vyRef.current * 10).toFixed(0)}deg`,
                    },
                  ],
                },
              ]}
            />
          )}

          {/* Obstacles */}
          {obstacles.map((o) => {
            const isSpike = o.type === 'spike' || o.type === 'double-spike';
            return (
              <View
                key={o.id}
                style={[
                  isSpike ? styles.spikeWrap : styles.block,
                  {
                    left: o.x,
                    bottom: CONTAINER_H - FLOOR_Y,
                    width: o.width,
                    height: o.height,
                  },
                ]}
              >
                {isSpike ? (
                  // Draw triangular spike using CSS borders
                  <View
                    style={[
                      styles.spikeTriangle,
                      {
                        borderLeftWidth: o.width / 2,
                        borderRightWidth: o.width / 2,
                        borderBottomWidth: o.height,
                      },
                    ]}
                  />
                ) : (
                  // Draw blocks stacked
                  <View style={styles.blockInner} />
                )}
              </View>
            );
          })}

          {/* Particles */}
          {particles.map((p) => (
            <View
              key={p.id}
              style={[
                styles.particle,
                {
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: p.color,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.hint}>Dokun → Küpü zıplat · Engellere çarpma</Text>
      </Pressable>

      {phase === 'start' && (
        <StartOverlay
          emoji="🔺"
          title="Küp Koşucu"
          instructions="Engellerin üzerinden zıpla. Tek bir hata canına mal olur!"
          highScore={highScore}
          accent="#C084FC"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#C084FC"
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
    backgroundColor: '#0F091A',
  },
  gameContainer: {
    width: CONTAINER_W,
    height: CONTAINER_H,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(192,132,252,0.03)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  ground: {
    position: 'absolute',
    top: FLOOR_Y,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#374151', // Dark grey ground
    borderTopWidth: 2,
    borderColor: '#9CA3AF',
  },
  player: {
    position: 'absolute',
    left: 50,
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    backgroundColor: '#A855F7', // Bright purple cube
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C084FC',
    shadowColor: '#A855F7',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  spikeWrap: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  spikeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FB923C', // Soft orange/red spike color
  },
  block: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  blockInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FB923C',
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#FDBA74',
  },
  particle: {
    position: 'absolute',
  },
  hint: {
    marginTop: 20,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
