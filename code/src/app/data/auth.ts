import { FriendUser, getUsers, saveUsers } from "./users";
import { appUsers } from "./appData";
import appData from "./data.json";

const SESSION_KEY = "nv_friend_session";

function notifySessionChanged() {
  window.dispatchEvent(new Event("nv_friend_session_changed"));
}

export interface AuthSession {
  id: string;
  role: "user" | "admin";
  name: string;
}

export function getRedirectPathByRole(role: AuthSession["role"]) {
  const account = appData.demoAccounts.find((item) => item.role === role);
  return account?.redirectAfterLogin ?? (role === "admin" ? "/admin/users" : "/home");
}

export function getSession(): AuthSession | null {
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as AuthSession;
  } catch {
    return null;
  }
}

export function login(username: string, password: string): AuthSession | null {
  const dataUser = appUsers.find((item) => item.username === username && item.password === password);
  const localUser = getUsers().find((item) => item.username === username && item.password === password);
  const user = dataUser ?? localUser;

  if (!user || (user.role !== "user" && user.role !== "admin")) return null;
  const session: AuthSession = { id: user.id, role: user.role, name: user.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifySessionChanged();
  return session;
}

export function quickLogin(role: "user" | "admin"): AuthSession {
  const user = appUsers.find((item) => item.role === role) ?? getUsers().find((item) => item.role === role)!;
  const session: AuthSession = { id: user.id, role: user.role, name: user.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifySessionChanged();
  return session;
}

export function registerUser(username: string, password: string): FriendUser {
  const users = getUsers();
  const newUser: FriendUser = {
    id: `u${Date.now()}`,
    name: username,
    username,
    password,
    role: "user",
    nationality: "ベトナム",
    age: 20,
    gender: "",
    phone: "",
    email: "",
    address: "ハノイ",
    birthDate: "",
    avatar: username.slice(0, 1).toUpperCase(),
    languages: ["ベトナム語", "日本語"],
    interests: ["日本語", "勉強"],
    personality: ["努力家"],
    bio: "プロフィールを編集中です。",
    matchRate: 76,
    online: true,
    reportCount: 0,
    verificationStatus: "確認待ち",
    status: "有効",
  };
  saveUsers([...users, newUser]);
  return newUser;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  notifySessionChanged();
}
