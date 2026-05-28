import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Search, ChevronLeft, ChevronRight,
  ChevronDown, Eye, Check, X,
} from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { getPicUrl } from "../../storage/pics";
import { supabase } from "../../supabase";

interface VerificationRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  birthDate: string;
  applicationDate: string;
  verificationStatus: string;
  avatarEmoji: string;
  avatarColor: string;
  idCardImage: string;
  profileSnapshot: Record<string, unknown> | null;
}

type VStatus = VerificationRequest["verificationStatus"];

const statusStyle: Record<string, { color: string; bg: string }> = {
  "確認待ち": { color: "#F97316", bg: "#FFF0E8" },
  "認証済み":  { color: "#16A34A", bg: "#DCFCE7" },
  "未認証":    { color: "#DC2626", bg: "#FEE2E2" },
};

const PAGE_SIZE = 5;

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 7)}...` : id;
}

function displayVerificationId(request: VerificationRequest) {
  return request.id.startsWith("verification_") ? request.userId : request.id;
}

function DocumentImageCard({ imagePath }: { imagePath: string }) {
  const imageUrl = getPicUrl(imagePath);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1.5px solid #F5DDD0", background: "#FFF8F4", minHeight: 130 }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: "#F5DDD0" }}>
        <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#555" }}>本人確認書類</span>
      </div>
      <div className="p-2">
        <div
          className="relative rounded-lg overflow-hidden flex items-center justify-center"
          style={{ background: "#F0E8E0", height: 180, border: "1px solid #E8D8CC" }}
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="本人確認書類" className="w-full h-full object-contain" />
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "#F97316" }}
              >
                <Eye size={13} style={{ color: "white" }} />
              </a>
            </>
          ) : (
            <span style={{ color: "#C78A70", fontSize: "0.84rem", fontWeight: 700 }}>画像なし</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminVerificationPage() {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [query,    setQuery]    = useState("");
  const [page,     setPage]     = useState(1);
  const [selectedId, setSelectedId] = useState<string>("");
  const [processingId, setProcessingId] = useState<string>("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("id, user_id, user_name, email, birth_date, application_date, submitted_at, status, avatar_emoji, avatar_color, id_card_image, profile_snapshot")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to load verification requests", error);
        return;
      }
      const mapped = (data ?? []).map((request) => ({
        id: request.id,
        userId: request.user_id ?? "",
        name: request.user_name,
        email: request.email ?? "",
        birthDate: request.birth_date ?? "",
        applicationDate: request.application_date ?? request.submitted_at ?? "",
        verificationStatus: request.status,
        avatarEmoji: request.avatar_emoji ?? "👤",
        avatarColor: request.avatar_color ?? "#F97316",
        idCardImage: request.id_card_image ?? "",
        profileSnapshot: (request.profile_snapshot as Record<string, unknown> | null) ?? null,
      }));
      setRequests(mapped);
      setSelectedId((current) => current || mapped[0]?.id || "");
    })();
  }, []);

  /* Auto-select from URL param (coming from user list) */
  useEffect(() => {
    const urlId = searchParams.get("id");
    const userId = searchParams.get("user");
    if (urlId || userId) {
      const found = requests.find((r) => r.id === urlId || r.userId === userId);
      if (found) setSelectedId(found.id);
    }
  }, [requests, searchParams]);

  const filtered = requests.filter(
    (r) =>
      r.name.includes(query) ||
      r.email.includes(query) ||
      r.userId.includes(query) ||
      r.id.includes(query)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = requests.find((r) => r.id === selectedId) ?? requests[0];
  const selectedSnapshot = selected?.profileSnapshot ?? {};
  const snapshotText = (key: string, fallback = "") => {
    const value = selectedSnapshot[key];
    return typeof value === "string" && value.trim() ? value : fallback;
  };
  const snapshotList = (key: string) => {
    const value = selectedSnapshot[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  };

  const updateStatus = (id: string, status: VerificationRequest["verificationStatus"]) => {
    if (processingId) return;
    void (async () => {
      const request = requests.find((item) => item.id === id);
      if (!request?.userId) return;

      setProcessingId(id);
      setFeedback("");
      const isApproved = status === "認証済み";
      const resultMessage = isApproved
        ? "アカウント認証が承認されました"
        : "本人確認が却下されました。プロフィールと本人確認書類を確認してください。";

      const { error: requestError } = await supabase
        .from("verification_requests")
        .update({ status })
        .eq("id", id);
      if (requestError) throw requestError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verification_status: status, account_status: isApproved ? "有効" : "未有効" })
        .eq("id", request.userId);
      if (profileError) throw profileError;

      const { error: overrideError } = await supabase
        .from("profile_admin_overrides")
        .update({ verified: isApproved, status: isApproved ? "有効" : "未有効" })
        .eq("profile_id", request.userId);
      if (overrideError) throw overrideError;

      const { error: notificationError } = await supabase.from("notifications").insert({
        id: `notification_verification_${Date.now()}_${request.userId}`,
        user_id: request.userId,
        type: "verification",
        from_user_id: "admin1",
        message: resultMessage,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      if (notificationError) throw notificationError;

      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, verificationStatus: status } : r)));
      setFeedback("本人確認の結果をユーザーへ通知しました");
    })()
      .catch((error) => {
        console.error("Failed to update verification status", error);
        setFeedback("処理に失敗しました。もう一度お試しください。");
      })
      .finally(() => setProcessingId(""));
  };

  const lockSelected = () => {
    if (!selected?.userId) return;
    void (async () => {
      await supabase.from("profiles").update({ account_status: "利用停止" }).eq("id", selected.userId);
      await supabase.from("profile_admin_overrides").update({ status: "利用停止" }).eq("profile_id", selected.userId);
      await supabase.from("notifications").insert({
        id: `notification_lock_${Date.now()}_${selected.userId}`,
        user_id: selected.userId,
        type: "account_locked",
        from_user_id: "admin1",
        message: "管理者によりアカウントが利用停止になりました",
        is_read: false,
        created_at: new Date().toISOString(),
      });
    })().catch((error) => console.error("Failed to lock account", error));
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-53px)]">
        {/* ── Left panel ── */}
        <div
          className="flex flex-col w-[420px] flex-shrink-0 h-full"
          style={{ borderRight: "1.5px solid #F5DDD0", background: "white" }}
        >
          {/* Panel title */}
          <div className="px-4 pt-4 pb-2">
            <h3 style={{ color: "#F97316", fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>
              本人確認一覧
            </h3>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 flex-1 px-3 py-2 rounded-full"
                style={{ border: "1.5px solid #F0D5C8", background: "#FFF8F4" }}
              >
                <input
                  type="text"
                  placeholder="ユーザーID・氏名で検索"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  className="flex-1 bg-transparent outline-none text-sm min-w-0"
                  style={{ color: "#555" }}
                />
                <Search size={14} style={{ color: "#AAAAAA" }} />
              </div>
            </div>
          </div>

          {/* Table header */}
          <div
            className="grid px-4 py-2 text-xs"
            style={{
              gridTemplateColumns: "64px minmax(120px,1fr) 90px 90px",
              background: "#FFF8F4",
              borderTop: "1px solid #F5DDD0",
              borderBottom: "1px solid #F5DDD0",
              color: "#888",
              fontWeight: 600,
            }}
          >
            <span>ID</span>
            <span className="flex items-center gap-0.5">氏名 <ChevronDown size={10} /></span>
            <span>申請日</span>
            <span>認証状況</span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {paged.map((r) => {
              const st = statusStyle[r.verificationStatus] ?? { color: "#F97316", bg: "#FFF0E8" };
              const isSelected = r.id === selectedId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="grid items-center px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: "64px minmax(120px,1fr) 90px 90px",
                    borderBottom: "1px solid #F5DDD0",
                    background: isSelected ? "#FEF0E8" : "white",
                  }}
                >
                  <span className="truncate min-w-0" title={r.id} style={{ color: "#888", fontSize: "0.85rem" }}>
                    {shortId(displayVerificationId(r))}
                  </span>
                  <span className="truncate min-w-0" title={r.name} style={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.88rem", color: isSelected ? "#F97316" : "#1A1A1A" }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#888" }}>
                    {r.applicationDate.replace(/-/g, "/")}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: st.bg, color: st.color, fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      {r.verificationStatus}
                    </span>
                    <ChevronDown size={10} style={{ color: "#AAAAAA", flexShrink: 0 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 py-3 border-t" style={{ borderColor: "#F5DDD0" }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ color: page === 1 ? "#CCC" : "#F97316", border: "1.5px solid #E8E0DC" }}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{ background: page === p ? "#F97316" : "white", color: page === p ? "white" : "#555", border: "1.5px solid #E8E0DC", fontWeight: page === p ? 700 : 400 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ color: page === totalPages ? "#CCC" : "#F97316", border: "1.5px solid #E8E0DC" }}>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* ── Right panel ── */}
        {selected && (
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ background: "#FEF0E8" }}>
            <h3 style={{ color: "#F97316", fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}>
              ユーザー詳細
            </h3>
            {feedback && (
              <div
                className="rounded-2xl px-4 py-2 mb-4"
                style={{
                  background: feedback.includes("失敗") ? "#FEE2E2" : "#F0FFF4",
                  border: `1.5px solid ${feedback.includes("失敗") ? "#FCA5A5" : "#BBF7D0"}`,
                  color: feedback.includes("失敗") ? "#DC2626" : "#16A34A",
                  fontWeight: 700,
                }}
              >
                {feedback}
              </div>
            )}

            {/* User info card */}
            <div
              className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-5"
              style={{ background: "white", border: "1.5px solid #F5DDD0" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: selected.avatarColor }}
              >
                {selected.avatarEmoji}
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A1A1A" }}>{selected.name}</span>
                <span style={{ fontSize: "0.85rem", color: "#555" }}>
                  メールアドレス: <span style={{ color: "#3B82F6" }}>{snapshotText("email", selected.email)}</span>
                </span>
                <span style={{ fontSize: "0.85rem", color: "#555" }}>
                  生年月日: {snapshotText("birthDate", selected.birthDate)}
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 mb-5"
              style={{ background: "white", border: "1.5px solid #F5DDD0" }}
            >
              <h4 style={{ color: "#F97316", fontWeight: 700, fontSize: "0.95rem", marginBottom: 12 }}>
                申請時プロフィール情報
              </h4>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {[
                  ["氏名", snapshotText("name", selected.name)],
                  ["電話", snapshotText("phone")],
                  ["メール", snapshotText("email", selected.email)],
                  ["所在地", snapshotText("address")],
                  ["生年月日", snapshotText("birthDate", selected.birthDate)],
                  ["性別", snapshotText("gender")],
                  ["自己紹介", snapshotText("bio")],
                  ["言語", snapshotList("languages").join("、")],
                  ["興味", snapshotList("interests").join("、")],
                  ["性格", snapshotList("personality").join("、")],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl px-3 py-2" style={{ background: "#FFF8F4", border: "1px solid #F5DDD0" }}>
                    <div style={{ color: "#888", fontSize: "0.75rem", fontWeight: 700 }}>{label}</div>
                    <div style={{ color: value ? "#1A1A1A" : "#AAAAAA", fontSize: "0.88rem", marginTop: 3 }}>
                      {value || "未設定"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <DocumentImageCard imagePath={selected.idCardImage} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => updateStatus(selected.id, "認証済み")}
                disabled={Boolean(processingId)}
                className="flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: processingId ? "#D1D5DB" : "#22C55E", color: "white", fontWeight: 700, fontSize: "1rem" }}
              >
                <Check size={18} /> {processingId === selected.id ? "処理中" : "承認"}
              </button>
              <button
                onClick={() => updateStatus(selected.id, "未認証")}
                disabled={Boolean(processingId)}
                className="flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: processingId ? "#D1D5DB" : "#EF4444", color: "white", fontWeight: 700, fontSize: "1rem" }}
              >
                <X size={18} /> {processingId === selected.id ? "処理中" : "却下"}
              </button>
              <button
                onClick={lockSelected}
                className="flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#111827", color: "white", fontWeight: 700, fontSize: "1rem" }}
              >
                利用停止
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
