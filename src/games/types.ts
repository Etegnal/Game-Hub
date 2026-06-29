export type GameScreenId =
  | 'HOME'
  | 'TAP_GAME'
  | 'PERFECT_LOCK'
  | 'ZIG_ZAG'
  | 'LANE_SWITCHER'
  | 'QUICK_MATH'
  | 'COLOR_MATCH'
  | 'FLAPPY_BASKET'
  | 'KNIFE_HIT'
  | 'BRICK_BREAKER'
  | 'STACKER'
  | 'CUBE_RUNNER';

export type GameScoreKey =
  | 'tapGame'
  | 'perfectLock'
  | 'zigZag'
  | 'laneSwitcher'
  | 'quickMath'
  | 'colorMatch'
  | 'flappyBasket'
  | 'knifeHit'
  | 'brickBreaker'
  | 'stacker'
  | 'cubeRunner';

export interface GameDefinition {
  id: GameScreenId;
  scoreKey: GameScoreKey;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  gradient: [string, string];
}
