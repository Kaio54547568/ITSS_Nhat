import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Search, ChevronLeft, ChevronRight,
  ChevronDown, Eye, Check, X,
} from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { mockVerificationRequests, type VerificationRequest } from "../../data/adminMockData";

type VStatus = VerificationRequest["verificationStatus"];

const statusStyle: Record<VStatus, { color: string; bg: string }> = {
  "確認待ち": { color: "#F97316", bg: "#FFF0E8" },
  "認証済み":  { color: "#16A34A", bg: "#DCFCE7" },
  "未認証":    { color: "#DC2626", bg: "#FEE2E2" },
};

const PAGE_SIZE = 5;

/* ── Document placeholder card ── */
function DocCard({ label }: { label: string }) {
  return (
    <div
      className="flex-1 rounded-xl overflow-hidden"
      style={{ border: "1.5px solid #F5DDD0", background: "#FFF8F4", minHeight: 130 }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: "#F5DDD0" }}>
        <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#555" }}>{label}</span>
      </div>
      <div className="p-2 flex flex-col gap-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="relative rounded-lg overflow-hidden flex items-center justify-center"
            style={{ background: "#F0E8E0", height: 60, border: "1px solid #E8D8CC" }}
          >
            {/* Mock document lines */}
            <div className="absolute inset-0 flex flex-col justify-center px-4 gap-1">
              {[60, 80, 50, 70].map((w, j) => (
                <div key={j} className="rounded-full" style={{ height: 4, width: `${w}%`, background: "#D4C4B8" }} />
              ))}
            </div>
            <button
              className="absolute bottom-1 left-1 w-6 h-6 rounded-full flex items-center justify-center z-10"
              style={{ background: "#F97316" }}
            >
              <Eye size={12} style={{ color: "white" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Video placeholder card ── */
function VideoCard() {
  return (
    <div
      className="flex-1 rounded-xl overflow-hidden"
      style={{ border: "1.5px solid #F5DDD0", background: "#FFF8F4", minHeight: 130 }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: "#F5DDD0" }}>
        <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#555" }}>本人確認動画</span>
      </div>
      <div className="p-2">
        <div
          className="relative rounded-lg overflow-hidden flex items-center justify-center"
          style={{ background: "#E8F0E0", height: 100, border: "1px solid #D4E0CC" }}
        >
          {/* Play button */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(249,115,22,0.85)" }}
          >
            <div style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid white", marginLeft: 3 }} />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-2 gap-1">
            {[90, 60].map((w, j) => (
              <div key={j} className="rounded-full" style={{ height: 3, width: `${w}%`, background: "rgba(255,255,255,0.5)" }} />
            ))}
          </div>
          <button
            className="absolute bottom-1 left-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "#F97316" }}
          >
            <Eye size={12} style={{ color: "white" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminVerificationPage() {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState(mockVerificationRequests);
  const [query,    setQuery]    = useState("");
  const [page,     setPage]     = useState(1);
  const [selectedId, setSelectedId] = useState<number>(1);

  /* Auto-select from URL param (coming from user list) */
  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      const found = requests.find((r) => r.id === parseInt(urlId));
      if (found) setSelectedId(found.id);
    }
  }, [searchParams]);

  const filtered = requests.filter(
    (r) => r.name.includes(query) || String(r.id).includes(query)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = requests.find((r) => r.id === selectedId) ?? requests[0];

  const updateStatus = (id: number, status: VerificationRequest["verificationStatus"]) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, verificationStatus: status } : r)));
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-53px)]">
        {/* ── Left panel ── */}
        <div
          className="flex flex-col w-80 flex-shrink-0 h-full"
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
                  placeholder="ユーザーIDで検索"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  className="flex-1 bg-transparent outline-none text-sm"
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
              gridTemplateColumns: "40px 1fr 90px 80px",
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
              const st = statusStyle[r.verificationStatus];
              const isSelected = r.id === selectedId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="grid items-center px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: "40px 1fr 90px 80px",
                    borderBottom: "1px solid #F5DDD0",
                    background: isSelected ? "#FEF0E8" : "white",
                  }}
                >
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>{r.id}</span>
                  <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.88rem", color: isSelected ? "#F97316" : "#1A1A1A" }}>
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
                  メールアドレス: <span style={{ color: "#3B82F6" }}>{selected.email}</span>
                </span>
                <span style={{ fontSize: "0.85rem", color: "#555" }}>
                  生年月日: {selected.birthDate}
                </span>
              </div>
            </div>

            {/* Documents + Video row */}
            <div className="flex gap-4 mb-6">
              <DocCard label="本人確認書類" />
              <VideoCard />
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => updateStatus(selected.id, "認証済み")}
                className="flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#22C55E", color: "white", fontWeight: 700, fontSize: "1rem" }}
              >
                <Check size={18} /> 承認
              </button>
              <button
                onClick={() => updateStatus(selected.id, "未認証")}
                className="flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#EF4444", color: "white", fontWeight: 700, fontSize: "1rem" }}
              >
                <X size={18} /> 却下
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
