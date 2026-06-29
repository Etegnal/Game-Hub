import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { TapGameScreen } from './src/screens/TapGameScreen';
import { EscapeGameScreen } from './src/screens/EscapeGameScreen';
import { ColorGameScreen } from './src/screens/ColorGameScreen';
import { getHighScore } from './src/utils/storage';

type Screen = 'HOME' | 'TAP_GAME' | 'ESCAPE_GAME' | 'COLOR_GAME';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [highScores, setHighScores] = useState({
    tapGame: 0,
    escapeGame: 0,
    colorGame: 0,
  });

  // Load high scores on start
  const loadScores = async () => {
    const tapScore = await getHighScore('tapGame');
    const escapeScore = await getHighScore('escapeGame');
    const colorScore = await getHighScore('colorGame');
    setHighScores({
      tapGame: tapScore,
      escapeGame: escapeScore,
      colorGame: colorScore,
    });
  };

  useEffect(() => {
    loadScores();
  }, []);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {currentScreen === 'HOME' && (
        <HomeScreen onNavigate={navigateTo} highScores={highScores} />
      )}
      {currentScreen === 'TAP_GAME' && (
        <TapGameScreen
          onBack={() => navigateTo('HOME')}
          onUpdateHighScore={loadScores}
        />
      )}
      {currentScreen === 'ESCAPE_GAME' && (
        <EscapeGameScreen onBack={() => navigateTo('HOME')} />
      )}
      {currentScreen === 'COLOR_GAME' && (
        <ColorGameScreen onBack={() => navigateTo('HOME')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6', // Match our pastel yellow brand color
  },
});
