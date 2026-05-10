export type ReportStatus = "確認待ち" | "対応済み" | "却下" | "利用停止";

export interface ReportItem {
  id: string;
  reporterName: string;
  targetName: string;
  targetId: string;
  date: string;
  reason: string;
  detail: string;
  evidenceImage: string;
  status: ReportStatus;
}

export const reportReasons = ["不適切な行動", "スパム・詐欺", "偽プロフィール", "嫌がらせ", "その他"];

export const seedReports: ReportItem[] = [
  {
    id: "r1",
    reporterName: "Nguyen Linh",
    targetName: "小林 亮",
    targetId: "u5",
    date: "2026-05-02",
    reason: "スパム・詐欺",
    detail: "投資サイトへの登録を何度も勧められました。",
    evidenceImage: "チャット画面のスクリーンショット",
    status: "確認待ち",
  },
  {
    id: "r2",
    reporterName: "佐藤 健",
    targetName: "Tran Minh",
    targetId: "u4",
    date: "2026-05-04",
    reason: "不適切な行動",
    detail: "初対面で不快な表現がありました。",
    evidenceImage: "メッセージ画像",
    status: "確認待ち",
  },
  {
    id: "r3",
    reporterName: "山田 美咲",
    targetName: "Nguyen Linh",
    targetId: "u2",
    date: "2026-04-28",
    reason: "偽プロフィール",
    detail: "プロフィール写真と本人確認の情報に差があります。",
    evidenceImage: "本人確認画像",
    status: "却下",
  },
];

const REPORTS_KEY = "nv_friend_reports";

export function getReports(): ReportItem[] {
  const saved = localStorage.getItem(REPORTS_KEY);
  if (!saved) return seedReports;
  try {
    return JSON.parse(saved) as ReportItem[];
  } catch {
    return seedReports;
  }
}

export function saveReports(reports: ReportItem[]) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}
