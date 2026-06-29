import React from 'react';
import { Platform, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { isAndroidWebView } from '../utils/webShell';

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
  const useWebGradient = Platform.OS === 'web' && !isAndroidWebView();

  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { fontSize: size },
        useWebGradient ? styles.webGradient : styles.visibleText,
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
  visibleText: {
    color: colors.gradientStart,
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  webGradient: Platform.select({
    web: {
      backgroundImage: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 45%, ${colors.gradientEnd} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    } as TextStyle,
    default: {},
  }) as TextStyle,
});
