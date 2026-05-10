import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { mockAdminUsers, type AdminUser } from "../../data/adminMockData";

type SortKey = "id" | "name" | "reportCount";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 5;

function rowBg(u: AdminUser) {
  if (u.reportCount >= 2) return "#FECACA";   // red-200
  if (u.reportCount === 1) return "#FEF08A";  // yellow-200
  return "white";
}

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [query,   setQuery]   = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page,    setPage]    = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = mockAdminUsers
    .filter((u) =>
      u.name.includes(query) ||
      u.email.includes(query) ||
      String(u.id).includes(query)
    )
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "id")          return (a.id - b.id) * mul;
      if (sortKey === "name")        return a.name.localeCompare(b.name) * mul;
      if (sortKey === "reportCount") return (a.reportCount - b.reportCount) * mul;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : (
      <span className="flex flex-col" style={{ lineHeight: 0.6 }}>
        <ChevronUp size={11} style={{ opacity: 0.4 }} />
        <ChevronDown size={11} style={{ opacity: 0.4 }} />
      </span>
    );

  return (
    <AdminLayout>
      <div className="px-6 py-5 max-w-5xl mx-auto">
        {/* Title */}
        <h2 style={{ color: "#F97316", fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>
          ユーザー一覧
        </h2>

        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-full mb-5"
          style={{ background: "#F97316" }}
        >
          <input
            type="text"
            placeholder="ユーザーIDを検索"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent outline-none placeholder-white/80"
            style={{ color: "white", fontSize: "0.92rem" }}
          />
          <Search size={18} style={{ color: "white" }} />
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1.5px solid #F5DDD0", background: "white" }}
        >
          {/* Table header */}
          <div
            className="grid text-sm"
            style={{
              gridTemplateColumns: "56px 1fr 1fr 88px 88px 80px",
              background: "#FFF8F4",
              borderBottom: "1.5px solid #F5DDD0",
              padding: "10px 16px",
              color: "#555",
              fontWeight: 600,
            }}
          >
            <button className="flex items-center gap-1" onClick={() => handleSort("id")}>
              ID <SortIcon col="id" />
            </button>
            <button className="flex items-center gap-1" onClick={() => handleSort("name")}>
              氏名 <SortIcon col="name" />
            </button>
            <span>メールアドレス</span>
            <span>ステータス</span>
            <span>認証状況</span>
            <button className="flex items-center gap-1 justify-end" onClick={() => handleSort("reportCount")}>
              通報件数 <SortIcon col="reportCount" />
            </button>
          </div>

          {/* Rows */}
          {paged.map((u) => (
            <div
              key={u.id}
              onClick={() => navigate(`/admin/verification?id=${u.id}`)}
              className="grid items-center cursor-pointer hover:brightness-95 transition-all"
              style={{
                gridTemplateColumns: "56px 1fr 1fr 88px 88px 80px",
                background: rowBg(u),
                borderBottom: "1px solid #F5DDD0",
                padding: "11px 16px",
              }}
            >
              {/* ID */}
              <span style={{ color: "#F97316", fontWeight: 700, fontSize: "0.9rem" }}>{u.id}</span>

              {/* Name */}
              <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#1A1A1A" }}>{u.name}</span>

              {/* Email */}
              <span style={{ color: "#3B82F6", fontSize: "0.88rem", textDecoration: "underline" }}>
                {u.email}
              </span>

              {/* Status */}
              <span
                className="px-3 py-0.5 rounded-full text-xs inline-flex items-center justify-center"
                style={{
                  background: u.status === "有効" ? "#DCFCE7" : "#FEE2E2",
                  color:      u.status === "有効" ? "#16A34A" : "#DC2626",
                  fontWeight: 600,
                  width: "fit-content",
                }}
              >
                {u.status}
              </span>

              {/* Verified */}
              <div className="flex items-center gap-1">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: u.verified ? "#DCFCE7" : "#FEE2E2",
                    color:      u.verified ? "#16A34A" : "#DC2626",
                  }}
                >
                  {u.verified ? <Check size={13} /> : <X size={13} />}
                </span>
                <ChevronDown size={13} style={{ color: "#AAAAAA" }} />
              </div>

              {/* Report count */}
              <span
                className="text-right"
                style={{
                  fontWeight: u.reportCount > 0 ? 700 : 400,
                  color:      u.reportCount >= 2 ? "#DC2626" : u.reportCount === 1 ? "#D97706" : "#888",
                  fontSize:   "0.9rem",
                }}
              >
                {u.reportCount}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-1 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: page === 1 ? "#CCC" : "#F97316", background: "white", border: "1.5px solid #E8E0DC" }}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm"
              style={{
                background: page === p ? "#F97316" : "white",
                color:      page === p ? "white"   : "#555",
                border:     "1.5px solid #E8E0DC",
                fontWeight: page === p ? 700 : 400,
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: page === totalPages ? "#CCC" : "#F97316", background: "white", border: "1.5px solid #E8E0DC" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
