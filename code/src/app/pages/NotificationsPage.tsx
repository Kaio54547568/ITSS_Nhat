import { useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, User, Check } from "lucide-react";
import { Layout } from "../components/Layout";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { getAppUserById, matchRequests, type AppUser, type MatchRequestData } from "../data/appData";

export function NotificationsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MatchRequestData[]>(matchRequests);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const handleMatch = (req: MatchRequestData) => {
    setMatchedIds((prev) => [...prev, req.id]);
    // Brief delay then navigate to chat
    setTimeout(() => {
      navigate(`/chat/${req.id}`);
    }, 700);
  };

  const handleSkip = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-57px)] overflow-hidden">
        {/* Bottom orange wave */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "38%" }}
        >
          <svg
            viewBox="0 0 1440 400"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0,120 C360,40 1080,220 1440,80 L1440,400 L0,400 Z"
              fill="#F97316"
            />
          </svg>
        </div>

        <div className="relative z-10 px-4 pt-6 pb-12 max-w-2xl mx-auto">
          {/* Title */}
          <h2
            className="mb-4"
            style={{ color: "#F97316", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700 }}
          >
            マッチング申請
          </h2>

          {/* Card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "white",
              border: "1.5px solid #F5DDD0",
              boxShadow: "0 4px 24px rgba(249,115,22,0.08)",
            }}
          >
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: "#FFF0E8" }}
                >
                  🎉
                </div>
                <p style={{ color: "#AAAAAA", fontSize: "0.95rem" }}>
                  申請はすべて処理されました
                </p>
              </div>
            ) : (
              requests.map((req, idx) => {
                const isMatched = matchedIds.includes(req.id);
                const isLast = idx === requests.length - 1;

                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 px-5 py-4"
                    style={{
                      borderBottom: isLast ? "none" : "1px solid #F5DDD0",
                      background: isMatched ? "#F0FFF4" : "white",
                      transition: "background 0.3s",
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: req.avatarColor }}
                      >
                        {req.avatarEmoji}
                      </div>
                      <span
                        className="absolute -bottom-1 -right-0.5 text-sm"
                        style={{ lineHeight: 1 }}
                      >
                        {req.countryCode}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A1A1A" }}>
                        {req.name}
                      </div>
                      <div
                        className="flex items-center gap-1 mt-0.5"
                        style={{ fontSize: "0.8rem", color: "#F97316" }}
                      >
                        <MapPin size={11} />
                        <span>希望渡航先：{req.destination}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 1 }}>
                        自己紹介：{req.intro}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* マッチ (green) */}
                      <button
                        onClick={() => handleMatch(req)}
                        disabled={isMatched}
                        className="px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
                        style={{
                          background: isMatched ? "#16A34A" : "#22C55E",
                          color: "white",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          minWidth: 68,
                        }}
                      >
                        {isMatched ? (
                          <span className="flex items-center gap-1 justify-center">
                            <Check size={14} /> マッチ
                          </span>
                        ) : (
                          "マッチ"
                        )}
                      </button>

                      {/* スキップ (orange) */}
                      <button
                        onClick={() => handleSkip(req.id)}
                        disabled={isMatched}
                        className="px-4 py-2 rounded-full transition-all hover:opacity-80 active:scale-95"
                        style={{
                          background: isMatched ? "#E0D5CF" : "#F97316",
                          color: "white",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          minWidth: 68,
                        }}
                      >
                        スキップ
                      </button>

                      {/* Profile icon */}
                      <button
                        onClick={() => setSelectedUser(getAppUserById(req.userId) ?? null)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-orange-50"
                        style={{ border: "1.5px solid #E8E0DC", background: "white" }}
                        aria-label={`${req.name}のプロフィールを表示`}
                      >
                        <User size={16} style={{ color: "#F97316" }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {selectedUser && <ProfilePreviewModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </div>
    </Layout>
  );
}
