# SKILLS.md - Development Guide for 日越フレンド

## 1. Project Overview

This project is a web application called **日越フレンド**.

The app helps:
- Japanese people living in Vietnam find Vietnamese friends.
- Vietnamese people learning Japanese connect with Japanese users.
- Users find friends based on profile, location, age, nationality, interests, and matching/friend request status.
- Users chat with matched/friend users.
- Admin users review identity verification and manage users.

The product is an MVP for an ITSS Japanese course project. Prioritize core functionality, consistency, and demo readiness over over-engineering.

---

## 2. Tech Stack

Use the current project stack:

- React
- TypeScript
- Vite
- React Router
- CSS / existing styling system in the project

Do not migrate to another framework unless explicitly requested.

Do not introduce a backend unless explicitly requested. If backend-like behavior is needed, use mock data, React state, Context, or localStorage in a clean and replaceable way.

---

## 3. General Development Rules

Before editing:
1. Read the current file structure.
2. Identify existing routes, pages, components, data files, and styles.
3. Reuse existing components and style patterns where possible.
4. Avoid rewriting the whole app unless necessary.

When editing:
- Keep TypeScript strict and clear.
- Avoid using `any` unless there is no reasonable alternative.
- Do not hard-code duplicate data in multiple pages.
- Do not create inconsistent page-specific mock data.
- Prefer a shared store/context/service for app-wide data.
- Keep UI consistent with the current orange-white cute design.
- Do not remove existing working features unless requested.
- Do not rename routes or files unnecessarily.

After editing:
- Run build check.
- Fix TypeScript/build errors.
- Briefly summarize what was changed.

---

## 4. Data Consistency Rule

The most important rule:

**Search, Matching Request, Notifications, Chat, Profile, and Admin must use one consistent source of truth.**

Do not let each page own separate fake user data.

Shared data should include:

```ts
type User = {
  id: string;
  name: string;
  nationality: "VN" | "JP";
  location: string;
  age?: number;
  avatarUrl?: string;
  avatarColor?: string;
  interests: string[];
  bio?: string;
  status?: "online" | "offline";
  friends: string[];
  email?: string;
  birthDate?: string;
  role?: "user" | "admin";
  verificationStatus?: "pending" | "approved" | "rejected";
};

type FriendRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "skipped" | "rejected";
  createdAt: string;
  updatedAt: string;
};

type Notification = {
  id: string;
  userId: string;
  type: "friend_request" | "friend_request_accepted" | "message";
  fromUserId?: string;
  requestId?: string;
  threadId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type ChatThread = {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  unreadCountByUserId: Record<string, number>;
  messages: Message[];
};

type Message = {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
  type: "text" | "emoji";
};