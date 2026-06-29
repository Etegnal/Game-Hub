import { Platform } from 'react-native';
import { colors } from '../theme/colors';

export function setupWebShell() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const { documentElement: html, body } = document;
  html.style.height = '100%';
  html.style.minHeight = '100%';
  html.style.backgroundColor = colors.bg;
  body.style.height = '100%';
  body.style.minHeight = '100%';
  body.style.margin = '0';
  body.style.backgroundColor = colors.bg;
  body.style.overflow = 'hidden';

  const root = document.getElementById('root');
  if (root) {
    root.style.display = 'flex';
    root.style.flex = '1';
    root.style.minHeight = '100%';
    root.style.height = '100%';
    root.style.backgroundColor = colors.bg;
  }
}

export function isAndroidWebView(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  return /Android/i.test(ua) && /wv|Version\/\d+\.\d+/i.test(ua);
}
