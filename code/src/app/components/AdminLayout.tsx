import { useNavigate, useLocation } from "react-router";
import { logout } from "../data/auth";

const adminNavItems = [
  { label: "ユーザー一覧", path: "/admin/users" },
  { label: "本人確認",     path: "/admin/verification" },
  { label: "通報管理",     path: "/admin/reports" },
  { label: "ログアウト",   path: "/" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FEF0E8" }}>
      {/* Header */}
      <header
        className="flex items-center px-6 py-2.5 gap-4 sticky top-0 z-50"
        style={{ background: "white", borderBottom: "1.5px solid #F5DDD0" }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
            style={{ background: "#F97316" }}
          >
            🤝
          </div>
          <span style={{ color: "#E8641A", fontSize: "1.15rem", fontWeight: 700, whiteSpace: "nowrap" }}>
            日越フレンド
          </span>
        </button>

        <div className="flex-1" />

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (item.label === "ログアウト") logout();
                  navigate(item.path);
                }}
                className="px-5 py-1.5 rounded-full transition-all duration-150 hover:opacity-90 active:scale-95"
                style={{
                  background:   isActive ? "#F97316" : "white",
                  color:        isActive ? "white"   : "#333",
                  border:       "1.5px solid #E8E0DC",
                  fontWeight:   isActive ? 600 : 400,
                  fontSize:     "0.88rem",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
