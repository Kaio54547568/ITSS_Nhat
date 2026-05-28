import { useEffect, useMemo, useState } from "react";
import { MapPin, User, Check } from "lucide-react";
import { Layout } from "../components/Layout";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { useAppData, type AppNotification, type AppUser } from "../store/AppDataContext";

function notificationText(notification: AppNotification, fromUser?: AppUser) {
  const name = fromUser?.name ?? "ユーザー";
  switch (notification.type) {
    case "friend_request":
      return `${name}さんからマッチング申請が届きました`;
    case "friend_request_accepted":
      return `${name}さんがマッチング申請を承認しました`;
    case "friend_request_rejected":
      return `${name}さんがマッチング申請を拒否しました`;
    case "message":
      return `${name}さんから新しいメッセージが届きました`;
    case "verification":
      return notification.message || "アカウント認証の結果が届きました";
    case "review":
      return notification.message || `${name}さんから評価情報が届きました`;
    case "report":
    case "account_locked":
      return notification.message;
    default:
      return notification.message;
  }
}

export function NotificationsPage() {
  const {
    currentUser,
    friendRequests,
    notifications,
    acceptFriendRequest,
    skipFriendRequest,
    markRequestNotificationsRead,
    getUserById,
  } = useAppData();
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [feedback, setFeedback] = useState("");

  const pendingRequests = useMemo(
    () => friendRequests.filter((request) => request.toUserId === currentUser.id && request.status === "pending"),
    [currentUser.id, friendRequests],
  );

  const recentNotifications = useMemo(
    () =>
      notifications
        .filter((notification) => notification.userId === currentUser.id)
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [currentUser.id, notifications],
  );

  useEffect(() => {
    markRequestNotificationsRead();
  }, [markRequestNotificationsRead]);

  const handleAccept = (requestId: string) => {
    acceptFriendRequest(requestId);
    setFeedback("友達になりました");
  };

  const handleSkip = (requestId: string) => {
    skipFriendRequest(requestId);
    setFeedback("申請を拒否しました");
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-57px)] overflow-y-auto" style={{ background: "#fff7f2" }}>
        <div className="px-4 pt-6 pb-12 max-w-2xl mx-auto">
          <h2
            className="mb-4"
            style={{ color: "#F97316", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700 }}
          >
            マッチング申請
          </h2>

          {feedback && (
            <div className="mb-3 px-4 py-2 rounded-2xl" style={{ background: "#F0FFF4", border: "1.5px solid #BBF7D0", color: "#16A34A", fontWeight: 700 }}>
              {feedback}
            </div>
          )}

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "white",
              border: "1.5px solid #F5DDD0",
              boxShadow: "0 4px 24px rgba(249,115,22,0.08)",
            }}
          >
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: "#FFF0E8" }}
                >
                  ✓
                </div>
                <p style={{ color: "#AAAAAA", fontSize: "0.95rem" }}>
                  申請はすべて処理されました
                </p>
              </div>
            ) : (
              pendingRequests.map((request, idx) => {
                const user = getUserById(request.fromUserId);
                if (!user) return null;
                const isLast = idx === pendingRequests.length - 1;

                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 px-5 py-4"
                    style={{
                      borderBottom: isLast ? "none" : "1px solid #F5DDD0",
                      background: "white",
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: user.avatarColor }}
                      >
                        {user.avatarEmoji}
                      </div>
                      <span className="absolute -bottom-1 -right-0.5 text-sm" style={{ lineHeight: 1 }}>
                        {user.countryCode}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A1A1A" }}>
                        {user.name}
                      </div>
                      <div
                        className="flex items-center gap-1 mt-0.5"
                        style={{ fontSize: "0.8rem", color: "#F97316" }}
                      >
                        <MapPin size={11} />
                        <span>{user.address} / {user.countryCode}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 1 }}>
                        自己紹介：{user.bio}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
                        style={{
                          background: "#22C55E",
                          color: "white",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          minWidth: 68,
                        }}
                      >
                        <span className="flex items-center gap-1 justify-center">
                          <Check size={14} /> 承認
                        </span>
                      </button>

                      <button
                        onClick={() => handleSkip(request.id)}
                        className="px-4 py-2 rounded-full transition-all hover:opacity-80 active:scale-95"
                        style={{
                          background: "#F97316",
                          color: "white",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          minWidth: 68,
                        }}
                      >
                        拒否
                      </button>

                      <button
                        onClick={() => setSelectedUser(user)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-orange-50"
                        style={{ border: "1.5px solid #E8E0DC", background: "white" }}
                        aria-label={`${user.name}のプロフィールを表示`}
                      >
                        <User size={16} style={{ color: "#F97316" }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-5 rounded-3xl p-4" style={{ background: "white", border: "1.5px solid #F5DDD0" }}>
            <h3 style={{ color: "#F97316", fontWeight: 700, marginBottom: 10 }}>通知</h3>
            {recentNotifications.length === 0 ? (
              <p style={{ color: "#999", fontSize: "0.9rem" }}>通知はありません</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentNotifications.map((notification) => {
                  const fromUser = getUserById(notification.fromUserId);
                  return (
                    <div
                      key={notification.id}
                      className="px-3 py-2 rounded-2xl"
                      style={{ background: notification.isRead ? "#FAFAFA" : "#FFF0E8", color: "#555", fontSize: "0.88rem" }}
                    >
                      {notificationText(notification, fromUser)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {selectedUser && <ProfilePreviewModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </div>
    </Layout>
  );
}
