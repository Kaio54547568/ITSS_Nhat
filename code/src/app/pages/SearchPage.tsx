import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, MapPin, User } from "lucide-react";
import { Layout } from "../components/Layout";
import { getSession } from "../data/auth";
import { getNormalUsers, type AppUser } from "../data/appData";

const hobbies = ["全体", "アニメ", "旅行", "スキー", "読書", "コーヒー", "写真", "日本文化"];

export function SearchPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [selectedHobby, setSelectedHobby] = useState("全体");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("nv_friend_matches") || "[]");
    } catch {
      return [];
    }
  });

  const filtered = getNormalUsers(session?.id).filter((user) => {
    const fromOk = ageFrom === "" || user.age >= parseInt(ageFrom);
    const toOk = ageTo === "" || user.age <= parseInt(ageTo);
    const hobbyOk = selectedHobby === "全体" || user.interests.includes(selectedHobby);
    return fromOk && toOk && hobbyOk;
  });

  const handleMatch = (user: AppUser) => {
    setMatchedIds((prev) => {
      const next = Array.from(new Set([...prev, user.id]));
      localStorage.setItem("nv_friend_matches", JSON.stringify(next));
      return next;
    });
    navigate(`/chat/${user.profileId}`);
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-57px)] overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "40%" }}>
          <svg viewBox="0 0 1440 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,120 C360,40 1080,220 1440,80 L1440,400 L0,400 Z" fill="#F97316" />
          </svg>
        </div>

        <div className="relative z-10 px-4 pt-5 pb-20 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap mb-3 px-3 py-2.5 rounded-2xl" style={{ background: "white", border: "1.5px solid #F5DDD0" }}>
            <input
              type="number"
              placeholder="開始年齢"
              value={ageFrom}
              onChange={(e) => setAgeFrom(e.target.value)}
              className="w-24 px-3 py-1.5 rounded-full text-sm outline-none"
              style={{ border: "1.5px solid #F0D5C8", color: "#555" }}
            />
            <span style={{ color: "#555", fontSize: "0.9rem" }}>から</span>
            <input
              type="number"
              placeholder="年齢の終わり"
              value={ageTo}
              onChange={(e) => setAgeTo(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-full text-sm outline-none"
              style={{ border: "1.5px solid #F0D5C8", color: "#555" }}
            />
            <div className="flex-1" />
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80" style={{ border: "1.5px solid #F0D5C8", background: "white", color: "#555", fontSize: "0.9rem" }}>
              <span>趣味</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            {hobbies.map((hobby) => (
              <button
                key={hobby}
                onClick={() => setSelectedHobby(hobby)}
                className="px-4 py-1.5 rounded-full text-sm transition-all duration-150"
                style={{
                  background: selectedHobby === hobby ? "#F97316" : "white",
                  color: selectedHobby === hobby ? "white" : "#555",
                  border: "1.5px solid",
                  borderColor: selectedHobby === hobby ? "#F97316" : "#E8E0DC",
                  fontWeight: selectedHobby === hobby ? 600 : 400,
                }}
              >
                {hobby}
              </button>
            ))}
          </div>

          <h2 className="mb-3" style={{ color: "#F97316", fontSize: "1.4rem", fontWeight: 700 }}>
            おすすめユーザー
          </h2>

          <div className="flex flex-col gap-3">
            {filtered.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "white", border: "1.5px solid #F5DDD0" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 relative"
                  style={{ background: user.avatarColor }}
                  aria-label={`${user.name}のプロフィールを見る`}
                >
                  <span>{user.avatarEmoji}</span>
                  <span className="absolute bottom-0 right-0 text-xs" style={{ lineHeight: 1, fontWeight: 700 }}>
                    {user.countryCode}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A1A" }}>{user.name}</div>
                  <div className="flex items-center gap-1 mt-0.5" style={{ color: "#F97316", fontSize: "0.82rem" }}>
                    <MapPin size={11} />
                    <span>{user.address}</span>
                  </div>
                  <div style={{ color: "#F97316", fontSize: "0.82rem", marginTop: 1 }}>{user.bio}</div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleMatch(user)}
                    className="px-4 py-2 rounded-full transition-all duration-150 hover:opacity-90 active:scale-95"
                    style={{
                      background: matchedIds.includes(user.id) ? "#22C55E" : "#F97316",
                      color: "white",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {matchedIds.includes(user.id) ? "マッチ済" : "マーチング"}
                  </button>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-orange-50"
                    style={{ border: "1.5px solid #E8E0DC", background: "white" }}
                    aria-label={`${user.name}の詳細ページへ移動`}
                  >
                    <User size={18} style={{ color: "#F97316" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
            style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="relative w-full max-w-3xl rounded-2xl p-6"
              style={{ background: "white", border: "2px solid #F5DDD0", boxShadow: "0 24px 70px rgba(0,0,0,0.22)" }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute right-4 top-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
                style={{ border: "2px solid #F97316", color: "#F97316", background: "white" }}
                aria-label="プロフィールを閉じる"
              >
                <ArrowLeft size={22} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0" style={{ background: selectedUser.avatarColor, border: "7px solid #F97316" }}>
                      {selectedUser.avatarEmoji}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1A1A1A", marginBottom: 6 }}>{selectedUser.name}</h3>
                      <div className="flex items-center gap-1" style={{ color: "#F97316", fontSize: "0.9rem" }}>
                        <MapPin size={14} />
                        <span>{selectedUser.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <span className="w-16" style={{ fontWeight: 700, color: "#1A1A1A" }}>年齢:</span>
                      <strong>{selectedUser.age}</strong>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="w-16" style={{ fontWeight: 700, color: "#1A1A1A" }}>言語:</span>
                      <strong>{selectedUser.languages.join(" / ")}</strong>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="w-16 pt-2" style={{ fontWeight: 700, color: "#1A1A1A" }}>興味:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.interests.map((item) => (
                          <span key={item} className="px-4 py-2 rounded-xl" style={{ background: "#E5E5E5", color: "#1A1A1A", fontWeight: 700, fontSize: "0.86rem" }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="w-16 pt-2" style={{ fontWeight: 700, color: "#1A1A1A" }}>性格:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.personality.map((item) => (
                          <span key={item} className="px-4 py-2 rounded-xl" style={{ background: "#F97316", color: "white", fontWeight: 700, fontSize: "0.86rem" }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 700, color: "#1A1A1A", marginBottom: 10 }}>ギャラリー</h4>
                  <div className="rounded-xl mb-2 flex items-center justify-center text-center px-4" style={{ height: 100, background: "linear-gradient(135deg, #FFB26B, #F97316)", color: "white", fontWeight: 700 }}>
                    {selectedUser.gallery[0] ?? "友達との写真"}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedUser.gallery.slice(0, 3).map((item, index) => (
                      <div
                        key={item}
                        className="rounded-lg flex items-center justify-center text-center px-1"
                        style={{ height: 62, background: index === 2 ? "#555" : "linear-gradient(135deg, #FFE0C8, #F97316)", color: "white", border: "3px solid #F97316", fontWeight: 700, fontSize: "0.8rem" }}
                      >
                        {index === 2 ? "+3" : item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
