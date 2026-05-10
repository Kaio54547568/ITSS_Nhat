export type UserRole = "guest" | "user" | "admin";
export type VerificationStatus = "確認待ち" | "承認済み" | "却下";

export interface FriendUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  nationality: "日本" | "ベトナム";
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  avatar: string;
  languages: string[];
  interests: string[];
  personality: string[];
  bio: string;
  matchRate: number;
  online: boolean;
  reportCount: number;
  verificationStatus: VerificationStatus;
  status?: "有効" | "利用停止";
}

export const seedUsers: FriendUser[] = [
  {
    id: "u1",
    name: "佐藤 健",
    username: "sato",
    password: "demo",
    role: "user",
    nationality: "日本",
    age: 31,
    gender: "男性",
    phone: "090-1234-5678",
    email: "sato@example.com",
    address: "ハノイ市バーディン区",
    birthDate: "1995-04-12",
    avatar: "佐",
    languages: ["日本語", "英語", "ベトナム語初級"],
    interests: ["カフェ", "旅行", "ベトナム料理"],
    personality: ["落ち着いている", "聞き上手"],
    bio: "ハノイで働いています。週末にカフェやローカルご飯を一緒に楽しめる友達を探しています。",
    matchRate: 94,
    online: true,
    reportCount: 0,
    verificationStatus: "承認済み",
    status: "有効",
  },
  {
    id: "u2",
    name: "Nguyen Linh",
    username: "linh",
    password: "demo",
    role: "user",
    nationality: "ベトナム",
    age: 22,
    gender: "女性",
    phone: "098-555-1133",
    email: "linh@example.com",
    address: "ハノイ市カウザイ区",
    birthDate: "2004-09-20",
    avatar: "L",
    languages: ["ベトナム語", "日本語N3", "英語"],
    interests: ["日本語", "アニメ", "勉強"],
    personality: ["明るい", "努力家"],
    bio: "大学で日本語を勉強しています。自然な会話を練習しながら友達になりたいです。",
    matchRate: 91,
    online: true,
    reportCount: 1,
    verificationStatus: "確認待ち",
    status: "有効",
  },
  {
    id: "u3",
    name: "山田 美咲",
    username: "misaki",
    password: "demo",
    role: "user",
    nationality: "日本",
    age: 28,
    gender: "女性",
    phone: "080-2222-3322",
    email: "misaki@example.com",
    address: "ハノイ市ホアンキエム区",
    birthDate: "1998-01-08",
    avatar: "美",
    languages: ["日本語", "ベトナム語初級"],
    interests: ["写真", "歴史", "街歩き"],
    personality: ["好奇心旺盛", "丁寧"],
    bio: "旧市街や博物館が好きです。日本語とベトナム語をゆっくり交換できる人と話したいです。",
    matchRate: 88,
    online: false,
    reportCount: 0,
    verificationStatus: "承認済み",
    status: "有効",
  },
  {
    id: "u4",
    name: "Tran Minh",
    username: "minh",
    password: "demo",
    role: "user",
    nationality: "ベトナム",
    age: 24,
    gender: "男性",
    phone: "097-400-9000",
    email: "minh@example.com",
    address: "ハノイ市ドンダー区",
    birthDate: "2002-12-03",
    avatar: "M",
    languages: ["ベトナム語", "日本語N2"],
    interests: ["サッカー", "旅行", "日本文化"],
    personality: ["社交的", "ポジティブ"],
    bio: "将来日本で働きたいです。日本の会社文化や生活について話したいです。",
    matchRate: 85,
    online: true,
    reportCount: 2,
    verificationStatus: "却下",
    status: "有効",
  },
  {
    id: "u5",
    name: "小林 亮",
    username: "kobayashi",
    password: "demo",
    role: "user",
    nationality: "日本",
    age: 36,
    gender: "男性",
    phone: "070-9012-3456",
    email: "kobayashi@example.com",
    address: "ハノイ市タイホー区",
    birthDate: "1990-06-15",
    avatar: "亮",
    languages: ["日本語", "英語"],
    interests: ["ランニング", "料理", "ビジネス"],
    personality: ["誠実", "計画的"],
    bio: "ハノイ生活をもっと楽しみたいです。仕事帰りにご飯や会話ができる友達を探しています。",
    matchRate: 79,
    online: false,
    reportCount: 3,
    verificationStatus: "確認待ち",
    status: "利用停止",
  },
  {
    id: "admin1",
    name: "管理者",
    username: "admin",
    password: "admin",
    role: "admin",
    nationality: "日本",
    age: 35,
    gender: "その他",
    phone: "",
    email: "admin@example.com",
    address: "運営チーム",
    birthDate: "1991-01-01",
    avatar: "管",
    languages: ["日本語", "ベトナム語"],
    interests: ["安全管理"],
    personality: ["公平", "迅速"],
    bio: "日越フレンド運営管理者です。",
    matchRate: 0,
    online: true,
    reportCount: 0,
    verificationStatus: "承認済み",
    status: "有効",
  },
];

export const languageOptions = ["日本語", "ベトナム語", "英語", "日本語N3", "日本語N2", "ベトナム語初級"];
export const interestOptions = ["カフェ", "旅行", "日本語", "ベトナム料理", "アニメ", "勉強", "写真", "日本文化", "料理"];
export const personalityOptions = ["明るい", "落ち着いている", "聞き上手", "好奇心旺盛", "社交的", "誠実", "努力家"];

const USERS_KEY = "nv_friend_users";

export function getUsers(): FriendUser[] {
  const saved = localStorage.getItem(USERS_KEY);
  if (!saved) return seedUsers;
  try {
    return JSON.parse(saved) as FriendUser[];
  } catch {
    return seedUsers;
  }
}

export function saveUsers(users: FriendUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function updateUser(updated: FriendUser) {
  const users = getUsers().map((user) => (user.id === updated.id ? updated : user));
  saveUsers(users);
}
