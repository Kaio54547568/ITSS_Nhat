import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { getPicUrl } from "../../storage/pics";
import { supabase } from "../../supabase";

interface AdminReport {
  id: string;
  reporter: string;
  reported: string;
  reportedUserId: string;
  date: string;
  status: "確認待ち" | "却下" | "対応済み";
  reason: string;
  detail: string;
  evidenceImage: string;
}

type RStatus = AdminReport["status"];

const statusStyle: Record<RStatus, { color: string; bg: string }> = {
  "確認待ち": { color: "#F97316", bg: "#FFF0E8" },
  "却下": { color: "#DC2626", bg: "#FEE2E2" },
  "対応済み": { color: "#16A34A", bg: "#DCFCE7" },
};

const PAGE_SIZE = 5;

function normalizeReportStatus(status: string | null): RStatus {
  if (status === "却下" || status === "対応済み") return status;
  if (status === "利用停止") return "対応済み";
  return "確認待ち";
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 7)}...` : id;
}

function EvidenceCard({ imagePath }: { imagePath: string }) {
  const imageUrl = getPicUrl(imagePath);
  return (
    <div
      className="relative rounded-xl overflow-hidden mt-2"
      style={{ background: "#FFF8F4", border: "1.5px solid #F5DDD0", height: 160 }}
    >
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="証拠画像" className="w-full h-full object-contain" />
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color: "#C78A70", fontSize: "0.84rem", fontWeight: 700 }}>証拠画像なし</span>
        </div>
      )}
    </div>
  );
}

export function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, reporter_name, target_name, target_user_id, report_date, status, reason, detail, evidence_image")
        .eq("status", "確認待ち")
        .order("report_date", { ascending: false });
      if (error) {
        console.error("Failed to load reports", error);
        return;
      }
      const mapped = (data ?? []).map((report) => ({
        id: report.id,
        reporter: report.reporter_name,
        reported: report.target_name,
        reportedUserId: report.target_user_id ?? "",
        date: report.report_date ?? "",
        status: normalizeReportStatus(report.status),
        reason: report.reason,
        detail: report.detail,
        evidenceImage: report.evidence_image ?? "",
      })) as AdminReport[];
      setReports(mapped);
      setSelectedId((current) => current || mapped[0]?.id || "");
    })();
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.reporter.includes(query) ||
      r.reported.includes(query) ||
      r.id.includes(query)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = reports.find((r) => r.id === selectedId) ?? reports[0];

  const setReportStatus = (id: string, status: RStatus) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const removeProcessedReport = (id: string) => {
    setReports((current) => {
      const next = current.filter((report) => report.id !== id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
  };

  const ignoreReport = async (id: string) => {
    const report = reports.find((item) => item.id === id);
    if (!report || report.status !== "確認待ち") return;

    setReportStatus(id, "却下");
    const { error } = await supabase.from("reports").update({ status: "却下" }).eq("id", id);
    if (error) {
      console.error("Failed to ignore report", error);
      setReportStatus(id, "確認待ち");
      return;
    }
    removeProcessedReport(id);
  };

  const confirmReport = async (id: string) => {
    const report = reports.find((item) => item.id === id);
    if (!report || report.status !== "確認待ち" || !report.reportedUserId) return;

    const { data: profileBefore } = await supabase
      .from("profiles")
      .select("account_status")
      .eq("id", report.reportedUserId)
      .maybeSingle();
    const wasLocked = profileBefore?.account_status === "利用停止";

    setReportStatus(id, "対応済み");
    const { error: reportError } = await supabase
      .from("reports")
      .update({ status: "対応済み" })
      .eq("id", id);
    if (reportError) {
      console.error("Failed to confirm report", reportError);
      setReportStatus(id, "確認待ち");
      return;
    }

    const { count, error: countError } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("target_user_id", report.reportedUserId)
      .eq("status", "対応済み");
    if (countError) {
      console.error("Failed to count confirmed reports", countError);
      return;
    }

    const confirmedCount = count ?? 1;
    const shouldLockAccount = confirmedCount >= 3;
    await supabase
      .from("profiles")
      .update({
        report_count: confirmedCount,
        ...(shouldLockAccount ? { account_status: "利用停止" } : {}),
      })
      .eq("id", report.reportedUserId);
    await supabase
      .from("profile_admin_overrides")
      .update({
        report_count: confirmedCount,
        ...(shouldLockAccount ? { status: "利用停止" } : {}),
      })
      .eq("profile_id", report.reportedUserId);

    if (shouldLockAccount && !wasLocked) {
      await supabase.from("notifications").insert({
        id: `notification_auto_lock_${Date.now()}_${report.reportedUserId}`,
        user_id: report.reportedUserId,
        type: "account_locked",
        from_user_id: "admin1",
        message: "確認済みの通報が3件以上になったため、アカウントが利用停止になりました",
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
    removeProcessedReport(id);
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-53px)]">
        <div
          className="hidden xl:flex flex-col w-[440px] flex-shrink-0 h-full"
          style={{ borderRight: "1.5px solid #F5DDD0", background: "white" }}
        >
          <div className="px-4 pt-4 pb-2">
            <h3 style={{ color: "#F97316", fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>
              通報一覧
            </h3>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 flex-1 px-3 py-2 rounded-full"
                style={{ border: "1.5px solid #F0D5C8", background: "#FFF8F4" }}
              >
                <input
                  type="text"
                  placeholder="通報を検索"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  className="flex-1 bg-transparent outline-none text-sm min-w-0"
                  style={{ color: "#555" }}
                />
                <Search size={14} style={{ color: "#AAAAAA" }} />
              </div>
            </div>
          </div>

          <div
            className="grid px-4 py-2 text-xs"
            style={{
              gridTemplateColumns: "64px minmax(74px,1fr) minmax(74px,1fr) 90px 88px",
              background: "#FFF8F4",
              borderTop: "1px solid #F5DDD0",
              borderBottom: "1px solid #F5DDD0",
              color: "#888",
              fontWeight: 600,
            }}
          >
            <span>ID</span>
            <span>通報者</span>
            <span>通報対象</span>
            <span>通報日</span>
            <span>対応状況</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {paged.length === 0 && (
              <div className="px-4 py-10 text-center" style={{ color: "#AAAAAA", fontSize: "0.9rem" }}>
                確認待ちの通報はありません
              </div>
            )}
            {paged.map((r) => {
              const st = statusStyle[r.status];
              const isSelected = r.id === selectedId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="grid items-center px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: "64px minmax(74px,1fr) minmax(74px,1fr) 90px 88px",
                    borderBottom: "1px solid #F5DDD0",
                    background: isSelected ? "#FEF0E8" : "white",
                  }}
                >
                  <span className="truncate min-w-0" title={r.id} style={{ color: "#888", fontSize: "0.85rem" }}>{shortId(r.id)}</span>
                  <span className="truncate min-w-0" title={r.reporter} style={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.88rem", color: isSelected ? "#F97316" : "#1A1A1A" }}>
                    {r.reporter}
                  </span>
                  <span className="truncate min-w-0" title={r.reported} style={{ fontSize: "0.88rem", color: "#555" }}>{r.reported}</span>
                  <span style={{ fontSize: "0.78rem", color: "#888" }}>
                    {r.date.replace(/-/g, "/")}
                  </span>
                  <div className="flex items-center gap-0.5 min-w-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: st.bg, color: st.color, fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      {r.status}
                    </span>
                    <ChevronDown size={10} style={{ color: "#AAAAAA", flexShrink: 0 }} />
                  </div>
                </div>
              );
            })}
          </div>

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

        {selected && (
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ background: "#FEF0E8" }}>
            <h3 style={{ color: "#F97316", fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}>
              通報詳細
            </h3>

            <div
              className="rounded-2xl p-5"
              style={{ background: "white", border: "1.5px solid #F5DDD0" }}
            >
              <div className="flex flex-col gap-2 mb-4">
                {[
                  ["通報者", selected.reporter],
                  ["通報対象", selected.reported],
                  ["通報日", selected.date.replace(/-/g, "/")],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1A1A1A", width: 64 }}>
                      {label}:
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "#555" }}>{value}</span>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl p-4 mb-4 flex flex-col gap-3"
                style={{ background: "#FFF8F4", border: "1.5px solid #F5DDD0" }}
              >
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 4 }}>
                    通報理由:
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#555" }}>{selected.reason}</p>
                </div>

                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 4 }}>
                    詳細内容:
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#555", fontStyle: "italic" }}>{selected.detail}</p>
                </div>

                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 2 }}>
                    証拠画像:
                  </p>
                  <EvidenceCard imagePath={selected.evidenceImage} />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { void ignoreReport(selected.id); }}
                  disabled={selected.status !== "確認待ち"}
                  className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
                  style={{ background: selected.status === "確認待ち" ? "#22C55E" : "#D1D5DB", color: "white", fontWeight: 700, fontSize: "0.95rem" }}
                >
                  却下
                </button>
                <button
                  onClick={() => { void confirmReport(selected.id); }}
                  disabled={selected.status !== "確認待ち"}
                  className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
                  style={{ background: selected.status === "確認待ち" ? "#EF4444" : "#D1D5DB", color: "white", fontWeight: 700, fontSize: "0.95rem" }}
                >
                  通報を確認
                </button>
              </div>
            </div>
          </div>
        )}
        {!selected && (
          <div className="flex-1 flex items-center justify-center px-6 py-5" style={{ background: "#FEF0E8", color: "#AAAAAA", fontWeight: 700 }}>
            確認待ちの通報はありません
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
