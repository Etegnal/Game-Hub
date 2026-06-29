import { Platform } from 'react-native';
import { colors } from '../theme/colors';

const ANDROID_WEBVIEW_PARAM = 'android-webview';

export function isInAppWebView(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('platform') === ANDROID_WEBVIEW_PARAM) {
    return true;
  }

  const ua = navigator.userAgent;
  return /Android/i.test(ua) && /;\s*wv\)|Version\/\d+\.\d+.*Chrome/i.test(ua);
}

export function setupWebShell() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const inAppWebView = isInAppWebView();
  const { documentElement: html, body } = document;
  const root = document.getElementById('root');

  html.style.backgroundColor = colors.bg;
  body.style.margin = '0';
  body.style.backgroundColor = colors.bg;

  if (inAppWebView) {
    // Let the page scroll natively inside Android WebView.
    html.style.height = 'auto';
    html.style.minHeight = '100%';
    body.style.height = 'auto';
    body.style.minHeight = '100%';
    body.style.overflow = 'auto';
    body.style.overflowX = 'hidden';
    (body.style as CSSStyleDeclaration & { webkitOverflowScrolling?: string }).webkitOverflowScrolling =
      'touch';

    if (root) {
      root.style.display = 'block';
      root.style.minHeight = '100%';
      root.style.height = 'auto';
      root.style.backgroundColor = colors.bg;
    }
    return;
  }

  html.style.height = '100%';
  html.style.minHeight = '100%';
  body.style.height = '100%';
  body.style.minHeight = '100%';
  body.style.overflow = 'hidden';

  if (root) {
    root.style.display = 'flex';
    root.style.flex = '1';
    root.style.minHeight = '100%';
    root.style.height = '100%';
    root.style.backgroundColor = colors.bg;
  }
}

export function useBodyScrollLayout(): boolean {
  return Platform.OS === 'web' && isInAppWebView();
}
