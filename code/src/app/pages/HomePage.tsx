import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";
import { getPicUrl } from "../storage/pics";
import { useAppData } from "../store/AppDataContext";
import { calculateMatchRate } from "../matching";

const chatBubbleImg =
  "https://images.unsplash.com/photo-1662974770404-468fd9660389?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGF0JTIwYnViYmxlJTIwbWVzc2FnZSUyMGNvbG9yZnVsJTIwM2R8ZW58MXx8fHwxNzc4MzE2MjAyfDA&ixlib=rb-4.1.0&q=80&w=400";
const analyticsImg =
  "https://images.unsplash.com/photo-1653997500354-c9711cbc0136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBjaGFydCUyMGdyYXBoJTIwcHVycGxlJTIwM2R8ZW58MXx8fHwxNzc4MzE2MjAyfDA&ixlib=rb-4.1.0&q=80&w=400";

export function HomePage() {
  const navigate = useNavigate();
  const { currentUser, chatThreads, friendRequests } = useAppData();
  const savedAvatar = getPicUrl(currentUser.avatarPath);
  const unreadMessageCount = chatThreads.reduce(
    (total, thread) => total + (thread.unreadCountByUserId[currentUser.id] ?? 0),
    0,
  );
  const matchRate = calculateMatchRate(currentUser.id, friendRequests);
  const stats = [
    {
      label: "コネクション",
      value: String(currentUser.friends.length),
      path: "/chat",
      bg: "linear-gradient(135deg, #FFF0E8 0%, #FFE0C8 100%)",
      icon: null,
      customIcon: (
        <div className="flex flex-col items-center justify-center">
          <span style={{ fontSize: "4.3rem", lineHeight: 0.95 }}>🤝</span>
          <span style={{ fontSize: "2.1rem", lineHeight: 1, marginTop: -10 }}>💖</span>
        </div>
      ),
    },
    {
      label: "未読メッセージ",
      value: String(unreadMessageCount),
      path: "/chat",
      bg: "linear-gradient(135deg, #FFF0E8 0%, #FFE0C8 100%)",
      icon: chatBubbleImg,
      customIcon: null,
    },
    {
      label: "マッチ率",
      value: `${matchRate}%`,
      path: "/search",
      bg: "linear-gradient(135deg, #F3E8FF 0%, #E0D0FF 100%)",
      icon: analyticsImg,
      customIcon: null,
    },
  ];

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-57px)] overflow-hidden" style={{ background: "#fff7f2" }}>
        <div className="relative z-10 flex min-h-[calc(100vh-57px)] flex-col px-6 pt-6 pb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <h2
              style={{
                color: "#1A1A1A",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 700,
              }}
            >
              おかえり、{currentUser.name}! 👋
            </h2>

            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/profile")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") navigate("/profile");
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{
                background: "white",
                border: "2px solid #F97316",
                minWidth: 180,
                cursor: "pointer",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 relative"
                style={{ background: "#F97316" }}
              >
                {savedAvatar ? (
                  <img src={savedAvatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  currentUser.avatarEmoji
                )}
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                  style={{ background: "#22C55E", border: "2px solid white" }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A1A" }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{currentUser.countryCode}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(stat.path)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") navigate(stat.path);
                  }}
                  className="rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all duration-150 hover:opacity-95 active:scale-[0.99]"
                  style={{
                    background: stat.bg,
                    border: "2px solid rgba(249,115,22,0.28)",
                    minHeight: 250,
                    cursor: "pointer",
                  }}
                >
                  <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ minHeight: 178 }}>
                    {stat.customIcon ? (
                      <div className="p-5">{stat.customIcon}</div>
                    ) : stat.icon ? (
                      <img src={stat.icon} alt={stat.label} className="w-full h-full object-cover" style={{ minHeight: 178 }} />
                    ) : null}
                  </div>

                  <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{
                      borderTop: "1.5px solid rgba(249,115,22,0.15)",
                      background: "rgba(255,255,255,0.68)",
                    }}
                  >
                    <span style={{ fontSize: "1.08rem", fontWeight: 700, color: "#333" }}>
                      {stat.label}: {stat.value}
                    </span>
                    <svg width="58" height="28" viewBox="0 0 58 28">
                      <polyline
                        points="0,21 12,14 23,18 35,7 46,11 58,4"
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
