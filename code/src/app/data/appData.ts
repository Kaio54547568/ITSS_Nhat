import data from "./data.json";

export type AppUser = (typeof data.users)[number];
export type MatchRequestData = (typeof data.matchRequests)[number];

export const appUsers: AppUser[] = data.users;
export const matchRequests: MatchRequestData[] = data.matchRequests;

export function getAppUserById(id?: string | number | null) {
  if (id === undefined || id === null) return undefined;
  const value = String(id);
  return appUsers.find((user) => user.id === value || String(user.profileId) === value);
}

export function getNormalUsers(currentUserId?: string) {
  return appUsers.filter((user) => user.role === "user" && user.id !== currentUserId);
}
