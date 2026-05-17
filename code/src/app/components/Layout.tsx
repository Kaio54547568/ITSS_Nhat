import { useNavigate, useLocation } from "react-router";
import { Bell } from "lucide-react";
import { logout } from "../data/auth";
import { useAppData } from "../store/AppDataContext";

const navItems = [
  { label: "ホーム", path: "/home" },
  { label: "検索", path: "/search" },
  { label: "チャット", path: "/chat" },
  { label: "プロフィール", path: "/profile" },
  { label: "ログアウト", path: "/" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, notifications } = useAppData();
  const unreadCount = notifications.filter(
    (notification) => notification.userId === currentUser.id && !notification.isRead,
  ).length;

  const isActive = (path: string) => {
    if (path === "/chat") return location.pathname.startsWith("/chat");
    return location.pathname === path;
  };

  const isBellActive = location.pathname === "/notifications";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fff7f2" }}>
      <header
        className="flex items-center px-4 py-2 gap-3 sticky top-0 z-50"
        style={{
          background: "white",
          borderBottom: "1px solid #F5DDD0",
          boxShadow: "0 3px 12px rgba(0, 0, 0, 0.12)",
        }}
      >
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 mr-2 flex-shrink-0"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
            style={{ background: "#F97316" }}
          >
            🤝
          </div>
          <span
            style={{
              color: "#E8641A",
              fontSize: "1.2rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            日越フレンド
          </span>
        </button>

        <nav className="flex items-center gap-2 flex-1 justify-center flex-wrap">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (item.path === "/") logout();
                  navigate(item.path);
                }}
                className="px-4 py-1.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{
                  background: active ? "#F97316" : "white",
                  color: active ? "white" : "#E8641A",
                  border: `1.5px solid ${active ? "#F97316" : "#E8E0DC"}`,
                  fontSize: "0.9rem",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-100 transition-colors"
          style={{
            border: "1.5px solid #E8E0DC",
            background: isBellActive ? "#F97316" : "white",
          }}
          aria-label="通知"
        >
          <Bell size={18} style={{ color: isBellActive ? "white" : "#F97316" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full flex items-center justify-center"
              style={{ background: "#EF4444", color: "white", fontSize: "0.6rem", fontWeight: 700 }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
