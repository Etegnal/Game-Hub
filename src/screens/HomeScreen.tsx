import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Platform } from 'react-native';
import { DynamicIsland } from '../components/DynamicIsland';
import { GameButton } from '../components/GameButton';

interface HomeScreenProps {
  onNavigate: (screen: 'HOME' | 'TAP_GAME' | 'ESCAPE_GAME' | 'COLOR_GAME') => void;
  highScores: {
    tapGame: number;
    escapeGame: number;
    colorGame: number;
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, highScores }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <DynamicIsland title="REFLEKS LABORATUVARI" subtitle="Mini-Oyun Hub" badge="v1.0" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={styles.titleEmoji}>⚡</Text>
            <Text style={styles.mainTitle}>Zamanlama ve Hız</Text>
            <Text style={styles.tagline}>Reflekslerini test et, rekorlarını arkadaşlarınla paylaş!</Text>
          </View>

          {/* Buttons Section */}
          <View style={styles.buttonContainer}>
            <GameButton
              title="🎯 Dokunma Oyunu"
              subtitle="Rastgele beliren hedefleri kaçırmadan yakala!"
              color="#7052FF"
              onPress={() => onNavigate('TAP_GAME')}
            />
            <GameButton
              title="🕹️ Kaçış Oyunu"
              subtitle="Yakında - Engellerden sıyrılarak hayatta kal!"
              color="#D8D3FF"
              textColor="#7052FF"
              onPress={() => onNavigate('ESCAPE_GAME')}
            />
            <GameButton
              title="🎨 Renk Oyunu"
              subtitle="Yakında - Hızlı ve doğru renklere odaklan!"
              color="#D8D3FF"
              textColor="#7052FF"
              onPress={() => onNavigate('COLOR_GAME')}
            />
          </View>

          {/* Scoreboard Section */}
          <View style={styles.scoreboard}>
            <Text style={styles.scoreboardTitle}>🏆 En Yüksek Skorlar</Text>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>🎯 Dokunma Oyunu</Text>
              <Text style={styles.scoreValue}>{highScores.tapGame} Puan</Text>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>🕹️ Kaçış Oyunu</Text>
              <Text style={styles.scoreValue}>{highScores.escapeGame} Puan</Text>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>🎨 Renk Oyunu</Text>
              <Text style={styles.scoreValue}>{highScores.colorGame} Puan</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF6', // Light pastel yellow
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFDF6',
  },
  scrollContent: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: 20,
    textAlign: 'center',
  },
  titleEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2C2C2C',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    color: '#7A7A7A',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginVertical: 15,
  },
  scoreboard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreboardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2C2C',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7052FF',
  },
});
