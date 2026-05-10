export interface AdminUser {
  id: number;
  name: string;
  email: string;
  status: "有効" | "無効";
  verified: boolean;
  reportCount: number;
}

export interface VerificationRequest {
  id: number;
  name: string;
  email: string;
  birthDate: string;
  applicationDate: string;
  verificationStatus: "確認待ち" | "認証済み" | "未認証";
  avatarEmoji: string;
  avatarColor: string;
}

export interface AdminReport {
  id: number;
  reporter: string;
  reported: string;
  date: string;
  status: "確認待ち" | "却下" | "対応済み";
  reason: string;
  detail: string;
}

export const mockAdminUsers: AdminUser[] = [
  { id: 1, name: "田中", email: "tanaka@gmail.com", status: "有効", verified: true,  reportCount: 0 },
  { id: 2, name: "鈴木", email: "suzuki@gmail.com", status: "有効", verified: true,  reportCount: 1 },
  { id: 3, name: "山本", email: "yamamoto@gmail.com", status: "有効", verified: false, reportCount: 0 },
  { id: 4, name: "さと", email: "sato@gmail.com", status: "有効", verified: true,  reportCount: 2 },
  { id: 5, name: "小林", email: "kobayashi@gmail.com", status: "有効", verified: true,  reportCount: 0 },
  { id: 6, name: "伊藤", email: "ito@gmail.com", status: "有効", verified: false, reportCount: 0 },
  { id: 7, name: "渡辺", email: "watanabe@gmail.com", status: "無効", verified: true,  reportCount: 3 },
  { id: 8, name: "中村", email: "nakamura@gmail.com", status: "有効", verified: true,  reportCount: 0 },
];

export const mockVerificationRequests: VerificationRequest[] = [
  { id: 1, name: "田中", email: "tanaka@gmail.com",    birthDate: "1999-01-01", applicationDate: "2026-03-04", verificationStatus: "確認待ち", avatarEmoji: "👩", avatarColor: "#F97316" },
  { id: 2, name: "鈴木", email: "suzuki@gmail.com",    birthDate: "1998-05-15", applicationDate: "2026-03-06", verificationStatus: "確認待ち", avatarEmoji: "🧑", avatarColor: "#14B8A6" },
  { id: 3, name: "山本", email: "yamamoto@gmail.com",  birthDate: "2000-11-22", applicationDate: "2026-03-07", verificationStatus: "確認待ち", avatarEmoji: "🧑", avatarColor: "#8B5CF6" },
  { id: 4, name: "さと", email: "sato@gmail.com",      birthDate: "1995-07-30", applicationDate: "2026-03-19", verificationStatus: "認証済み",  avatarEmoji: "👩", avatarColor: "#EC4899" },
  { id: 5, name: "小林", email: "kobayashi@gmail.com", birthDate: "2001-03-12", applicationDate: "2026-03-22", verificationStatus: "未認証",   avatarEmoji: "🧑", avatarColor: "#64748B" },
];

export const mockAdminReports: AdminReport[] = [
  { id: 1, reporter: "田中", reported: "鈴木",     date: "2026-03-04", status: "確認待ち", reason: "スパムメッセージ",  detail: "「ユーザーがスパムメッセージを送りました」" },
  { id: 2, reporter: "鈴木", reported: "じんぐ",   date: "2026-03-06", status: "確認待ち", reason: "不適切な行為",     detail: "「不適切なコンテンツを繰り返し送信しています」" },
  { id: 3, reporter: "山本", reported: "なんじょう",date: "2026-03-07", status: "却下",     reason: "偽のプロフィール", detail: "「プロフィール写真が本人ではない可能性があります」" },
  { id: 4, reporter: "さと", reported: "かのん",   date: "2026-03-19", status: "対応済み", reason: "嫌がらせ",         detail: "「継続的な嫌がらせメッセージが確認されました」" },
  { id: 5, reporter: "小林", reported: "さくら",   date: "2026-03-22", status: "却下",     reason: "スパム・詐欺",     detail: "「金銭的な要求が確認されました」" },
];
