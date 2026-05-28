import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Bell } from "lucide-react";
import { logout } from "../data/auth";
import { useAppData } from "../store/AppDataContext";
import { supabase } from "../supabase";

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
  const { currentUser, notifications, chatThreads } = useAppData();
  const unreadCount = notifications.filter(
    (notification) => notification.userId === currentUser.id && !notification.isRead,
  ).length;
  const unreadChatCount = chatThreads.reduce(
    (total, thread) => total + (thread.unreadCountByUserId[currentUser.id] ?? 0),
    0,
  );
  const isProfileRoute = location.pathname.startsWith("/profile");
  const isVerifiedUser = currentUser.verificationStatus === "認証済み" || currentUser.verificationStatus === "承認済み";
  const isFeatureLocked = currentUser.role === "user" && !isVerifiedUser;

  useEffect(() => {
    if (currentUser.role !== "user") return;

    void supabase.from("profiles").update({ online: isProfileRoute }).eq("id", currentUser.id);

    return () => {
      if (isProfileRoute) {
        void supabase.from("profiles").update({ online: false }).eq("id", currentUser.id);
      }
    };
  }, [currentUser.id, currentUser.role, isProfileRoute]);

  useEffect(() => {
    if (isFeatureLocked && !isProfileRoute) navigate("/profile", { replace: true });
  }, [isFeatureLocked, isProfileRoute, navigate]);

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
          onClick={() => navigate(isFeatureLocked ? "/profile" : "/home")}
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
            const disabled = isFeatureLocked && item.path !== "/profile" && item.path !== "/";
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (disabled) return;
                  if (item.path === "/") {
                    void supabase.from("profiles").update({ online: false }).eq("id", currentUser.id);
                    logout();
                  }
                  navigate(item.path);
                }}
                className="relative px-4 py-1.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{
                  background: active ? "#F97316" : "white",
                  color: active ? "white" : "#E8641A",
                  border: `1.5px solid ${active ? "#F97316" : "#E8E0DC"}`,
                  fontSize: "0.9rem",
                  fontWeight: active ? 600 : 400,
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                {item.label}
                {item.path === "/chat" && unreadChatCount > 0 && (
                  <span
                    className="absolute -top-2 -right-1 min-w-5 h-5 px-1 rounded-full flex items-center justify-center"
                    style={{ background: "#EF4444", color: "white", fontSize: "0.65rem", fontWeight: 700 }}
                  >
                    {unreadChatCount > 99 ? "99+" : unreadChatCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            if (!isFeatureLocked) navigate("/notifications");
          }}
          className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-100 transition-colors"
          style={{
            border: "1.5px solid #E8E0DC",
            background: isBellActive ? "#F97316" : "white",
            opacity: isFeatureLocked ? 0.45 : 1,
            cursor: isFeatureLocked ? "not-allowed" : "pointer",
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
