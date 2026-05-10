import { useState } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { mockAdminReports, type AdminReport } from "../../data/adminMockData";

type RStatus = AdminReport["status"];

const statusStyle: Record<RStatus, { color: string; bg: string }> = {
  "確認待ち": { color: "#F97316", bg: "#FFF0E8" },
  "却下":     { color: "#DC2626", bg: "#FEE2E2" },
  "対応済み": { color: "#16A34A", bg: "#DCFCE7" },
};

const PAGE_SIZE = 5;

/* ── Evidence image placeholder ── */
function EvidenceCard() {
  return (
    <div
      className="relative rounded-xl overflow-hidden mt-2"
      style={{ background: "#FFF0E8", border: "1.5px solid #F5DDD0", height: 120 }}
    >
      {/* Mock phone screenshot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-xl overflow-hidden flex flex-col"
          style={{ width: 70, height: 100, background: "#E8E8E8", border: "2px solid #CCC" }}
        >
          <div style={{ height: 8, background: "#555", flexShrink: 0 }} />
          <div className="flex-1 p-1 flex flex-col gap-1">
            {[70, 90, 60, 80, 50].map((w, i) => (
              <div key={i} className="rounded" style={{ height: 5, width: `${w}%`, background: "#BBBBBB" }} />
            ))}
          </div>
        </div>
      </div>
      <button
        className="absolute bottom-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "#F97316" }}
      >
        <Eye size={13} style={{ color: "white" }} />
      </button>
    </div>
  );
}

export function AdminReportsPage() {
  const [reports,    setReports]    = useState(mockAdminReports);
  const [query,      setQuery]      = useState("");
  const [page,       setPage]       = useState(1);
  const [selectedId, setSelectedId] = useState<number>(1);

  const filtered = reports.filter(
    (r) =>
      r.reporter.includes(query) ||
      r.reported.includes(query) ||
      String(r.id).includes(query)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = reports.find((r) => r.id === selectedId) ?? reports[0];

  const updateStatus = (id: number, status: RStatus) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-53px)]">
        {/* ── Left panel ── */}
        <div
          className="flex flex-col w-[420px] flex-shrink-0 h-full"
          style={{ borderRight: "1.5px solid #F5DDD0", background: "white" }}
        >
          {/* Title */}
          <div className="px-4 pt-4 pb-2">
            <h3 style={{ color: "#F97316", fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>
              通報一覧
            </h3>

            {/* Search */}
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
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "#555" }}
                />
                <Search size={14} style={{ color: "#AAAAAA" }} />
              </div>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: "1.5px solid #F0D5C8", background: "white" }}
              >
                <SlidersHorizontal size={15} style={{ color: "#F97316" }} />
              </button>
            </div>
          </div>

          {/* Table header */}
          <div
            className="grid px-4 py-2 text-xs"
            style={{
              gridTemplateColumns: "36px 70px 80px 90px 1fr",
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

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {paged.map((r) => {
              const st = statusStyle[r.status];
              const isSelected = r.id === selectedId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="grid items-center px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: "36px 70px 80px 90px 1fr",
                    borderBottom: "1px solid #F5DDD0",
                    background: isSelected ? "#FEF0E8" : "white",
                  }}
                >
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>{r.id}</span>
                  <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.88rem", color: isSelected ? "#F97316" : "#1A1A1A" }}>
                    {r.reporter}
                  </span>
                  <span style={{ fontSize: "0.88rem", color: "#555" }}>{r.reported}</span>
                  <span style={{ fontSize: "0.78rem", color: "#888" }}>
                    {r.date.replace(/-/g, "/")}
                  </span>
                  <div className="flex items-center gap-0.5">
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
              通報詳細
            </h3>

            <div
              className="rounded-2xl p-5"
              style={{ background: "white", border: "1.5px solid #F5DDD0" }}
            >
              {/* Meta info */}
              <div className="flex flex-col gap-2 mb-4">
                {[
                  ["通報者",   selected.reporter],
                  ["通報対象", selected.reported],
                  ["通報日",   selected.date.replace(/-/g, "/")],
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
                {/* Reason */}
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 4 }}>
                    通報理由:
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#555" }}>{selected.reason}</p>
                </div>

                {/* Detail */}
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 4 }}>
                    詳細内容:
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#555", fontStyle: "italic" }}>{selected.detail}</p>
                </div>

                {/* Evidence */}
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 2 }}>
                    証拠画像:
                  </p>
                  <EvidenceCard />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => updateStatus(selected.id, "却下")}
                  className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#22C55E", color: "white", fontWeight: 700, fontSize: "0.95rem" }}
                >
                  却下
                </button>
                <button
                  onClick={() => updateStatus(selected.id, "対応済み")}
                  className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#EF4444", color: "white", fontWeight: 700, fontSize: "0.95rem" }}
                >
                  利用停止
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
