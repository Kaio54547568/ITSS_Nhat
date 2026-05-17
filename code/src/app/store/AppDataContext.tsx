import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import seedData from "../data/data.json";
import { getSession } from "../data/auth";

export type UserStatus = "online" | "offline";
export type FriendRequestStatus = "pending" | "accepted" | "skipped" | "rejected";
export type NotificationType = "friend_request" | "friend_request_accepted" | "message";
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
  verificationStatus: string;
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
  selectedInterests?: string[];
}

interface AppDataContextValue {
  currentUser: AppUser;
  users: AppUser[];
  friendRequests: FriendRequest[];
  notifications: AppNotification[];
  chatThreads: ChatThread[];
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

interface PersistedAppData {
  users: AppUser[];
  friendRequests: FriendRequest[];
  notifications: AppNotification[];
  chatThreads: ChatThread[];
}

const STORAGE_KEY = "nv_friend_app_data_v2";

const AppDataContext = createContext<AppDataContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function threadIdFor(a: string, b: string) {
  return `thread_${[a, b].sort().join("_")}`;
}

function normalizeUser(raw: (typeof seedData.users)[number]): AppUser {
  const countryCode = raw.countryCode === "JP" ? "JP" : "VN";
  return {
    ...raw,
    nationality: countryCode,
    countryCode,
    status: raw.online ? "online" : "offline",
    friends: [],
  };
}

function makeMessage(threadId: string, senderId: string, text: string, createdAt: string): Message {
  return {
    id: `msg_${threadId}_${createdAt}_${senderId}`.replace(/[:.]/g, "_"),
    threadId,
    senderId,
    text,
    createdAt,
    type: "text",
  };
}

function seedThread(currentUserId: string, otherUserId: string, unread: number, messages: Array<[string, string]>) {
  const id = threadIdFor(currentUserId, otherUserId);
  const base = Date.now() - messages.length * 60_000;
  const mapped = messages.map(([senderId, text], index) =>
    makeMessage(id, senderId, text, new Date(base + index * 60_000).toISOString()),
  );
  return {
    id,
    participantIds: [currentUserId, otherUserId],
    lastMessage: mapped.at(-1)?.text ?? "",
    unreadCountByUserId: { [currentUserId]: unread, [otherUserId]: 0 },
    messages: mapped,
  };
}

function buildInitialData(): PersistedAppData {
  const users = seedData.users.map(normalizeUser);
  const userIds = new Set(users.map((user) => user.id));
  const currentUserId = "u1";
  const initialFriendIds = ["u2", "u3", "u4"].filter((id) => userIds.has(id));
  const withFriends = users.map((user) => {
    if (user.id === currentUserId) return { ...user, friends: initialFriendIds };
    if (initialFriendIds.includes(user.id)) return { ...user, friends: [currentUserId] };
    return user;
  });

  const createdAt = new Date(Date.now() - 3600_000).toISOString();
  const friendRequests = seedData.matchRequests
    .filter((request) => userIds.has(request.userId))
    .map((request) => ({
      id: `request_seed_${request.id}`,
      fromUserId: request.userId,
      toUserId: currentUserId,
      status: "pending" as const,
      createdAt,
      updatedAt: createdAt,
    }));

  const notifications = friendRequests.map((request) => {
    const fromUser = withFriends.find((user) => user.id === request.fromUserId);
    return {
      id: `notification_${request.id}`,
      userId: request.toUserId,
      type: "friend_request" as const,
      fromUserId: request.fromUserId,
      requestId: request.id,
      message: `${fromUser?.name ?? "ユーザー"}さんから友達申請が届きました`,
      isRead: false,
      createdAt: request.createdAt,
    };
  });

  const chatThreads = [
    seedThread(currentUserId, "u2", 5, [
      [currentUserId, "こんにちは\n元気ですか?"],
      ["u2", "はい、元気です"],
    ]),
    seedThread(currentUserId, "u3", 3, [
      ["u3", "こんにちは!"],
      [currentUserId, "ありがとうございます"],
    ]),
    seedThread(currentUserId, "u4", 2, [
      [currentUserId, "こんにちは!"],
      ["u4", "元気ですか?"],
    ]),
  ].filter((thread) => thread.participantIds.every((id) => userIds.has(id)));

  return { users: withFriends, friendRequests, notifications, chatThreads };
}

function readInitialData(): PersistedAppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return buildInitialData();
    const parsed = JSON.parse(saved) as PersistedAppData;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.friendRequests)) {
      return buildInitialData();
    }
    return parsed;
  } catch {
    return buildInitialData();
  }
}

function saveData(next: PersistedAppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedAppData>(() => readInitialData());
  const [session, setSession] = useState(() => getSession());
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
    data.users.find((user) => user.id === "u1") ??
    data.users.find((user) => user.role === "user")!;

  const updateData = useCallback((updater: (prev: PersistedAppData) => PersistedAppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

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
      if (currentUser.friends.includes(userId)) return "friend";
      const pending = data.friendRequests.find(
        (request) =>
          request.status === "pending" &&
          ((request.fromUserId === currentUser.id && request.toUserId === userId) ||
            (request.fromUserId === userId && request.toUserId === currentUser.id)),
      );
      if (!pending) return "none";
      return pending.fromUserId === currentUser.id ? "pending_sent" : "pending_received";
    },
    [currentUser.friends, currentUser.id, data.friendRequests],
  );

  const sendFriendRequest = useCallback(
    (toUserId: string) => {
      if (toUserId === currentUser.id || getFriendshipStatus(toUserId) !== "none") return;
      updateData((prev) => {
        const target = prev.users.find((user) => user.id === toUserId);
        if (!target) return prev;
        const createdAt = nowIso();
        const request: FriendRequest = {
          id: `request_${Date.now()}_${currentUser.id}_${toUserId}`,
          fromUserId: currentUser.id,
          toUserId,
          status: "pending",
          createdAt,
          updatedAt: createdAt,
        };
        const notification: AppNotification = {
          id: `notification_${Date.now()}_${toUserId}`,
          userId: toUserId,
          type: "friend_request",
          fromUserId: currentUser.id,
          requestId: request.id,
          message: `${currentUser.name}さんから友達申請が届きました`,
          isRead: false,
          createdAt,
        };
        return {
          ...prev,
          friendRequests: [...prev.friendRequests, request],
          notifications: [...prev.notifications, notification],
        };
      });
    },
    [currentUser.id, currentUser.name, getFriendshipStatus, updateData],
  );

  const ensureThread = useCallback((threads: ChatThread[], a: string, b: string) => {
    const id = threadIdFor(a, b);
    if (threads.some((thread) => thread.id === id)) return threads;
    return [
      ...threads,
      {
        id,
        participantIds: [a, b],
        lastMessage: "",
        unreadCountByUserId: { [a]: 0, [b]: 0 },
        messages: [],
      },
    ];
  }, []);

  const acceptFriendRequest = useCallback(
    (requestId: string) => {
      updateData((prev) => {
        const request = prev.friendRequests.find((item) => item.id === requestId && item.status === "pending");
        if (!request || request.toUserId !== currentUser.id) return prev;
        const acceptedAt = nowIso();
        const accepter = prev.users.find((user) => user.id === request.toUserId);
        const users = prev.users.map((user) => {
          if (user.id === request.fromUserId) {
            return { ...user, friends: Array.from(new Set([...user.friends, request.toUserId])) };
          }
          if (user.id === request.toUserId) {
            return { ...user, friends: Array.from(new Set([...user.friends, request.fromUserId])) };
          }
          return user;
        });
        const notifications = [
          ...prev.notifications.map((notification) =>
            notification.requestId === request.id && notification.userId === currentUser.id
              ? { ...notification, isRead: true }
              : notification,
          ),
          {
            id: `notification_accept_${Date.now()}_${request.fromUserId}`,
            userId: request.fromUserId,
            type: "friend_request_accepted" as const,
            fromUserId: request.toUserId,
            requestId: request.id,
            message: `${accepter?.name ?? "ユーザー"}さんが友達申請を承認しました`,
            isRead: false,
            createdAt: acceptedAt,
          },
        ];
        return {
          ...prev,
          users,
          friendRequests: prev.friendRequests.map((item) =>
            item.id === requestId ? { ...item, status: "accepted", updatedAt: acceptedAt } : item,
          ),
          notifications,
          chatThreads: ensureThread(prev.chatThreads, request.fromUserId, request.toUserId),
        };
      });
    },
    [currentUser.id, ensureThread, updateData],
  );

  const skipFriendRequest = useCallback(
    (requestId: string) => {
      updateData((prev) => ({
        ...prev,
        friendRequests: prev.friendRequests.map((request) =>
          request.id === requestId && request.toUserId === currentUser.id
            ? { ...request, status: "skipped", updatedAt: nowIso() }
            : request,
        ),
        notifications: prev.notifications.map((notification) =>
          notification.requestId === requestId && notification.userId === currentUser.id
            ? { ...notification, isRead: true }
            : notification,
        ),
      }));
    },
    [currentUser.id, updateData],
  );

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      updateData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification.id === notificationId && notification.userId === currentUser.id
            ? { ...notification, isRead: true }
            : notification,
        ),
      }));
    },
    [currentUser.id, updateData],
  );

  const markRequestNotificationsRead = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.userId === currentUser.id && notification.type === "friend_request"
          ? { ...notification, isRead: true }
          : notification,
      ),
    }));
  }, [currentUser.id, updateData]);

  const markThreadRead = useCallback(
    (threadId: string) => {
      updateData((prev) => ({
        ...prev,
        chatThreads: prev.chatThreads.map((thread) => {
          if (thread.id !== threadId || (thread.unreadCountByUserId[currentUser.id] ?? 0) === 0) return thread;
          return {
            ...thread,
            unreadCountByUserId: { ...thread.unreadCountByUserId, [currentUser.id]: 0 },
          };
        }),
        notifications: prev.notifications.map((notification) => {
          if (
            notification.userId === currentUser.id &&
            notification.type === "message" &&
            notification.threadId === threadId &&
            !notification.isRead
          ) {
            return { ...notification, isRead: true };
          }
          return notification;
        }),
      }));
    },
    [currentUser.id, updateData],
  );

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      updateData((prev) => {
        const createdAt = nowIso();
        return {
          ...prev,
          chatThreads: prev.chatThreads.map((thread) => {
            if (thread.id !== threadId) return thread;
            const message: Message = {
              id: `msg_${Date.now()}_${currentUser.id}`,
              threadId,
              senderId: currentUser.id,
              text: trimmed,
              createdAt,
              type: /\p{Emoji}/u.test(trimmed) && trimmed.length <= 4 ? "emoji" : "text",
            };
            return {
              ...thread,
              lastMessage: trimmed,
              messages: [...thread.messages, message],
            };
          }),
        };
      });
    },
    [currentUser.id, updateData],
  );

  const filterUsers = useCallback(
    ({ minAge, maxAge, selectedInterests = [] }: FilterUsersInput) =>
      data.users.filter((user) => {
        if (user.role !== "user" || user.id === currentUser.id) return false;
        if (currentUser.friends.includes(user.id)) return false;
        if (minAge !== undefined && user.age < minAge) return false;
        if (maxAge !== undefined && user.age > maxAge) return false;
        if (selectedInterests.length > 0 && !user.interests.some((interest) => selectedInterests.includes(interest))) {
          return false;
        }
        return true;
      }),
    [currentUser.friends, currentUser.id, data.users],
  );

  const getThreadByProfileId = useCallback(
    (profileId?: string | number | null) => {
      const otherUser = getUserById(profileId);
      if (!otherUser) return undefined;
      return data.chatThreads.find(
        (thread) => thread.participantIds.includes(currentUser.id) && thread.participantIds.includes(otherUser.id),
      );
    },
    [currentUser.id, data.chatThreads, getUserById],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      currentUser,
      users: data.users,
      friendRequests: data.friendRequests,
      notifications: data.notifications,
      chatThreads: data.chatThreads,
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
      sendFriendRequest,
      sendMessage,
      skipFriendRequest,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside AppDataProvider");
  return value;
}
