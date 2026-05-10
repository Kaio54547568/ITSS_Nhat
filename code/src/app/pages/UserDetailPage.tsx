import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Flag, MapPin, MessageCircle, Star } from "lucide-react";
import { Layout } from "../components/Layout";
import { getAppUserById } from "../data/appData";

export function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getAppUserById(id);

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: "#999" }}>ユーザーが見つかりません</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-57px)] overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "40%" }}>
          <svg viewBox="0 0 1440 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,120 C360,40 1080,220 1440,80 L1440,400 L0,400 Z" fill="#F97316" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-5 pb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity" style={{ color: "#1A1A1A", fontSize: "0.95rem" }}>
            <ArrowLeft size={18} />
            <span>戻る</span>
          </button>

          <div className="rounded-3xl p-6" style={{ background: "white", border: "2px solid #F5DDD0", boxShadow: "0 4px 24px rgba(249,115,22,0.08)" }}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl relative" style={{ background: user.avatarColor, border: "7px solid #F97316" }}>
                    {user.avatarEmoji}
                    <span className="absolute bottom-0 right-0 text-xs" style={{ lineHeight: 1, fontWeight: 700 }}>{user.countryCode}</span>
                  </div>
                  <div>
                    <h2 style={{ color: "#1A1A1A", fontWeight: 700, fontSize: "1.4rem", marginBottom: 4 }}>{user.name}</h2>
                    <p className="flex items-center gap-1" style={{ color: "#F97316", fontSize: "0.9rem" }}>
                      <MapPin size={14} />
                      {user.address}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="w-16" style={{ fontWeight: 700 }}>年齢:</span>
                    <strong>{user.age}</strong>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-16" style={{ fontWeight: 700 }}>言語:</span>
                    <strong>{user.languages.join(" / ")}</strong>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-16 pt-2" style={{ fontWeight: 700 }}>興味:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((item) => (
                        <span key={item} className="px-4 py-2 rounded-xl" style={{ background: "#E5E5E5", color: "#1A1A1A", fontWeight: 700, fontSize: "0.86rem" }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-16 pt-2" style={{ fontWeight: 700 }}>性格:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.personality.map((item) => (
                        <span key={item} className="px-4 py-2 rounded-xl" style={{ background: "#F97316", color: "white", fontWeight: 700, fontSize: "0.86rem" }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-4 mb-5" style={{ background: "#FFF8F4", border: "1.5px solid #F5DDD0" }}>
                  <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.7 }}>{user.bio}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => navigate(`/chat/${user.profileId}`)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all hover:opacity-90 active:scale-95" style={{ background: "#F97316", color: "white", fontWeight: 700 }}>
                    <MessageCircle size={17} />
                    チャット
                  </button>
                  <button onClick={() => navigate(`/review/${user.profileId}`)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all hover:opacity-90 active:scale-95" style={{ background: "white", color: "#F97316", border: "1.5px solid #F97316", fontWeight: 700 }}>
                    <Star size={17} />
                    評価
                  </button>
                  <button onClick={() => navigate(`/report/${user.profileId}`)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all hover:opacity-90 active:scale-95" style={{ background: "white", color: "#DC2626", border: "1.5px solid #FECACA", fontWeight: 700 }}>
                    <Flag size={17} />
                    通報
                  </button>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: "#1A1A1A", marginBottom: 10 }}>ギャラリー</h4>
                <div className="rounded-xl mb-2 flex items-center justify-center text-center px-4" style={{ height: 100, background: "linear-gradient(135deg, #FFB26B, #F97316)", color: "white", fontWeight: 700 }}>
                  {user.gallery[0] ?? "写真"}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {user.gallery.slice(0, 3).map((item, index) => (
                    <div key={item} className="rounded-lg flex items-center justify-center text-center px-1" style={{ height: 62, background: index === 2 ? "#555" : "linear-gradient(135deg, #FFE0C8, #F97316)", color: "white", border: "3px solid #F97316", fontWeight: 700, fontSize: "0.8rem" }}>
                      {index === 2 ? "+3" : item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
