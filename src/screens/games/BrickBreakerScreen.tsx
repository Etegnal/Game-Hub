import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const CONTAINER_W = 300;
const CONTAINER_H = 400;
const PADDLE_W = 70;
const PADDLE_H = 12;
const BALL_R = 7;

const BRICK_ROWS = 4;
const BRICK_COLS = 6;
const BRICK_W = 44;
const BRICK_H = 16;
const BRICK_GAP = 4;

const BRICK_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];

interface Brick {
  id: number;
  x: number;
  y: number;
  color: string;
  active: boolean;
}

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const BrickBreakerScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'brickBreaker',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [paddleX, setPaddleX] = useState((CONTAINER_W - PADDLE_W) / 2);
  const [ball, setBall] = useState({ x: CONTAINER_W / 2, y: 250 });
  const [bricks, setBricks] = useState<Brick[]>([]);

  const paddleXRef = useRef((CONTAINER_W - PADDLE_W) / 2);
  const ballRef = useRef({ x: CONTAINER_W / 2, y: 250, vx: 2, vy: -2.5 });
  const bricksRef = useRef<Brick[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const initBricks = () => {
    const arr: Brick[] = [];
    let id = 0;
    const startX = (CONTAINER_W - (BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP)) / 2;
    const startY = 40;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        arr.push({
          id: id++,
          x: startX + c * (BRICK_W + BRICK_GAP),
          y: startY + r * (BRICK_H + BRICK_GAP),
          color: BRICK_COLORS[r % BRICK_COLORS.length],
          active: true,
        });
      }
    }
    bricksRef.current = arr;
    setBricks(arr);
  };

  const endGame = async () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    initBricks();
    ballRef.current = { x: CONTAINER_W / 2, y: 250, vx: 1.8, vy: -2.2 };
    
    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = (now - last) / 16;
      last = now;

      // Update ball physics
      let bx = ballRef.current.x + ballRef.current.vx * dt;
      let by = ballRef.current.y + ballRef.current.vy * dt;

      // Wall bounce left/right
      if (bx < BALL_R) {
        bx = BALL_R;
        ballRef.current.vx *= -1;
      } else if (bx > CONTAINER_W - BALL_R) {
        bx = CONTAINER_W - BALL_R;
        ballRef.current.vx *= -1;
      }

      // Ceiling bounce
      if (by < BALL_R) {
        by = BALL_R;
        ballRef.current.vy *= -1;
      }

      // Floor - Game Over
      if (by > CONTAINER_H) {
        endGame();
        return;
      }

      // Paddle bounce
      const px = paddleXRef.current;
      if (
        by + BALL_R >= CONTAINER_H - 40 - PADDLE_H &&
        by - BALL_R <= CONTAINER_H - 40 &&
        bx + BALL_R >= px &&
        bx - BALL_R <= px + PADDLE_W
      ) {
        // Bounce off paddle
        by = CONTAINER_H - 40 - PADDLE_H - BALL_R;
        
        // Calculate relative hit position to apply angle bounce
        const center = px + PADDLE_W / 2;
        const offset = (bx - center) / (PADDLE_W / 2);
        ballRef.current.vx = offset * 2.8;
        ballRef.current.vy = -Math.abs(ballRef.current.vy);
      }

      // Brick collision
      let hitAny = false;
      const nextBricks = bricksRef.current.map((b) => {
        if (!b.active || hitAny) return b;

        // Simple box collision
        if (
          bx + BALL_R >= b.x &&
          bx - BALL_R <= b.x + BRICK_W &&
          by + BALL_R >= b.y &&
          by - BALL_R <= b.y + BRICK_H
        ) {
          hitAny = true;
          ballRef.current.vy *= -1;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          return { ...b, active: false };
        }
        return b;
      });

      if (hitAny) {
        bricksRef.current = nextBricks;
        setBricks(nextBricks);

        // Check if all cleared
        if (nextBricks.every((b) => !b.active)) {
          initBricks();
          // Increase ball speed
          ballRef.current.vy = ballRef.current.vy * 1.15;
          ballRef.current.vx = ballRef.current.vx * 1.1;
        }
      }

      ballRef.current.x = bx;
      ballRef.current.y = by;
      setBall({ x: bx, y: by });

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
    setPaddleX((CONTAINER_W - PADDLE_W) / 2);
    paddleXRef.current = (CONTAINER_W - PADDLE_W) / 2;
    setPhase('play');
  };

  const handleTouch = (event: any) => {
    if (phase !== 'play') return;
    const { locationX } = event.nativeEvent;
    // Center paddle on touch x
    const px = Math.max(0, Math.min(CONTAINER_W - PADDLE_W, locationX - PADDLE_W / 2));
    setPaddleX(px);
    paddleXRef.current = px;
  };

  return (
    <GameShell title="TUĞLA KIRMA" score={score} accent="#F43F5E" onBack={onBack}>
      <View style={styles.area}>
        <Pressable
          style={styles.gameContainer}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
        >
          {/* Active Bricks */}
          {bricks
            .filter((b) => b.active)
            .map((b) => (
              <View
                key={b.id}
                style={[
                  styles.brick,
                  {
                    left: b.x,
                    top: b.y,
                    backgroundColor: b.color,
                    borderColor: b.color + '44',
                  },
                ]}
              />
            ))}

          {/* Paddle */}
          <View style={[styles.paddle, { left: paddleX }]} />

          {/* Ball */}
          <View
            style={[
              styles.ball,
              {
                left: ball.x - BALL_R,
                top: ball.y - BALL_R,
              },
            ]}
          />
        </Pressable>
        <Text style={styles.hint}>Parmağını kaydır → Bariyeri kontrol et</Text>
      </View>

      {phase === 'start' && (
        <StartOverlay
          emoji="🧱"
          title="Tuğla Kırma"
          instructions="Alt bardan topu sektirerek tüm tuğlaları patlat. Topu aşağı düşürme!"
          highScore={highScore}
          accent="#F43F5E"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#F43F5E"
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
    backgroundColor: '#120408',
  },
  gameContainer: {
    width: CONTAINER_W,
    height: CONTAINER_H,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(244,63,94,0.04)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  brick: {
    position: 'absolute',
    width: BRICK_W,
    height: BRICK_H,
    borderRadius: 3,
    borderWidth: 1,
  },
  paddle: {
    position: 'absolute',
    bottom: 40,
    width: PADDLE_W,
    height: PADDLE_H,
    borderRadius: PADDLE_H / 2,
    backgroundColor: '#F43F5E',
    shadowColor: '#F43F5E',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  ball: {
    position: 'absolute',
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  hint: {
    marginTop: 20,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
