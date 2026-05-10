export type VerificationRequestStatus = "確認待ち" | "承認済み" | "却下";

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  submittedAt: string;
  mediaPlaceholder: string;
  status: VerificationRequestStatus;
}

export const seedVerifications: VerificationRequest[] = [
  { id: "v1", userId: "u2", userName: "Nguyen Linh", submittedAt: "2026-05-01 10:20", mediaPlaceholder: "学生証 + 自撮り写真", status: "確認待ち" },
  { id: "v2", userId: "u5", userName: "小林 亮", submittedAt: "2026-05-03 15:12", mediaPlaceholder: "在留カード + 顔写真", status: "確認待ち" },
  { id: "v3", userId: "u3", userName: "山田 美咲", submittedAt: "2026-04-22 09:44", mediaPlaceholder: "パスポート + 顔写真", status: "承認済み" },
  { id: "v4", userId: "u4", userName: "Tran Minh", submittedAt: "2026-04-25 21:30", mediaPlaceholder: "学生証が不鮮明", status: "却下" },
];

const VERIFICATIONS_KEY = "nv_friend_verifications";

export function getVerifications(): VerificationRequest[] {
  const saved = localStorage.getItem(VERIFICATIONS_KEY);
  if (!saved) return seedVerifications;
  try {
    return JSON.parse(saved) as VerificationRequest[];
  } catch {
    return seedVerifications;
  }
}

export function saveVerifications(items: VerificationRequest[]) {
  localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(items));
}
