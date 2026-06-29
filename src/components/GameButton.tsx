import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, Animated, Platform } from 'react-native';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  borderColor?: string;
  subtitle?: string;
}

export const GameButton: React.FC<GameButtonProps> = ({
  title,
  onPress,
  color = '#7052FF', // Purple brand accent
  textColor = '#FFFDF6', // Pastel light
  borderColor = 'transparent',
  subtitle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: Platform.OS !== 'web', // Native driver is not fully supported on some web setups
      tension: 100,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      tension: 100,
      friction: 5,
    }).start();
  };

  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: color,
            borderColor: borderColor,
            borderWidth: borderColor !== 'transparent' ? 2 : 0,
          },
        ]}
      >
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: textColor + 'BF' }]}>{subtitle}</Text>}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
    marginVertical: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    // Add neo-brutalist accentuation on web
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.1s ease',
      },
    }),
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
