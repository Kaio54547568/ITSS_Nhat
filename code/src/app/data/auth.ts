import { supabase } from "../supabase";

const SESSION_KEY = "nv_friend_session";

function notifySessionChanged() {
  window.dispatchEvent(new Event("nv_friend_session_changed"));
}

export interface AuthSession {
  id: string;
  role: "user" | "admin";
  name: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: "user";
}

export function getRedirectPathByRole(role: AuthSession["role"]) {
  return role === "admin" ? "/admin/users" : "/home";
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

function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifySessionChanged();
}

export async function login(username: string, password: string): Promise<AuthSession | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, name, account_status")
    .eq("username", username)
    .eq("password", password)
    .maybeSingle();

  if (error) {
    console.error("Login failed", error);
    return null;
  }

  if (!data || (data.role !== "user" && data.role !== "admin")) return null;
  if (data.role === "user" && data.account_status === "利用停止") return null;

  const session: AuthSession = {
    id: data.id,
    role: data.role,
    name: data.name ?? username,
  };
  saveSession(session);
  return session;
}

export async function quickLogin(role: "user" | "admin"): Promise<AuthSession> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, name, account_status")
    .eq("role", role)
    .neq("account_status", "利用停止")
    .order("profile_id", { ascending: true })
    .limit(1)
    .single();

  if (error || !data || (data.role !== "user" && data.role !== "admin")) {
    throw error ?? new Error(`No ${role} profile found`);
  }

  const session: AuthSession = {
    id: data.id,
    role: data.role,
    name: data.name ?? role,
  };
  saveSession(session);
  return session;
}

export async function registerUser(username: string, password: string): Promise<RegisteredUser> {
  const id = `u${Date.now()}`;
  const name = username;
  const profileId = Math.floor(Date.now() % 1_000_000_000);
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id,
      profile_id: profileId,
      name,
      username,
      password,
      role: "user",
      nationality: "ベトナム",
      country_code: "VN",
      age: 20,
      gender: "",
      phone: "",
      email: null,
      address: "ハノイ",
      birth_date: "",
      avatar: username.slice(0, 1).toUpperCase(),
      avatar_color: "#F97316",
      avatar_emoji: username.slice(0, 1).toUpperCase(),
      online: false,
      account_status: "未有効",
      languages: [],
      interests: [],
      personality: [],
      gallery: [],
      bio: "",
      match_rate: 76,
      connections: 0,
      message_count: 0,
      unread: 0,
      report_count: 0,
      verification_status: "未申請",
    })
    .select("id, name, username, password, role")
    .single();

  if (error) throw error;
  await supabase.from("profile_admin_overrides").insert({
    id: profileId,
    profile_id: id,
    name,
    email: "",
    status: "未有効",
    verified: false,
    report_count: 0,
  });
  return data as RegisteredUser;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  notifySessionChanged();
}
