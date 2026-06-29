import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { DynamicIsland } from '../components/DynamicIsland';

interface ColorGameScreenProps {
  onBack: () => void;
}

export const ColorGameScreen: React.FC<ColorGameScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <DynamicIsland title="🎨 RENK OYUNU" subtitle="Refleks Laboratuvarı" badge="YAKINDA" />

        <View style={styles.content}>
          <Text style={styles.emoji}>🚧</Text>
          <Text style={styles.title}>Yapım Aşamasında</Text>
          <Text style={styles.description}>
            Renk uyumunu ve odaklanma hızını test edeceğiniz Renk Oyunu çok yakında burada olacak!
          </Text>
          <TouchableOpacity style={styles.homeButton} onPress={onBack}>
            <Text style={styles.homeButtonText}>ANA MENÜYE DÖN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFDF6',
  },
  header: {
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFDF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginBottom: 60,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2C2C2C',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 30,
  },
  homeButton: {
    backgroundColor: '#7052FF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
