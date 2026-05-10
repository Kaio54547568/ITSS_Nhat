import { appUsers } from "./appData";

export interface Contact {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatarColor: string;
  avatarEmoji: string;
  flag: string;
}

export interface Message {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string;
}

export interface SearchUser {
  id: number;
  name: string;
  address: string;
  info: string;
  age: number;
  hobbies: string[];
  languages?: string[];
  personality?: string[];
  gallery?: string[];
  avatarColor: string;
  avatarEmoji: string;
  flag: string;
}

export const mockContacts: Contact[] = [
  {
    id: 1,
    name: "山田",
    lastMessage: "こんにちは!",
    time: "15分",
    unread: 5,
    online: true,
    avatarColor: "#F97316",
    avatarEmoji: "🧑",
    flag: "🇻🇳",
  },
  {
    id: 2,
    name: "田中",
    lastMessage: "ありがとうございます",
    time: "15分",
    unread: 3,
    online: false,
    avatarColor: "#14B8A6",
    avatarEmoji: "👩",
    flag: "🇻🇳",
  },
  {
    id: 3,
    name: "タガシラ",
    lastMessage: "元気ですか?",
    time: "15分",
    unread: 2,
    online: false,
    avatarColor: "#8B5CF6",
    avatarEmoji: "🧑",
    flag: "🇯🇵",
  },
];

export const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 1, sender: "me", content: "こんにちは\n元気ですか?", time: "18:36 PM" },
    { id: 2, sender: "other", content: "はい、元気です", time: "18:36 PM" },
  ],
  2: [
    { id: 1, sender: "other", content: "こんにちは！", time: "14:00 PM" },
    { id: 2, sender: "me", content: "ありがとうございます", time: "14:05 PM" },
  ],
  3: [
    { id: 1, sender: "me", content: "こんにちは！", time: "13:00 PM" },
    { id: 2, sender: "other", content: "元気ですか?", time: "13:10 PM" },
  ],
};

export const suggestedTopics = [
  "今週末、コーヒーでも飲みに行きましょう。",
  "最近の仕事はどうですか？",
  "好きな食べ物は何ですか？",
  "週末は何をしていますか？",
];

export const mockSearchUsers: SearchUser[] = [
  {
    id: 101,
    name: "ユーザー名1",
    address: "東京、日本",
    info: "日本語を勉強しています",
    age: 25,
    hobbies: ["アニメ", "旅行"],
    languages: ["ベトナム語", "日本語"],
    personality: ["正直", "自信満々", "クリエイティブ"],
    gallery: ["友達とカフェ", "日本語クラス", "ハノイ散歩"],
    avatarColor: "#F97316",
    avatarEmoji: "🧑",
    flag: "🇻🇳",
  },
  {
    id: 102,
    name: "ユーザー名2",
    address: "大阪、日本",
    info: "旅行が好きです",
    age: 28,
    hobbies: ["旅行", "読書"],
    languages: ["日本語", "英語"],
    personality: ["親切", "落ち着いている", "好奇心旺盛"],
    gallery: ["週末旅行", "読書会", "カフェ"],
    avatarColor: "#14B8A6",
    avatarEmoji: "👩",
    flag: "🇯🇵",
  },
  {
    id: 103,
    name: "ユーザー名3",
    address: "名古屋、日本",
    info: "スキーが得意です",
    age: 30,
    hobbies: ["スキー", "アニメ"],
    languages: ["ベトナム語", "日本語N2"],
    personality: ["明るい", "社交的", "努力家"],
    gallery: ["スキー旅行", "アニメイベント", "友達"],
    avatarColor: "#8B5CF6",
    avatarEmoji: "🧑",
    flag: "🇻🇳",
  },
  {
    id: 104,
    name: "ユーザー名4",
    address: "福岡、日本",
    info: "読書が趣味です",
    age: 22,
    hobbies: ["読書"],
    languages: ["日本語N3", "ベトナム語"],
    personality: ["誠実", "聞き上手", "前向き"],
    gallery: ["図書館", "大学", "日本語勉強"],
    avatarColor: "#EC4899",
    avatarEmoji: "👩",
    flag: "🇯🇵",
  },
];

export const hobbies = ["全体", "アニメ", "旅行", "スキー", "読書"];

export interface MatchRequest {
  id: number;
  name: string;
  destination: string;
  intro: string;
  avatarColor: string;
  avatarEmoji: string;
  flag: string;
}

export const mockMatchRequests: MatchRequest[] = [
  {
    id: 301,
    name: "ユーザー1",
    destination: "東京",
    intro: "旅行が好きです。",
    avatarColor: "#F97316",
    avatarEmoji: "🧑",
    flag: "🇻🇳",
  },
  {
    id: 302,
    name: "ユーザー2",
    destination: "大阪",
    intro: "日本で友達を作りたいです。",
    avatarColor: "#14B8A6",
    avatarEmoji: "👩",
    flag: "🇯🇵",
  },
  {
    id: 303,
    name: "ユーザー",
    destination: "福岡",
    intro: "カフェ巡りが趣味です。",
    avatarColor: "#8B5CF6",
    avatarEmoji: "🧑",
    flag: "🇻🇳",
  },
];

export const currentUser = {
  id: 0,
  name: "アレックス",
  flag: "🇻🇳",
  avatarColor: "#F97316",
};

// Unified user lookup (contacts + search users)
export function getUserById(id: number): Contact | undefined {
  const contact = mockContacts.find((c) => c.id === id);
  if (contact) return contact;

  const searchUser = mockSearchUsers.find((u) => u.id === id);
  if (searchUser) {
    return {
      id: searchUser.id,
      name: searchUser.name,
      lastMessage: "",
      time: "",
      unread: 0,
      online: true,
      avatarColor: searchUser.avatarColor,
      avatarEmoji: searchUser.avatarEmoji,
      flag: searchUser.flag,
    };
  }

  const appUser = appUsers.find((u) => u.profileId === id);
  if (appUser) {
    return {
      id: appUser.profileId,
      name: appUser.name,
      lastMessage: appUser.bio,
      time: "",
      unread: appUser.unread,
      online: appUser.online,
      avatarColor: appUser.avatarColor,
      avatarEmoji: appUser.avatarEmoji,
      flag: appUser.countryCode,
    };
  }
  return undefined;
}
