import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// MOCK DATABASE & REAL-TIME EMULATION
// ==========================================
// This local database engine runs automatically to ensure the app compiles
// and is testable on Web and APK. It simulates real-time multiplayer rooms.

interface User {
  username: string;
  passwordHash: string;
  quizPoints: number;
}

// Simple SHA-256 password hashing simulation
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

// Local storage keys
const USERS_KEY = '@eternal_hub_users';
const SESSION_KEY = '@eternal_hub_session';
const SCORES_KEY = '@eternal_hub_scores_sync';
const MOCK_ROOMS_KEY = '@eternal_hub_rooms';

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const nameLower = username.trim().toLowerCase();
    if (!nameLower || password.length < 4) {
      return { success: false, error: 'Kullanıcı adı boş olamaz ve şifre en az 4 hane olmalıdır.' };
    }

    const usersStr = await AsyncStorage.getItem(USERS_KEY);
    const users: Record<string, User> = usersStr ? JSON.parse(usersStr) : {};

    if (users[nameLower]) {
      return { success: false, error: 'Bu kullanıcı adı zaten alınmış.' };
    }

    users[nameLower] = {
      username: username.trim(),
      passwordHash: hashPassword(password),
      quizPoints: 0,
    };

    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Kayıt sırasında bir hata oluştu.' };
  }
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string; quizPoints: number }; error?: string }> => {
  try {
    const nameLower = username.trim().toLowerCase();
    const usersStr = await AsyncStorage.getItem(USERS_KEY);
    const users: Record<string, User> = usersStr ? JSON.parse(usersStr) : {};

    const user = users[nameLower];
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Hatalı kullanıcı adı veya şifre.' };
    }

    const sessionUser = { username: user.username, quizPoints: user.quizPoints };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  } catch (err) {
    return { success: false, error: 'Giriş sırasında bir hata oluştu.' };
  }
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = async (): Promise<{ username: string; quizPoints: number } | null> => {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

// Global High Scores Sync
export const syncHighScore = async (gameKey: string, score: number) => {
  const user = await getCurrentUser();
  if (!user) return;
  
  try {
    const syncStr = await AsyncStorage.getItem(SCORES_KEY) || '{}';
    const scores = JSON.parse(syncStr);
    
    // Only update if it's higher than the synced high score
    const currentSync = scores[user.username.toLowerCase()]?.[gameKey] || 0;
    if (score > currentSync) {
      if (!scores[user.username.toLowerCase()]) {
        scores[user.username.toLowerCase()] = {};
      }
      scores[user.username.toLowerCase()][gameKey] = score;
      await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    }
  } catch (e) {
    // Ignore error
  }
};

// ==========================================
// REAL-TIME MULTIPLAYER QUIZ ROOM EMULATION
// ==========================================
// To enable true real-time, the Room state is polled or listened to.
// Under mock mode, we use AsyncStorage and a simulated background opponent
// if no other player joins in 5 seconds, so they can test the multiplayer flow single-handedly!

export interface QuizRoom {
  code: string;
  status: 'waiting' | 'playing' | 'ended';
  p1: string;
  p2: string | null;
  p1_score: number;
  p2_score: number;
  p1_qIdx: number;
  p2_qIdx: number;
  winner: string | null;
}

const ROOM_LIFETIME = 150000; // 2.5 minutes

export const createQuizRoom = async (username: string): Promise<QuizRoom> => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const room: QuizRoom = {
    code,
    status: 'waiting',
    p1: username,
    p2: null,
    p1_score: 0,
    p2_score: 0,
    p1_qIdx: 0,
    p2_qIdx: 0,
    winner: null,
  };
  
  const roomsStr = await AsyncStorage.getItem(MOCK_ROOMS_KEY) || '{}';
  const rooms = JSON.parse(roomsStr);
  rooms[code] = room;
  await AsyncStorage.setItem(MOCK_ROOMS_KEY, JSON.stringify(rooms));
  return room;
};

export const joinQuizRoom = async (code: string, username: string): Promise<{ success: boolean; room?: QuizRoom; error?: string }> => {
  const roomsStr = await AsyncStorage.getItem(MOCK_ROOMS_KEY) || '{}';
  const rooms = JSON.parse(roomsStr);
  const room: QuizRoom = rooms[code];

  if (!room) {
    return { success: false, error: 'Oda bulunamadı. Lütfen kodu kontrol edin.' };
  }
  if (room.status !== 'waiting') {
    return { success: false, error: 'Oda dolu veya oyun zaten başlamış.' };
  }
  if (room.p1.toLowerCase() === username.toLowerCase()) {
    return { success: false, error: 'Kendi kurduğun odaya katılamazsın!' };
  }

  room.p2 = username;
  room.status = 'playing';
  rooms[code] = room;
  await AsyncStorage.setItem(MOCK_ROOMS_KEY, JSON.stringify(rooms));
  return { success: true, room };
};

export const updateQuizProgress = async (
  code: string,
  username: string,
  score: number,
  qIdx: number
): Promise<QuizRoom | null> => {
  const roomsStr = await AsyncStorage.getItem(MOCK_ROOMS_KEY) || '{}';
  const rooms = JSON.parse(roomsStr);
  const room: QuizRoom = rooms[code];

  if (!room) return null;

  const isP1 = room.p1.toLowerCase() === username.toLowerCase();
  if (isP1) {
    room.p1_score = score;
    room.p1_qIdx = qIdx;
  } else {
    room.p2_score = score;
    room.p2_qIdx = qIdx;
  }

  // End game if both players finished 10 questions
  if (room.p1_qIdx >= 10 && room.p2_qIdx >= 10 && room.status === 'playing') {
    room.status = 'ended';
    if (room.p1_score > room.p2_score) {
      room.winner = room.p1;
    } else if (room.p2_score > room.p1_score) {
      room.winner = room.p2;
    } else {
      room.winner = 'TIE';
    }

    // Award quiz points
    if (room.winner !== 'TIE' && room.winner) {
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const winnerKey = room.winner.toLowerCase();
        if (users[winnerKey]) {
          users[winnerKey].quizPoints += 15; // 15 points per win
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
          
          // Update session if it's the current player
          const session = await AsyncStorage.getItem(SESSION_KEY);
          if (session) {
            const current = JSON.parse(session);
            if (current.username.toLowerCase() === winnerKey) {
              current.quizPoints = users[winnerKey].quizPoints;
              await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(current));
            }
          }
        }
      }
    }
  }

  rooms[code] = room;
  await AsyncStorage.setItem(MOCK_ROOMS_KEY, JSON.stringify(rooms));
  return room;
};

export const getRoomState = async (code: string): Promise<QuizRoom | null> => {
  const roomsStr = await AsyncStorage.getItem(MOCK_ROOMS_KEY) || '{}';
  const rooms = JSON.parse(roomsStr);
  return rooms[code] || null;
};

// Simulated Opponent (Bot) Generator for single-player testing
// If player is waiting in lobby and wants to test, they can invoke the bot
export const activateSimulatedOpponent = async (code: string) => {
  const roomsStr = await AsyncStorage.getItem(MOCK_ROOMS_KEY) || '{}';
  const rooms = JSON.parse(roomsStr);
  const room: QuizRoom = rooms[code];
  if (!room || room.status !== 'waiting') return;

  room.p2 = 'RakipBot 🤖';
  room.status = 'playing';
  rooms[code] = room;
  await AsyncStorage.setItem(MOCK_ROOMS_KEY, JSON.stringify(rooms));

  // Start simulated opponent progress intervals
  let qIdx = 0;
  let botScore = 0;
  
  const botInterval = setInterval(async () => {
    qIdx += 1;
    if (Math.random() > 0.45) {
      botScore += 1;
    }
    
    await updateQuizProgress(code, 'RakipBot 🤖', botScore, qIdx);
    
    if (qIdx >= 10) {
      clearInterval(botInterval);
    }
  }, 3500 + Math.random() * 2000); // bot answers a question every 3.5-5.5 seconds
};
