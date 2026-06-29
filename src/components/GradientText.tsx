import React from 'react';
import { Platform, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface GradientTextProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle;
  size?: number;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  style,
  size = 32,
  ...rest
}) => {
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { fontSize: size },
        Platform.OS === 'web' ? styles.webGradient : styles.nativeFallback,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.display,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  webGradient: Platform.select({
    web: {
      backgroundImage: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 45%, ${colors.gradientEnd} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 0 40px rgba(0, 196, 255, 0.35)',
    } as TextStyle,
    default: {},
  }) as TextStyle,
  nativeFallback: {
    color: colors.gradientStart,
    textShadowColor: colors.accentGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});
