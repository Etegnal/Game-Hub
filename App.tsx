import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { TapGameScreen } from './src/screens/TapGameScreen';
import { PerfectLockScreen } from './src/screens/games/PerfectLockScreen';
import { ZigZagScreen } from './src/screens/games/ZigZagScreen';
import { LaneSwitcherScreen } from './src/screens/games/LaneSwitcherScreen';
import { QuickMathScreen } from './src/screens/games/QuickMathScreen';
import { ColorMatchScreen } from './src/screens/games/ColorMatchScreen';
import { FlappyBasketScreen } from './src/screens/games/FlappyBasketScreen';
import { KnifeHitScreen } from './src/screens/games/KnifeHitScreen';
import { BrickBreakerScreen } from './src/screens/games/BrickBreakerScreen';
import { StackerScreen } from './src/screens/games/StackerScreen';
import { CubeRunnerScreen } from './src/screens/games/CubeRunnerScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { QuizScreen } from './src/screens/games/QuizScreen';
import { getCurrentUser, logoutUser } from './src/utils/firebase';
import { ALL_SCORE_KEYS } from './src/games/registry';
import type { GameScreenId, GameScoreKey } from './src/games/types';
import { getHighScore } from './src/utils/storage';
import { isInAppWebView, setupWebShell } from './src/utils/webShell';
import { colors } from './src/theme/colors';

const EMPTY_SCORES = Object.fromEntries(
  ALL_SCORE_KEYS.map((k) => [k, 0])
) as Record<GameScoreKey, number>;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenId>('HOME');
  const [highScores, setHighScores] = useState<Record<GameScoreKey, number>>(EMPTY_SCORES);
  const [currentUser, setCurrentUser] = useState<{ username: string; quizPoints: number } | null>(null);

  const loadScores = async () => {
    const entries = await Promise.all(
      ALL_SCORE_KEYS.map(async (key) => [key, await getHighScore(key)] as const)
    );
    setHighScores(Object.fromEntries(entries) as Record<GameScoreKey, number>);
  };

  const checkUserSession = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    loadScores();
    checkUserSession();
    setupWebShell();
  }, []);

  const handleLoginSuccess = (user: { username: string; quizPoints: number }) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    navigateTo('HOME');
  };

  const navigateTo = (screen: GameScreenId) => setCurrentScreen(screen);
  const goHome = () => navigateTo('HOME');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {currentScreen === 'HOME' && (
        <HomeScreen
          onNavigate={navigateTo}
          highScores={highScores}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'TAP_GAME' && (
        <TapGameScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'PERFECT_LOCK' && (
        <PerfectLockScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'ZIG_ZAG' && (
        <ZigZagScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'LANE_SWITCHER' && (
        <LaneSwitcherScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'QUICK_MATH' && (
        <QuickMathScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'COLOR_MATCH' && (
        <ColorMatchScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'FLAPPY_BASKET' && (
        <FlappyBasketScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'KNIFE_HIT' && (
        <KnifeHitScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'BRICK_BREAKER' && (
        <BrickBreakerScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'STACKER' && (
        <StackerScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'CUBE_RUNNER' && (
        <CubeRunnerScreen onBack={goHome} onUpdateHighScore={loadScores} />
      )}
      {currentScreen === 'LOGIN' && (
        <LoginScreen onNavigate={navigateTo} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentScreen === 'REGISTER' && (
        <RegisterScreen onNavigate={navigateTo} />
      )}
      {currentScreen === 'QUIZ' && (
        <QuizScreen onBack={goHome} onUpdateHighScore={checkUserSession} currentUser={currentUser} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    ...(Platform.OS === 'web'
      ? isInAppWebView()
        ? { minHeight: '100%' }
        : { flex: 1, minHeight: '100%', height: '100%' }
      : { flex: 1 }),
  },
});
