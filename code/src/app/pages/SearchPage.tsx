import { useState } from "react";
import { ChevronDown, MapPin, User } from "lucide-react";
import { Layout } from "../components/Layout";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { useAppData, type AppUser } from "../store/AppDataContext";

export function SearchPage() {
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<"" | "VN" | "JP">("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const {
    currentUser,
    friendRequests,
    filterUsers,
    sendFriendRequest,
    acceptFriendRequest,
    skipFriendRequest,
    getFriendshipStatus,
  } = useAppData();

  const minAge = ageFrom.trim() === "" ? undefined : Number(ageFrom);
  const maxAge = ageTo.trim() === "" ? undefined : Number(ageTo);
  const filtered = filterUsers({
    minAge: Number.isFinite(minAge) ? minAge : undefined,
    maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
    selectedCountry,
  });

  const getRequestButton = (userId: string) => {
    const status = getFriendshipStatus(userId);
    if (status === "friend") return { label: "友達", disabled: true, background: "#22C55E" };
    if (status === "pending_sent") return { label: "申請済み", disabled: true, background: "#A3A3A3" };
    if (status === "pending_received") return { label: "申請あり", disabled: true, background: "#F59E0B" };
    return { label: "友達申請", disabled: false, background: "#F97316" };
  };

  const getIncomingRequestId = (userId: string) =>
    friendRequests.find(
      (request) =>
        request.status === "pending" &&
        request.fromUserId === userId &&
        request.toUserId === currentUser.id,
    )?.id;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-57px)] overflow-y-auto" style={{ background: "#fff7f2" }}>
        <div className="px-4 pt-5 pb-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap mb-3 px-3 py-2.5 rounded-2xl" style={{ background: "white", border: "1.5px solid #F5DDD0" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                placeholder="年齢の始め"
                value={ageFrom}
                onChange={(event) => setAgeFrom(event.target.value)}
                className="w-28 px-3 py-1.5 rounded-full text-sm outline-none"
                style={{ border: "1.5px solid #F0D5C8", color: "#555" }}
              />
              <span style={{ color: "#555", fontSize: "0.9rem" }}>から</span>
              <input
                type="number"
                placeholder="年齢の終わり"
                value={ageTo}
                onChange={(event) => setAgeTo(event.target.value)}
                className="w-32 px-3 py-1.5 rounded-full text-sm outline-none"
                style={{ border: "1.5px solid #F0D5C8", color: "#555" }}
              />
            </div>

            <div className="relative ml-auto">
              <select
                value={selectedCountry}
                onChange={(event) => setSelectedCountry(event.target.value as "" | "VN" | "JP")}
                className="appearance-none rounded-full pl-4 pr-9 py-1.5 text-sm outline-none"
                style={{
                  background: selectedCountry ? "#FFF0E8" : "white",
                  border: `1.5px solid ${selectedCountry ? "#F97316" : "#F0D5C8"}`,
                  color: selectedCountry ? "#E8641A" : "#555",
                  fontWeight: selectedCountry ? 600 : 400,
                  minWidth: 130,
                }}
                aria-label="国で絞り込み"
              >
                <option value="">すべての国</option>
                <option value="VN">ベトナム</option>
                <option value="JP">日本</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: selectedCountry ? "#F97316" : "#AAAAAA" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            {[
              ["興味", currentUser.interests],
              ["性格", currentUser.personality],
            ].map(([label, values]) => (
              <section key={label as string}>
                <h2 className="mb-2" style={{ color: "#F97316", fontSize: "1.4rem", fontWeight: 700 }}>
                  {label as string}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {(values as string[]).length > 0 ? (values as string[]).map((value) => (
                    <span key={value} className="px-4 py-1.5 rounded-full text-sm" style={{ background: "white", color: "#555", border: "1.5px solid #E8E0DC" }}>
                      {value}
                    </span>
                  )) : (
                    <span className="px-3 py-1.5 text-sm" style={{ color: "#999" }}>プロフィールで設定してください</span>
                  )}
                </div>
              </section>
            ))}
          </div>

          <h2 className="mb-3" style={{ color: "#F97316", fontSize: "1.4rem", fontWeight: 700 }}>
            おすすめユーザー
          </h2>

          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 rounded-2xl text-center" style={{ background: "white", border: "1.5px solid #F5DDD0", color: "#999" }}>
                条件に合うユーザーが見つかりません
              </div>
            ) : (
              filtered.map((user) => {
                const requestButton = getRequestButton(user.id);
                const incomingRequestId = getIncomingRequestId(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: "white", border: "1.5px solid #F5DDD0" }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: user.avatarColor }}
                      aria-label={`${user.name}のプロフィールを見る`}
                    >
                      <span>{user.avatarEmoji}</span>
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
                      {incomingRequestId ? (
                        <>
                          <button
                            onClick={() => acceptFriendRequest(incomingRequestId)}
                            className="px-4 py-2 rounded-full transition-all duration-150 hover:opacity-90 active:scale-95"
                            style={{
                              background: "#22C55E",
                              color: "white",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            ✓ 承認
                          </button>
                          <button
                            onClick={() => skipFriendRequest(incomingRequestId)}
                            className="px-4 py-2 rounded-full transition-all duration-150 hover:opacity-90 active:scale-95"
                            style={{
                              background: "#F97316",
                              color: "white",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            拒否
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          disabled={requestButton.disabled}
                          className="px-4 py-2 rounded-full transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
                          style={{
                            background: requestButton.background,
                            color: "white",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {requestButton.label}
                        </button>
                      )}
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
