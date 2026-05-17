import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";
import { useAppData } from "../store/AppDataContext";

const chatBubbleImg =
  "https://images.unsplash.com/photo-1662974770404-468fd9660389?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGF0JTIwYnViYmxlJTIwbWVzc2FnZSUyMGNvbG9yZnVsJTIwM2R8ZW58MXx8fHwxNzc4MzE2MjAyfDA&ixlib=rb-4.1.0&q=80&w=400";
const analyticsImg =
  "https://images.unsplash.com/photo-1653997500354-c9711cbc0136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBjaGFydCUyMGdyYXBoJTIwcHVycGxlJTIwM2R8ZW58MXx8fHwxNzc4MzE2MjAyfDA&ixlib=rb-4.1.0&q=80&w=400";

export function HomePage() {
  const navigate = useNavigate();
  const { currentUser, chatThreads } = useAppData();
  const savedAvatar = localStorage.getItem(`nv_friend_avatar_${currentUser.id}`) ?? "";
  const messageCount = chatThreads.reduce((total, thread) => total + thread.messages.length, 0);
  const stats = [
    {
      label: "コネクション",
      value: String(currentUser.friends.length),
      path: "/chat",
      bg: "linear-gradient(135deg, #FFF0E8 0%, #FFE0C8 100%)",
      icon: null,
      customIcon: (
        <div className="flex flex-col items-center">
          <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>🤝</span>
          <span style={{ fontSize: "1.8rem", lineHeight: 1, marginTop: -8 }}>♡</span>
        </div>
      ),
    },
    {
      label: "メッセージ",
      value: String(messageCount),
      path: "/chat",
      bg: "linear-gradient(135deg, #FFF0E8 0%, #FFE0C8 100%)",
      icon: chatBubbleImg,
      customIcon: null,
    },
    {
      label: "マッチ率",
      value: `${currentUser.matchRate}%`,
      path: "/search",
      bg: "linear-gradient(135deg, #F3E8FF 0%, #E0D0FF 100%)",
      icon: analyticsImg,
      customIcon: null,
    },
  ];

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-57px)] overflow-hidden" style={{ background: "#fff7f2" }}>
        <div className="relative z-10 flex flex-col px-6 pt-6 h-full">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full mx-auto">
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
                  border: "2px solid rgba(249,115,22,0.2)",
                  minHeight: 200,
                  cursor: "pointer",
                }}
              >
                <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ minHeight: 130 }}>
                  {stat.customIcon ? (
                    <div className="p-4">{stat.customIcon}</div>
                  ) : stat.icon ? (
                    <img src={stat.icon} alt={stat.label} className="w-full h-full object-cover" style={{ maxHeight: 140 }} />
                  ) : null}
                </div>

                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    borderTop: "1.5px solid rgba(249,115,22,0.15)",
                    background: "rgba(255,255,255,0.6)",
                  }}
                >
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#333" }}>
                    {stat.label}: {stat.value}
                  </span>
                  <svg width="50" height="24" viewBox="0 0 50 24">
                    <polyline
                      points="0,18 10,12 20,16 30,6 40,10 50,4"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="2"
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
    </Layout>
  );
}
