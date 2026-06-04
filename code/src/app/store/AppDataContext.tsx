import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getSession } from "../data/auth";
import { rankCompatibleUsers } from "../matching";
import { supabase } from "../supabase";

export type UserStatus = "online" | "offline";
export type FriendRequestStatus = "pending" | "accepted" | "skipped" | "rejected";
export type NotificationType =
  | "friend_request"
  | "friend_request_accepted"
  | "friend_request_rejected"
  | "message"
  | "report"
  | "verification"
  | "account_locked";
export type MessageType = "text" | "emoji";

export interface AppUser {
  id: string;
  profileId: number;
  name: string;
  username: string;
  password: string;
  role: "user" | "admin";
  email: string;
  phone: string;
  nationality: "VN" | "JP";
  countryCode: "VN" | "JP";
  age: number;
  gender: string;
  address: string;
  destination: string;
  birthDate: string;
  avatarPath: string;
  avatarColor: string;
  avatarEmoji: string;
  online: boolean;
  status: UserStatus;
  languages: string[];
  interests: string[];
  personality: string[];
  bio: string;
  matchRate: number;
  connections: number;
  messageCount: number;
  unread: number;
  reportCount: number;
  accountStatus: string;
  verificationStatus: string;
  idCardImagePath: string;
  idCardFrontImagePath: string;
  idCardBackImagePath: string;
  idCardSelfieImagePath: string;
  gallery: string[];
  friends: string[];
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  fromUserId: string;
  requestId?: string;
  threadId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
  type: MessageType;
}

export interface ChatThread {
  id: string;
  participantIds: string[];
  lastMessage: string;
  unreadCountByUserId: Record<string, number>;
  messages: Message[];
}

interface FilterUsersInput {
  minAge?: number;
  maxAge?: number;
}

interface AppDataContextValue {
  currentUser: AppUser;
  users: AppUser[];
  friendRequests: FriendRequest[];
  notifications: AppNotification[];
  chatThreads: ChatThread[];
  refreshData: () => Promise<void>;
  sendFriendRequest: (toUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  skipFriendRequest: (requestId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markRequestNotificationsRead: () => void;
  markThreadRead: (threadId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  filterUsers: (input: FilterUsersInput) => AppUser[];
  getUserById: (id?: string | number | null) => AppUser | undefined;
  getThreadByProfileId: (profileId?: string | number | null) => ChatThread | undefined;
  getFriendshipStatus: (userId: string) => "self" | "friend" | "pending_sent" | "pending_received" | "none";
}

interface AppData {
  users: AppUser[];
  friendRequests: FriendRequest[];
  notifications: AppNotification[];
  chatThreads: ChatThread[];
}

type ProfileRow = {
  id: string;
  profile_id: number | null;
  name: string | null;
  username: string | null;
  password: string | null;
  role: "guest" | "user" | "admin" | null;
  email: string | null;
  phone: string | null;
  country_code: "VN" | "JP" | null;
  age: number | null;
  gender: string | null;
  address: string | null;
  destination: string | null;
  birth_date: string | null;
  avatar: string | null;
  id_card_image: string | null;
  id_card_front_image: string | null;
  id_card_back_image: string | null;
  id_card_selfie_image: string | null;
  avatar_color: string | null;
  avatar_emoji: string | null;
  online: boolean | null;
  languages: string[] | null;
  interests: string[] | null;
  personality: string[] | null;
  bio: string | null;
  match_rate: number | null;
  connections: number | null;
  message_count: number | null;
  unread: number | null;
  report_count: number | null;
  account_status: string | null;
  verification_status: string | null;
  gallery: string[] | null;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const emptyData: AppData = {
  users: [],
  friendRequests: [],
  notifications: [],
  chatThreads: [],
};

const realtimeTables = [
  "chat_messages",
  "chat_threads",
  "chat_thread_participants",
  "notifications",
  "friend_requests",
  "friendships",
  "profiles",
] as const;

function nowIso() {
  return new Date().toISOString();
}

function threadIdFor(a: string, b: string) {
  return `thread_${[a, b].sort().join("_")}`;
}

function mapProfile(row: ProfileRow, friends: string[]): AppUser {
  const countryCode = row.country_code === "JP" ? "JP" : "VN";
  return {
    id: row.id,
    profileId: row.profile_id ?? 0,
    name: row.name ?? "",
    username: row.username ?? "",
    password: row.password ?? "",
    role: row.role === "admin" ? "admin" : "user",
    email: row.email ?? "",
    phone: row.phone ?? "",
    nationality: countryCode,
    countryCode,
    age: row.age ?? 0,
    gender: row.gender ?? "",
    address: row.address ?? "",
    destination: row.destination ?? "",
    birthDate: row.birth_date ?? "",
    avatarPath: row.avatar ?? "",
    avatarColor: row.avatar_color ?? "#F97316",
    avatarEmoji: row.avatar_emoji ?? "👤",
    online: Boolean(row.online),
    status: row.online ? "online" : "offline",
    languages: row.languages ?? [],
    interests: row.interests ?? [],
    personality: row.personality ?? [],
    bio: row.bio ?? "",
    matchRate: row.match_rate ?? 0,
    connections: row.connections ?? friends.length,
    messageCount: row.message_count ?? 0,
    unread: row.unread ?? 0,
    reportCount: row.report_count ?? 0,
    accountStatus: row.account_status ?? "有効",
    verificationStatus: row.verification_status ?? "",
    idCardImagePath: row.id_card_image ?? "",
    idCardFrontImagePath: row.id_card_front_image ?? row.id_card_image ?? "",
    idCardBackImagePath: row.id_card_back_image ?? "",
    idCardSelfieImagePath: row.id_card_selfie_image ?? "",
    gallery: row.gallery ?? [],
    friends,
  };
}

function fallbackUser(users: AppUser[]): AppUser {
  return (
    users.find((user) => user.id === "u1") ??
    users.find((user) => user.role === "user") ?? {
      id: "u1",
      profileId: 101,
      name: "",
      username: "",
      password: "",
      role: "user",
      email: "",
      phone: "",
      nationality: "VN",
      countryCode: "VN",
      age: 0,
      gender: "",
      address: "",
      destination: "",
      birthDate: "",
      avatarPath: "",
      avatarColor: "#F97316",
      avatarEmoji: "👤",
      online: false,
      status: "offline",
      languages: [],
      interests: [],
      personality: [],
      bio: "",
      matchRate: 0,
      connections: 0,
      messageCount: 0,
      unread: 0,
      reportCount: 0,
      accountStatus: "有効",
      verificationStatus: "",
      idCardImagePath: "",
      idCardFrontImagePath: "",
      idCardBackImagePath: "",
      idCardSelfieImagePath: "",
      gallery: [],
      friends: [],
    }
  );
}

async function loadAppData(): Promise<AppData> {
  const [
    profilesResult,
    friendshipsResult,
    friendRequestsResult,
    notificationsResult,
    threadsResult,
    participantsResult,
    messagesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("profile_id", { ascending: true }),
    supabase.from("friendships").select("user_id, friend_id"),
    supabase.from("friend_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("chat_threads").select("*").order("updated_at", { ascending: false }),
    supabase.from("chat_thread_participants").select("*"),
    supabase.from("chat_messages").select("*").order("created_at", { ascending: true }),
  ]);

  const firstError =
    profilesResult.error ??
    friendshipsResult.error ??
    friendRequestsResult.error ??
    notificationsResult.error ??
    threadsResult.error ??
    participantsResult.error ??
    messagesResult.error;

  if (firstError) throw firstError;

  const friendsByUser = new Map<string, string[]>();
  for (const row of friendshipsResult.data ?? []) {
    const current = friendsByUser.get(row.user_id) ?? [];
    current.push(row.friend_id);
    friendsByUser.set(row.user_id, current);
  }

  const users = ((profilesResult.data ?? []) as ProfileRow[]).map((row) => mapProfile(row, friendsByUser.get(row.id) ?? []));

  const friendRequests = (friendRequestsResult.data ?? []).map((row) => ({
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) as FriendRequest[];

  const notifications = (notificationsResult.data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    fromUserId: row.from_user_id,
    requestId: row.request_id ?? undefined,
    threadId: row.thread_id ?? undefined,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  })) as AppNotification[];

  const participantsByThread = new Map<string, string[]>();
  const unreadByThread = new Map<string, Record<string, number>>();
  for (const row of participantsResult.data ?? []) {
    participantsByThread.set(row.thread_id, [...(participantsByThread.get(row.thread_id) ?? []), row.user_id]);
    unreadByThread.set(row.thread_id, {
      ...(unreadByThread.get(row.thread_id) ?? {}),
      [row.user_id]: row.unread_count ?? 0,
    });
  }

  const messagesByThread = new Map<string, Message[]>();
  for (const row of messagesResult.data ?? []) {
    const message: Message = {
      id: row.id,
      threadId: row.thread_id,
      senderId: row.sender_id,
      text: row.text,
      createdAt: row.created_at,
      type: row.message_type,
    };
    messagesByThread.set(row.thread_id, [...(messagesByThread.get(row.thread_id) ?? []), message]);
  }

  const chatThreads = (threadsResult.data ?? []).map((row) => ({
    id: row.id,
    participantIds: participantsByThread.get(row.id) ?? [],
    lastMessage: row.last_message ?? "",
    unreadCountByUserId: unreadByThread.get(row.id) ?? {},
    messages: messagesByThread.get(row.id) ?? [],
  })) as ChatThread[];

  return { users, friendRequests, notifications, chatThreads };
}

async function ensureThreadInDatabase(a: string, b: string) {
  const id = threadIdFor(a, b);
  const createdAt = nowIso();
  await supabase.from("chat_threads").upsert({ id, last_message: "", created_at: createdAt, updated_at: createdAt });
  await supabase.from("chat_thread_participants").upsert([
    { thread_id: id, user_id: a, unread_count: 0 },
    { thread_id: id, user_id: b, unread_count: 0 },
  ]);
  return id;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(() => getSession());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const next = await loadAppData();
      setData(next);
    } catch (error) {
      console.error("Failed to load app data from Supabase", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  useEffect(() => {
    const scheduleRefresh = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => {
        void refreshData();
      }, 120);
    };

    let channel = supabase.channel("app-data-realtime");
    for (const table of realtimeTables) {
      channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleRefresh);
    }
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("Supabase realtime channel status:", status);
      }
    });

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      void supabase.removeChannel(channel);
    };
  }, [refreshData]);

  useEffect(() => {
    const refreshSession = () => setSession(getSession());
    window.addEventListener("storage", refreshSession);
    window.addEventListener("nv_friend_session_changed", refreshSession);
    return () => {
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("nv_friend_session_changed", refreshSession);
    };
  }, []);

  const currentUser =
    data.users.find((user) => user.id === session?.id && user.role === "user") ??
    data.users.find((user) => user.id === session?.id) ??
    fallbackUser(data.users);

  const getUserById = useCallback(
    (id?: string | number | null) => {
      if (id === undefined || id === null) return undefined;
      const value = String(id);
      return data.users.find((user) => user.id === value || String(user.profileId) === value);
    },
    [data.users],
  );

  const getFriendshipStatus = useCallback(
    (userId: string) => {
      if (userId === currentUser.id) return "self";
      const pending = data.friendRequests.find(
        (request) =>
          request.status === "pending" &&
          ((request.fromUserId === currentUser.id && request.toUserId === userId) ||
            (request.fromUserId === userId && request.toUserId === currentUser.id)),
      );
      if (pending) return pending.fromUserId === currentUser.id ? "pending_sent" : "pending_received";
      if (currentUser.friends.includes(userId)) return "friend";
      return "none";
    },
    [currentUser.friends, currentUser.id, data.friendRequests],
  );

  const sendFriendRequest = useCallback(
    (toUserId: string) => {
      if (toUserId === currentUser.id || getFriendshipStatus(toUserId) !== "none") return;
      void (async () => {
        const createdAt = nowIso();
        const requestId = `request_${Date.now()}_${currentUser.id}_${toUserId}`;
        const target = data.users.find((user) => user.id === toUserId);
        const { error: requestError } = await supabase.from("friend_requests").insert({
          id: requestId,
          from_user_id: currentUser.id,
          to_user_id: toUserId,
          status: "pending",
          created_at: createdAt,
          updated_at: createdAt,
        });
        if (requestError) throw requestError;

        const { error: notificationError } = await supabase.from("notifications").insert({
          id: `notification_${Date.now()}_${toUserId}`,
          user_id: toUserId,
          type: "friend_request",
          from_user_id: currentUser.id,
          request_id: requestId,
          message: `${currentUser.name}さんから友達申請が届きました`,
          is_read: false,
          created_at: createdAt,
        });
        if (notificationError) throw notificationError;
        if (target) void refreshData();
      })().catch((error) => console.error("Failed to send friend request", error));
    },
    [currentUser.id, currentUser.name, data.users, getFriendshipStatus, refreshData],
  );

  const acceptFriendRequest = useCallback(
    (requestId: string) => {
      void (async () => {
        const request = data.friendRequests.find((item) => item.id === requestId && item.status === "pending");
        if (!request || request.toUserId !== currentUser.id) return;
        const acceptedAt = nowIso();
        const accepter = data.users.find((user) => user.id === request.toUserId);

        const { error: requestError } = await supabase
          .from("friend_requests")
          .update({ status: "accepted", updated_at: acceptedAt })
          .eq("id", requestId);
        if (requestError) throw requestError;

        const { error: friendshipError } = await supabase.from("friendships").upsert([
          { user_id: request.fromUserId, friend_id: request.toUserId, created_at: acceptedAt },
          { user_id: request.toUserId, friend_id: request.fromUserId, created_at: acceptedAt },
        ]);
        if (friendshipError) throw friendshipError;

        await ensureThreadInDatabase(request.fromUserId, request.toUserId);

        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("request_id", request.id)
          .eq("user_id", currentUser.id);

        const { error: notificationError } = await supabase.from("notifications").insert({
          id: `notification_accept_${Date.now()}_${request.fromUserId}`,
          user_id: request.fromUserId,
          type: "friend_request_accepted",
          from_user_id: request.toUserId,
          request_id: request.id,
          message: `${accepter?.name ?? "ユーザー"}さんが友達申請を承認しました`,
          is_read: false,
          created_at: acceptedAt,
        });
        if (notificationError) throw notificationError;

        void refreshData();
      })().catch((error) => console.error("Failed to accept friend request", error));
    },
    [currentUser.id, data.friendRequests, data.users, refreshData],
  );

  const skipFriendRequest = useCallback(
    (requestId: string) => {
      void (async () => {
        const updatedAt = nowIso();
        const { error } = await supabase
          .from("friend_requests")
          .update({ status: "skipped", updated_at: updatedAt })
          .eq("id", requestId)
          .eq("to_user_id", currentUser.id);
        if (error) throw error;

        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("request_id", requestId)
          .eq("user_id", currentUser.id);

        const request = data.friendRequests.find((item) => item.id === requestId);
        if (request) {
          await supabase.from("notifications").insert({
            id: `notification_reject_${Date.now()}_${request.fromUserId}`,
            user_id: request.fromUserId,
            type: "friend_request_rejected",
            from_user_id: currentUser.id,
            request_id: request.id,
            message: `${currentUser.name}さんが友達申請を拒否しました`,
            is_read: false,
            created_at: updatedAt,
          });
        }

        void refreshData();
      })().catch((error) => console.error("Failed to skip friend request", error));
    },
    [currentUser.id, currentUser.name, data.friendRequests, refreshData],
  );

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      void (async () => {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId)
          .eq("user_id", currentUser.id);
        if (error) throw error;
        void refreshData();
      })().catch((error) => console.error("Failed to mark notification read", error));
    },
    [currentUser.id, refreshData],
  );

  const markRequestNotificationsRead = useCallback(() => {
    void (async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", currentUser.id);
      if (error) throw error;
      void refreshData();
    })().catch((error) => console.error("Failed to mark request notifications read", error));
  }, [currentUser.id, refreshData]);

  const markThreadRead = useCallback(
    (threadId: string) => {
      void (async () => {
        const { error } = await supabase
          .from("chat_thread_participants")
          .update({ unread_count: 0 })
          .eq("thread_id", threadId)
          .eq("user_id", currentUser.id);
        if (error) throw error;

        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", currentUser.id)
          .eq("type", "message")
          .eq("thread_id", threadId);

        void refreshData();
      })().catch((error) => console.error("Failed to mark thread read", error));
    },
    [currentUser.id, refreshData],
  );

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      void (async () => {
        const createdAt = nowIso();
        const messageType: MessageType = /\p{Emoji}/u.test(trimmed) && trimmed.length <= 4 ? "emoji" : "text";
        const { error: messageError } = await supabase.from("chat_messages").insert({
          id: `msg_${Date.now()}_${currentUser.id}`,
          thread_id: threadId,
          sender_id: currentUser.id,
          text: trimmed,
          message_type: messageType,
          created_at: createdAt,
        });
        if (messageError) throw messageError;

        const { error: threadError } = await supabase
          .from("chat_threads")
          .update({ last_message: trimmed, updated_at: createdAt })
          .eq("id", threadId);
        if (threadError) throw threadError;

        const thread = data.chatThreads.find((item) => item.id === threadId);
        const recipients = thread?.participantIds.filter((id) => id !== currentUser.id) ?? [];
        for (const recipientId of recipients) {
          const currentUnread = thread?.unreadCountByUserId[recipientId] ?? 0;
          await supabase
            .from("chat_thread_participants")
            .update({ unread_count: currentUnread + 1 })
            .eq("thread_id", threadId)
            .eq("user_id", recipientId);
          await supabase.from("notifications").insert({
            id: `notification_message_${Date.now()}_${recipientId}`,
            user_id: recipientId,
            type: "message",
            from_user_id: currentUser.id,
            thread_id: threadId,
            message: "新しいメッセージが届きました",
            is_read: false,
            created_at: createdAt,
          });
        }

        void refreshData();
      })().catch((error) => console.error("Failed to send message", error));
    },
    [currentUser.id, data.chatThreads, refreshData],
  );

  const filterUsers = useCallback(
    ({ minAge, maxAge }: FilterUsersInput) => {
      const candidates = data.users.filter((user) => {
        if (user.role !== "user" || user.id === currentUser.id) return false;
        if (user.accountStatus !== "有効") return false;
        if (user.verificationStatus !== "認証済み" && user.verificationStatus !== "承認済み") return false;
        const hasIncomingPendingRequest = data.friendRequests.some(
          (request) =>
            request.status === "pending" &&
            request.fromUserId === user.id &&
            request.toUserId === currentUser.id,
        );
        if (currentUser.friends.includes(user.id) && !hasIncomingPendingRequest) return false;
        return true;
      });
      return rankCompatibleUsers(currentUser, candidates, { minAge, maxAge });
    },
    [currentUser.friends, currentUser.id, data.friendRequests, data.users],
  );

  const getThreadByProfileId = useCallback(
    (profileId?: string | number | null) => {
      const otherUser = getUserById(profileId);
      if (!otherUser) return undefined;
      if (getFriendshipStatus(otherUser.id) !== "friend") return undefined;
      return data.chatThreads.find(
        (thread) => thread.participantIds.includes(currentUser.id) && thread.participantIds.includes(otherUser.id),
      );
    },
    [currentUser.id, data.chatThreads, getFriendshipStatus, getUserById],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      currentUser,
      users: data.users,
      friendRequests: data.friendRequests,
      notifications: data.notifications,
      chatThreads: data.chatThreads,
      refreshData,
      sendFriendRequest,
      acceptFriendRequest,
      skipFriendRequest,
      markNotificationRead,
      markRequestNotificationsRead,
      markThreadRead,
      sendMessage,
      filterUsers,
      getUserById,
      getThreadByProfileId,
      getFriendshipStatus,
    }),
    [
      acceptFriendRequest,
      currentUser,
      data.chatThreads,
      data.friendRequests,
      data.notifications,
      data.users,
      filterUsers,
      getFriendshipStatus,
      getThreadByProfileId,
      getUserById,
      markNotificationRead,
      markRequestNotificationsRead,
      markThreadRead,
      refreshData,
      sendFriendRequest,
      sendMessage,
      skipFriendRequest,
    ],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fff7f2", color: "#E8641A" }}>
        Loading...
      </div>
    );
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside AppDataProvider");
  return value;
}
