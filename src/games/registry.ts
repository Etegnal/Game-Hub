import { colors } from '../theme/colors';
import type { GameDefinition } from './types';

export const GAMES: GameDefinition[] = [
  {
    id: 'TAP_GAME',
    scoreKey: 'tapGame',
    title: 'Dokunma',
    subtitle: 'Hedefleri yakala',
    emoji: '🎯',
    accent: colors.tapGame,
    gradient: ['#00B4FF', '#0066CC'],
  },
  {
    id: 'PERFECT_LOCK',
    scoreKey: 'perfectLock',
    title: 'Tam Üstüne',
    subtitle: 'Kilitte dur',
    emoji: '🔐',
    accent: '#00E5A0',
    gradient: ['#00E5A0', '#059669'],
  },
  {
    id: 'ZIG_ZAG',
    scoreKey: 'zigZag',
    title: 'Zorlu Dönüş',
    subtitle: 'Yolda kal',
    emoji: '⚡',
    accent: '#F59E0B',
    gradient: ['#FBBF24', '#D97706'],
  },
  {
    id: 'LANE_SWITCHER',
    scoreKey: 'laneSwitcher',
    title: 'Şerit Değiştir',
    subtitle: 'Engellerden kaç',
    emoji: '🛣️',
    accent: '#8B5CF6',
    gradient: ['#A78BFA', '#6D28D9'],
  },
  {
    id: 'QUICK_MATH',
    scoreKey: 'quickMath',
    title: 'Hızlı Matematik',
    subtitle: '1.5 sn karar',
    emoji: '🧮',
    accent: '#F472B6',
    gradient: ['#F472B6', '#DB2777'],
  },
  {
    id: 'COLOR_MATCH',
    scoreKey: 'colorMatch',
    title: 'Renk Eşle',
    subtitle: 'Renkleri tuttur',
    emoji: '🎨',
    accent: '#22D3EE',
    gradient: ['#22D3EE', '#0891B2'],
  },
  {
    id: 'FLAPPY_BASKET',
    scoreKey: 'flappyBasket',
    title: 'Basket At',
    subtitle: 'Potadan geç',
    emoji: '🏀',
    accent: '#FB923C',
    gradient: ['#FB923C', '#EA580C'],
  },
];

export const ALL_SCORE_KEYS = GAMES.map((g) => g.scoreKey);
