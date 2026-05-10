export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

export interface ChatThread {
  id: string;
  userId: string;
  unread: number;
  messages: ChatMessage[];
}

export const conversationTopics = ["食べ物", "勉強", "旅行", "日本語", "ベトナム文化"];

export const seedChats: ChatThread[] = [
  {
    id: "u2",
    userId: "u2",
    unread: 2,
    messages: [
      { id: "m1", senderId: "u2", text: "こんにちは！日本語の会話を練習したいです。", time: "18:20" },
      { id: "m2", senderId: "u1", text: "いいですね。週末にカフェで話しましょう。", time: "18:24" },
      { id: "m3", senderId: "u2", text: "ベトナム料理も紹介できます！", time: "18:28" },
    ],
  },
  {
    id: "u3",
    userId: "u3",
    unread: 0,
    messages: [
      { id: "m4", senderId: "u3", text: "旧市街のおすすめカフェを知っていますか？", time: "昨日" },
      { id: "m5", senderId: "u1", text: "いくつかあります。写真がきれいな店もありますよ。", time: "昨日" },
    ],
  },
];

const CHATS_KEY = "nv_friend_chats";

export function getChats(): ChatThread[] {
  const saved = localStorage.getItem(CHATS_KEY);
  if (!saved) return seedChats;
  try {
    return JSON.parse(saved) as ChatThread[];
  } catch {
    return seedChats;
  }
}

export function saveChats(chats: ChatThread[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function ensureThread(userId: string) {
  const chats = getChats();
  const existing = chats.find((chat) => chat.userId === userId);
  if (existing) return existing;
  const thread: ChatThread = { id: userId, userId, unread: 0, messages: [] };
  saveChats([thread, ...chats]);
  return thread;
}
