import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Gets the high score for a specific game.
 * Falls back to localStorage on web if AsyncStorage is not fully initialized,
 * though AsyncStorage automatically delegates to localStorage on web.
 */
export const getHighScore = async (gameKey: string): Promise<number> => {
  try {
    if (Platform.OS === 'web') {
      const score = localStorage.getItem(`highscore_${gameKey}`);
      return score ? parseInt(score, 10) : 0;
    }
    const score = await AsyncStorage.getItem(`highscore_${gameKey}`);
    return score ? parseInt(score, 10) : 0;
  } catch (error) {
    console.error('Error reading high score:', error);
    return 0;
  }
};

/**
 * Saves the high score for a specific game if it's higher than the existing one.
 */
export const saveHighScore = async (gameKey: string, score: number): Promise<boolean> => {
  try {
    const currentHighScore = await getHighScore(gameKey);
    if (score > currentHighScore) {
      if (Platform.OS === 'web') {
        localStorage.setItem(`highscore_${gameKey}`, score.toString());
      } else {
        await AsyncStorage.setItem(`highscore_${gameKey}`, score.toString());
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving high score:', error);
    return false;
  }
};
