import { useCallback, useEffect, useState } from 'react';
import { getHighScore, saveHighScore } from '../utils/storage';
import type { GameScoreKey } from '../games/types';

export function useGameScore(gameKey: GameScoreKey, onUpdateHome?: () => void) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    getHighScore(gameKey).then(setHighScore);
  }, [gameKey]);

  const resetScore = useCallback(() => {
    setScore(0);
    setIsNewRecord(false);
  }, []);

  const finishGame = useCallback(
    async (finalScore: number) => {
      const isNew = await saveHighScore(gameKey, finalScore);
      if (isNew) {
        setHighScore(finalScore);
        setIsNewRecord(true);
        onUpdateHome?.();
      }
      return isNew;
    },
    [gameKey, onUpdateHome]
  );

  return {
    score,
    setScore,
    highScore,
    isNewRecord,
    resetScore,
    finishGame,
  };
}
