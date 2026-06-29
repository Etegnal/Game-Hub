import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import { GameOverModal } from '../../components/game/GameOverModal';
import { StartOverlay } from '../../components/game/StartOverlay';
import { useGameScore } from '../../hooks/useGameScore';
import { colors } from '../../theme/colors';

const CONTAINER_W = 240;
const CONTAINER_H = 380;
const BLOCK_H = 22;
const GRID_COLS = 10;
const SEG_W = CONTAINER_W / GRID_COLS; // 24px per segment

interface StackedBlock {
  row: number;
  startCol: number;
  widthCols: number;
}

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
}

export const StackerScreen: React.FC<Props> = ({ onBack, onUpdateHighScore }) => {
  const { score, setScore, highScore, isNewRecord, resetScore, finishGame } = useGameScore(
    'stacker',
    onUpdateHighScore
  );
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  
  // Tower blocks already placed
  const [blocks, setBlocks] = useState<StackedBlock[]>([]);
  
  // Current active block state
  const [currentRow, setCurrentRow] = useState(0);
  const [currentStartCol, setCurrentStartCol] = useState(0);
  const [currentWidthCols, setCurrentWidthCols] = useState(3); // Start with width of 3 columns

  const rowRef = useRef(0);
  const colRef = useRef(0);
  const widthRef = useRef(3);
  const dirRef = useRef(1); // 1 = right, -1 = left
  const blocksRef = useRef<StackedBlock[]>([]);
  const speedRef = useRef(200); // interval duration in ms (lower is faster)
  
  const timerRef = useRef<any>(null);
  const scoreRef = useRef(0);

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('over');
    await finishGame(scoreRef.current);
  };

  const startLoop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate speed based on current row
    const interval = Math.max(70, speedRef.current - rowRef.current * 8);

    timerRef.current = setInterval(() => {
      // Move block left/right
      let nextCol = colRef.current + dirRef.current;
      
      if (nextCol + widthRef.current > GRID_COLS) {
        nextCol = GRID_COLS - widthRef.current - 1;
        dirRef.current = -1;
      } else if (nextCol < 0) {
        nextCol = 1;
        dirRef.current = 1;
      }

      colRef.current = nextCol;
      setCurrentStartCol(nextCol);
    }, interval);
  };

  const startGame = () => {
    resetScore();
    scoreRef.current = 0;
    rowRef.current = 0;
    colRef.current = 0;
    widthRef.current = 3;
    dirRef.current = 1;
    speedRef.current = 180;
    blocksRef.current = [];
    
    setBlocks([]);
    setCurrentRow(0);
    setCurrentStartCol(0);
    setCurrentWidthCols(3);
    setPhase('play');
    
    startLoop();
  };

  const handleTap = () => {
    if (phase !== 'play') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const activeRow = rowRef.current;
    const activeStart = colRef.current;
    const activeWidth = widthRef.current;

    let targetStart = activeStart;
    let targetWidth = activeWidth;

    if (activeRow > 0) {
      // Check alignment with block below
      const below = blocksRef.current.find((b) => b.row === activeRow - 1);
      if (!below) {
        endGame();
        return;
      }

      const belowStart = below.startCol;
      const belowEnd = belowStart + below.widthCols;
      const activeEnd = activeStart + activeWidth;

      // Calculate overlap
      const overlapStart = Math.max(belowStart, activeStart);
      const overlapEnd = Math.min(belowEnd, activeEnd);
      const overlapWidth = overlapEnd - overlapStart;

      if (overlapWidth <= 0) {
        // Zero overlap - Game Over
        endGame();
        return;
      }

      targetStart = overlapStart;
      targetWidth = overlapWidth;
    }

    // Place block
    const placed: StackedBlock = {
      row: activeRow,
      startCol: targetStart,
      widthCols: targetWidth,
    };

    blocksRef.current.push(placed);
    setBlocks([...blocksRef.current]);

    scoreRef.current = activeRow + 1;
    setScore(scoreRef.current);

    // Prepare next row
    rowRef.current = activeRow + 1;
    colRef.current = 0;
    widthRef.current = targetWidth; // set width to overlap size
    dirRef.current = 1;

    setCurrentRow(rowRef.current);
    setCurrentStartCol(0);
    setCurrentWidthCols(targetWidth);

    // Continue loop
    startLoop();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Vertical camera offset to scroll blocks down when high up
  const cameraRowOffset = Math.max(0, currentRow - 10);

  return (
    <GameShell title="KULE YAPICI" score={score} accent="#3B82F6" onBack={onBack}>
      <Pressable style={styles.area} onPress={handleTap}>
        <View style={styles.gameContainer}>
          {/* Stacker Grid background lines */}
          <View style={styles.gridLines}>
            {Array.from({ length: 15 }).map((_, i) => (
              <View key={i} style={[styles.gridRowLine, { bottom: i * BLOCK_H }]} />
            ))}
          </View>

          {/* Already placed blocks */}
          {blocks
            .filter((b) => b.row >= cameraRowOffset)
            .map((b) => (
              <View
                key={b.row}
                style={[
                  styles.blockRow,
                  {
                    bottom: (b.row - cameraRowOffset) * BLOCK_H,
                    left: b.startCol * SEG_W,
                    width: b.widthCols * SEG_W,
                  },
                ]}
              >
                {Array.from({ length: b.widthCols }).map((_, j) => (
                  <View key={j} style={styles.blockSegment} />
                ))}
              </View>
            ))}

          {/* Active sliding block */}
          {phase === 'play' && currentRow - cameraRowOffset < 15 && (
            <View
              style={[
                styles.blockRow,
                styles.activeRow,
                {
                  bottom: (currentRow - cameraRowOffset) * BLOCK_H,
                  left: currentStartCol * SEG_W,
                  width: currentWidthCols * SEG_W,
                },
              ]}
            >
              {Array.from({ length: currentWidthCols }).map((_, j) => (
                <View key={j} style={[styles.blockSegment, styles.activeSegment]} />
              ))}
            </View>
          )}
        </View>
        <Text style={styles.hint}>Dokun → Blokları üst üste kitle</Text>
      </Pressable>

      {phase === 'start' && (
        <StartOverlay
          emoji="🏢"
          title="Kule Yapıcı"
          instructions="Sağa sola kayan blokları tam altındakinin üstüne denk getirerek durdur. Taşan kısımlar kesilir!"
          highScore={highScore}
          accent="#3B82F6"
          onStart={startGame}
        />
      )}

      <GameOverModal
        visible={phase === 'over'}
        score={score}
        highScore={Math.max(highScore, score)}
        isNewRecord={isNewRecord}
        accent="#3B82F6"
        onReplay={() => setPhase('start')}
        onHome={onBack}
      />
    </GameShell>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#040A12',
  },
  gameContainer: {
    width: CONTAINER_W,
    height: CONTAINER_H,
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(59,130,246,0.03)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  gridRowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#3B82F6',
  },
  blockRow: {
    position: 'absolute',
    height: BLOCK_H - 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  blockSegment: {
    flex: 1,
    height: '100%',
    backgroundColor: '#2563EB', // Blue block color
    borderColor: '#3B82F6',
    borderWidth: 1.5,
    borderRadius: 4,
    marginHorizontal: 1,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  activeRow: {
    zIndex: 10,
  },
  activeSegment: {
    backgroundColor: '#60A5FA', // Neon active block color
    borderColor: '#93C5FD',
  },
  hint: {
    marginTop: 20,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
