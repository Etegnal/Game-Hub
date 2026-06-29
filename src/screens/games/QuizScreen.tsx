import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { GameShell } from '../../components/game/GameShell';
import {
  createQuizRoom,
  joinQuizRoom,
  updateQuizProgress,
  getRoomState,
  activateSimulatedOpponent,
  QuizRoom,
} from '../../utils/firebase';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

const QUESTIONS = [
  { q: "Türkiye'nin başkenti neresidir?", a: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], c: 1 },
  { q: 'Hangi gezegen "Kızıl Gezegen" olarak bilinir?', a: ['Venüs', 'Mars', 'Jüpiter', 'Satürn'], c: 1 },
  { q: "İstiklal Marşı'mızın şairi kimdir?", a: ['Necip Fazıl', 'Mehmet Akif Ersoy', 'Yahya Kemal', 'Cahit Sıtkı'], c: 1 },
  { q: 'Suyun kimyasal formülü nedir?', a: ['CO2', 'H2O', 'NaCl', 'O2'], c: 1 },
  { q: "Fatih Sultan Mehmet İstanbul'u hangi yılda fethetmiştir?", a: ['1453', '1071', '1299', '1923'], c: 0 },
  { q: 'Dünyanın en büyük okyanusu hangisidir?', a: ['Atlas Okyanusu', 'Büyük Okyanus (Pasifik)', 'Hint Okyanusu', 'Kuzey Buz Denizi'], c: 1 },
  { q: 'Hangi organımız kanı pompalamakla görevlidir?', a: ['Akciğer', 'Kalp', 'Karaciğer', 'Böbrek'], c: 1 },
  { q: 'Telefonu kim icat etmiştir?', a: ['Graham Bell', 'Thomas Edison', 'Nikola Tesla', 'Albert Einstein'], c: 0 },
  { q: 'Futbolda bir takım sahaya kaç oyuncuyla çıkar?', a: ['9', '11', '7', '12'], c: 1 },
  { q: "İlk Türkçe sözlük olan Divanü Lügati't-Türk kimin eseridir?", a: ['Kaşgarlı Mahmud', 'Yusuf Has Hacib', 'Edip Ahmet Yükneki', 'Hoca Ahmet Yesevi'], c: 0 },
];

interface Props {
  onBack: () => void;
  onUpdateHighScore: () => void;
  currentUser: { username: string; quizPoints: number } | null;
}

export const QuizScreen: React.FC<Props> = ({ onBack, onUpdateHighScore, currentUser }) => {
  const username = currentUser?.username || 'Misafir';

  const [mode, setMode] = useState<'lobby' | 'waiting' | 'playing' | 'over'>('lobby');
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gameplay state
  const [qIdx, setQIdx] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const loopIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const qIdxRef = useRef(0);
  const scoreRef = useRef(0);

  // Clean intervals on unmount
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Poll room updates in background
  const startRoomPolling = (code: string) => {
    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);

    loopIntervalRef.current = setInterval(async () => {
      const state = await getRoomState(code);
      if (!state) return;

      setRoom(state);

      if (state.status === 'playing' && mode !== 'playing') {
        // Opponent joined! Start gameplay
        setQIdx(0);
        setMyScore(0);
        qIdxRef.current = 0;
        scoreRef.current = 0;
        setMode('playing');
        startTimer();
      }

      if (state.status === 'ended') {
        clearInterval(loopIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setMode('over');
        onUpdateHighScore(); // Refresh points in app header
      }
    }, 1500);
  };

  const handleCreateRoom = async () => {
    setError('');
    setLoading(true);
    try {
      const newRoom = await createQuizRoom(username);
      setRoom(newRoom);
      setMode('waiting');
      startRoomPolling(newRoom.code);
    } catch (e) {
      setError('Oda oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (joinCode.length !== 4) {
      setError('Oda kodu 4 haneli olmalıdır.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await joinQuizRoom(joinCode, username);
    setLoading(false);

    if (res.success && res.room) {
      setRoom(res.room);
      setMode('playing');
      setQIdx(0);
      setMyScore(0);
      qIdxRef.current = 0;
      scoreRef.current = 0;
      startRoomPolling(res.room.code);
      startTimer();
    } else {
      setError(res.error || 'Odaya katılamadı.');
    }
  };

  // 15-second countdown timer per question
  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimeLeft(15);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time expired! Submit wrong answer and next question
          handleAnswer(-1);
          return 15;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleAnswer = async (ansIdx: number) => {
    if (selectedAns !== null) return; // Prevent double taps

    setSelectedAns(ansIdx);
    const correct = QUESTIONS[qIdxRef.current].c;

    if (ansIdx === correct) {
      scoreRef.current += 1;
      setMyScore(scoreRef.current);
    }

    // Wait a brief second to highlight correct answer green
    setTimeout(async () => {
      const nextQIdx = qIdxRef.current + 1;
      qIdxRef.current = nextQIdx;
      setQIdx(nextQIdx);
      setSelectedAns(null);

      if (room) {
        await updateQuizProgress(room.code, username, scoreRef.current, nextQIdx);
      }

      if (nextQIdx < 10) {
        startTimer();
      } else {
        // Finished all questions
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }
    }, 800);
  };

  const addBotOpponent = async () => {
    if (room) {
      await activateSimulatedOpponent(room.code);
    }
  };

  const resetToLobby = () => {
    setMode('lobby');
    setRoom(null);
    setJoinCode('');
    setError('');
    qIdxRef.current = 0;
    scoreRef.current = 0;
    setQIdx(0);
    setMyScore(0);
  };

  // Determine opponent name and info
  const isP1 = room?.p1.toLowerCase() === username.toLowerCase();
  const opponentName = room ? (isP1 ? room.p2 : room.p1) || 'Rakip bekleniyor...' : '';
  const opponentScore = room ? (isP1 ? room.p2_score : room.p1_score) : 0;
  const opponentQIdx = room ? (isP1 ? room.p2_qIdx : room.p1_qIdx) : 0;

  return (
    <GameShell title="CANLI DÜELLO" score={currentUser?.quizPoints || 0} scoreLabel="TP" accent="#8B5CF6" onBack={onBack}>
      <View style={styles.container}>
        
        {/* Mode: LOBBY */}
        {mode === 'lobby' && (
          <ScrollView contentContainerStyle={styles.cardContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>🧠</Text>
              <Text style={styles.cardTitle}>Canlı Bilgi Yarışması</Text>
              <Text style={styles.cardSubtitle}>
                Kendi odanı açıp kodunu arkadaşınla paylaş veya arkadaşının kurduğu odaya katıl!
              </Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              {/* Create Room Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateRoom}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#0F091A" />
                ) : (
                  <Text style={styles.primaryButtonText}>YENİ ODA AÇ</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>ya da</Text>
                <View style={styles.line} />
              </View>

              {/* Join Room Controls */}
              <View style={styles.joinBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Oda kodunu yaz (örn: 5821)"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={joinCode}
                  onChangeText={setJoinCode}
                />
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleJoinRoom}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>ODAYA GİR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Mode: WAITING FOR OPPONENT */}
        {mode === 'waiting' && room && (
          <View style={styles.card}>
            <Text style={styles.waitingTitle}>Oda Başarıyla Kuruldu! 🎉</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>ODA KODU</Text>
              <Text style={styles.codeNumber}>{room.code}</Text>
            </View>
            
            <Text style={styles.waitingMsg}>
              Bu kodu arkadaşına gönder. Arkadaşın girdiğinde oyun otomatik olarak başlayacaktır.
            </Text>
            <ActivityIndicator style={styles.spinner} color="#8B5CF6" size="large" />

            <View style={styles.botDivider}>
              <Text style={styles.botText}>Test etmek için hemen bir bot eklemek ister misin?</Text>
              <TouchableOpacity style={styles.botButton} onPress={addBotOpponent} activeOpacity={0.7}>
                <Text style={styles.botButtonText}>🤖 BOT RAKİP EKLE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mode: GAMEPLAY */}
        {mode === 'playing' && room && (
          <View style={styles.gameArea}>
            
            {/* Live Match HUD Progress */}
            <View style={styles.hudContainer}>
              <View style={styles.playerHud}>
                <Text style={styles.hudName}>Sen ({username})</Text>
                <Text style={styles.hudSub}>Soru: {Math.min(qIdx + 1, 10)}/10 · Puan: {myScore}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(qIdx / 10) * 100}%`, backgroundColor: '#8B5CF6' }]} />
                </View>
              </View>

              <View style={[styles.playerHud, styles.oppHud]}>
                <Text style={styles.hudName}>{opponentName}</Text>
                <Text style={styles.hudSub}>Soru: {Math.min(opponentQIdx, 10)}/10 · Puan: {opponentScore}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(Math.min(opponentQIdx, 10) / 10) * 100}%`, backgroundColor: '#10B981' }]} />
                </View>
              </View>
            </View>

            {qIdx < 10 ? (
              // Quiz card
              <View style={styles.quizCard}>
                
                {/* Timer Circle */}
                <View style={styles.timerCircle}>
                  <Text style={[styles.timerText, timeLeft <= 4 && styles.timerAlertText]}>{timeLeft}</Text>
                </View>

                <Text style={styles.questionText}>{QUESTIONS[qIdx].q}</Text>

                <View style={styles.optionsList}>
                  {QUESTIONS[qIdx].a.map((option, idx) => {
                    const isSelected = selectedAns === idx;
                    const isCorrect = QUESTIONS[qIdx].c === idx;
                    let optionStyle = {};

                    if (selectedAns !== null) {
                      if (isCorrect) optionStyle = styles.optionCorrect;
                      else if (isSelected) optionStyle = styles.optionWrong;
                      else optionStyle = styles.optionDisabled;
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.optionBtn, optionStyle]}
                        onPress={() => handleAnswer(idx)}
                        disabled={selectedAns !== null}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              // Wait for opponent
              <View style={styles.quizCard}>
                <ActivityIndicator color="#8B5CF6" size="large" />
                <Text style={styles.waitingOppFinished}>
                  Bütün soruları yanıtladın! Rakibinin de oyunu bitirmesi bekleniyor...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Mode: OVER (Match ended) */}
        {mode === 'over' && room && (
          <View style={styles.card}>
            <Text style={styles.resultsTitle}>⚔️ Savaş Bitti!</Text>

            <View style={styles.vsBox}>
              <View style={styles.vsPlayer}>
                <Text style={styles.vsName}>Sen</Text>
                <Text style={styles.vsScore}>{myScore}</Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.vsPlayer}>
                <Text style={styles.vsName}>{opponentName}</Text>
                <Text style={styles.vsScore}>{opponentScore}</Text>
              </View>
            </View>

            {room.winner === username ? (
              <View style={styles.winnerBadge}>
                <Text style={styles.winnerBadgeText}>KAZANDIN! 🎉</Text>
                <Text style={styles.winnerSubText}>+15 TP profil puanı kazandın.</Text>
              </View>
            ) : room.winner === 'TIE' ? (
              <View style={styles.tieBadge}>
                <Text style={styles.tieBadgeText}>BERABERE! 🤝</Text>
              </View>
            ) : (
              <View style={styles.loserBadge}>
                <Text style={styles.loserBadgeText}>KAYBETTİN... 😢</Text>
              </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={resetToLobby} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>TEKRAR OYNA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLobbyBtn} onPress={onBack} activeOpacity={0.8}>
              <Text style={styles.backLobbyText}>ANA MENÜYE DÖN</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </GameShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0612',
  },
  cardContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(9,15,32,0.96)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 24,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  primaryButtonText: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  dividerText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginHorizontal: 10,
  },
  joinBox: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    color: '#FFF',
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  secondaryButtonText: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 1,
  },
  waitingTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  codeLabel: {
    fontFamily: fonts.display,
    fontSize: 9,
    fontWeight: '800',
    color: colors.accentSoft,
    letterSpacing: 2,
    marginBottom: 4,
  },
  codeNumber: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: '900',
    color: '#8B5CF6',
    letterSpacing: 6,
  },
  waitingMsg: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  spinner: {
    marginVertical: 10,
  },
  botDivider: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    paddingTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  botText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  botButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  botButtonText: {
    fontFamily: fonts.display,
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 1,
  },
  gameArea: {
    width: '100%',
    maxWidth: 360,
  },
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playerHud: {
    width: '48%',
    backgroundColor: 'rgba(9,15,32,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    borderRadius: 14,
    padding: 10,
  },
  oppHud: {
    borderColor: 'rgba(16,185,129,0.2)',
  },
  hudName: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  hudSub: {
    fontFamily: fonts.body,
    fontSize: 9.5,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  quizCard: {
    backgroundColor: 'rgba(9,15,32,0.96)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    padding: 24,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  timerCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '900',
    color: '#8B5CF6',
  },
  timerAlertText: {
    color: '#EF4444',
  },
  questionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  optionsList: {
    width: '100%',
  },
  optionBtn: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionCorrect: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: '#EF4444',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  waitingOppFinished: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 18,
  },
  resultsTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 16,
  },
  vsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  vsPlayer: {
    alignItems: 'center',
    width: '40%',
  },
  vsName: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  vsScore: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 4,
  },
  vsText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '900',
    color: colors.accentSoft,
  },
  winnerBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  winnerBadgeText: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '900',
    color: '#10B981',
  },
  winnerSubText: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: '#34D399',
    marginTop: 4,
  },
  tieBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  tieBadgeText: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF',
  },
  loserBadge: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  loserBadgeText: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '900',
    color: '#EF4444',
  },
  backLobbyBtn: {
    marginTop: 10,
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  backLobbyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
