import { Platform } from 'react-native';

export const fonts = {
  display: Platform.select({
    web: 'Orbitron, system-ui, sans-serif',
    default: 'System',
  }),
  body: Platform.select({
    web: 'Rajdhani, system-ui, sans-serif',
    default: 'System',
  }),
} as const;

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600;700&display=swap';

let fontsLoaded = false;

export function loadWebFonts() {
  if (Platform.OS !== 'web' || fontsLoaded || typeof document === 'undefined') {
    return;
  }

  const existing = document.getElementById('eternal-game-hub-fonts');
  if (existing) {
    fontsLoaded = true;
    return;
  }

  const link = document.createElement('link');
  link.id = 'eternal-game-hub-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_URL;
  document.head.appendChild(link);
  fontsLoaded = true;
}
