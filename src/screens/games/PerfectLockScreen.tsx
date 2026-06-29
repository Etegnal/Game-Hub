import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const LOCK = 240;
const TARGET_HALF = 22;

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const PerfectLockScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'perfectLock',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [targetAngle, setTargetAngle] = useState(45);
  const [handAngle, setHandAngle] = useState(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(2.2);
  const dirRef = useRef(1);
  const angleRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const spinningRef = useRef(false);

  const randomTarget = () => Math.floor(Math.random() * 360);

  const normalizeDiff = (a: number, b: number) => {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };

  const stopSpin = () => {
    spinningRef.current = false;
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const startSpin = useCallback(() => {
    stopSpin();
    spinningRef.current = true;
    let last = Date.now();

    const loop = () => {
      if (!spinningRef.current) return;
      const now = Date.now();
      const dt = now - last;
      last = now;
      angleRef.current = (angleRef.current + dirRef.current * speedRef.current * dt * 0.15) % 360;
      if (angleRef.current < 0) angleRef.current += 360;
      setHandAngle(angleRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (phase === 'play') startSpin();
    return stopSpin;
  }, [phase, startSpin]);

  const startGame = () => {
    resetScore();
    scoreRef.current = 0;
    setTargetAngle(randomTarget());
    angleRef.current = 0;
    setHandAngle(0);
    speedRef.current = 2.2;
    dirRef.current = 1;
    setPhase('play');
  };

  const handleTap = async () => {
    if (phase !== 'play' || !spinningRef.current) return;
    stopSpin();
    const hit = normalizeDiff(angleRef.current, targetAngle) <= TARGET_HALF;

    if (hit) {
      setScore((s) => {
        const next = s + 1;
        scoreRef.current = next;
        speedRef.current = Math.min(5, 2.2 + next * 0.18);
        dirRef.current *= -1;
        setTargetAngle(randomTarget());
        setTimeout(() => startSpin(), 300);
        return next;
      });
    } else {
      setPhase('over');
      await finishGame(scoreRef.current);
    }
  };

  return (
    <GameShell title="TAM ÜSTÜNE" score={score} accent="#00E5A0" onBack={onBack}>
      <Pressable style={styles.area} onPress={handleTap}>
        <View style={styles.lockOuter}>
          <View style={[styles.targetArc, { transform: [{ rotate: `${targetAngle - 90}deg` }] }]}>
            <View style={styles.targetFill} />
          </View>
          <View style={styles.lockInner} />
          <View style={[styles.handWrap, { transform: [{ rotate: `${handAngle}deg` }] }]}>
            <View style={styles.hand} />
          </View>
          <View style={styles.centerDot} />
        </View>
        <Text style={styles.hint}>Dokun → kadran dursun · Yeşil alana denk getir</Text>
      </Pressable>

      {phase === 'start' && (
        <StartOverlay
          emoji="🔐"
          title="Tam Üstüne"
          instructions="Dönen kadranı yeşil hedef bölgesinde durdur. Her başarıda hız artar ve yön tersine döner."
          highScore={highScore}
          accent="#00E5A0"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#00E5A0"
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
  lockOuter: {
    width: LOCK,
    height: LOCK,
    borderRadius: LOCK / 2,
    borderWidth: 3,
    borderColor: colors.glassBorderBright,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,229,160,0.06)',
  },
  targetArc: {
    position: 'absolute',
    width: LOCK,
    height: LOCK,
    alignItems: 'center',
  },
  targetFill: {
    width: 18,
    height: LOCK / 2 - 10,
    marginTop: 6,
    backgroundColor: '#00E5A0',
    borderRadius: 9,
    shadowColor: '#00E5A0',
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  lockInner: {
    width: LOCK - 36,
    height: LOCK - 36,
    borderRadius: (LOCK - 36) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handWrap: {
    position: 'absolute',
    width: 4,
    height: LOCK / 2 - 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: LOCK / 2 - (LOCK / 2 - 14),
  },
  hand: {
    width: 4,
    height: LOCK / 2 - 14,
    backgroundColor: '#00D4FF',
    borderRadius: 2,
    shadowColor: '#00D4FF',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  centerDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F0F6FF',
    borderWidth: 2,
    borderColor: '#00E5A0',
  },
  hint: {
    marginTop: 28,
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
