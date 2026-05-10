import { useRef, useState, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, Edit2, Check, Calendar } from "lucide-react";
import { Layout } from "../components/Layout";
import { getSession } from "../data/auth";
import { getAppUserById } from "../data/appData";

type SubPage = "account" | "profile";

/* ── small reusable field row ── */
function FieldRow({
  label,
  value,
  onChange,
  editable,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-20 text-right flex-shrink-0"
        style={{ color: "#555", fontSize: "0.88rem" }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!editable}
        className="flex-1 px-4 py-2 rounded-full outline-none transition-colors"
        style={{
          background: editable ? "#FFF8F4" : "#F2F2F2",
          border: `1.5px solid ${editable ? "#F97316" : "#E0D5CF"}`,
          color: editable ? "#333" : "#888",
          fontSize: "0.88rem",
        }}
      />
    </div>
  );
}

/* ── language tag ── */
function LangTag({ label, editable, onRemove }: { label: string; editable: boolean; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1 px-4 py-1.5 rounded-full"
      style={{
        background: editable ? "#FFF0E8" : "#F2F2F2",
        border: `1.5px solid ${editable ? "#F97316" : "#E0D5CF"}`,
        color: editable ? "#E8641A" : "#888",
        fontSize: "0.85rem",
      }}
    >
      {label}
      {editable && (
        <button onClick={onRemove} className="ml-1 hover:opacity-70" style={{ fontSize: "0.75rem", color: "#F97316" }}>✕</button>
      )}
    </div>
  );
}

export function ProfilePage() {
  const session = getSession();
  const currentUser = getAppUserById(session?.id) ?? getAppUserById("u1")!;
  const avatarStorageKey = `nv_friend_avatar_${currentUser.id}`;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [subPage, setSubPage] = useState<SubPage>("account");
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(() => localStorage.getItem(avatarStorageKey) ?? "");

  /* — account fields — */
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.address);
  const [birthDate, setBirthDate] = useState(currentUser.birthDate);
  const [gender, setGender] = useState<"M" | "F">(currentUser.gender === "F" ? "F" : "M");
  const [password, setPassword] = useState("••••••••••••••••••••••");

  /* — profile fields — */
  const [bio, setBio] = useState(currentUser.bio);
  const [languages, setLanguages] = useState<string[]>([...currentUser.languages]);
  const [interests, setInterests] = useState(currentUser.interests.join(", "));
  const [personality, setPersonality] = useState(currentUser.personality.join(", "));

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextAvatar = typeof reader.result === "string" ? reader.result : "";
      if (!nextAvatar) return;
      setAvatarPreview(nextAvatar);
      localStorage.setItem(avatarStorageKey, nextAvatar);
    };
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    if (subPage === "account") setSubPage("profile");
  };

  const goPrev = () => {
    if (subPage === "profile") setSubPage("account");
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-57px)] overflow-hidden">
        {/* Bottom orange wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "38%" }}>
          <svg viewBox="0 0 1440 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,120 C360,40 1080,220 1440,80 L1440,400 L0,400 Z" fill="#F97316" />
          </svg>
        </div>

        <div className="relative z-10 flex justify-center pt-6 px-4 pb-10">
          <div
            className="w-full max-w-2xl rounded-3xl p-6"
            style={{ background: "white", border: "2px solid #F5DDD0", boxShadow: "0 4px 24px rgba(249,115,22,0.08)" }}
          >
            {/* ── Top row: avatar/name + password reset ── */}
            <div className="flex items-start justify-between gap-4 mb-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden transition-all"
                  style={{
                    background: currentUser.avatarColor,
                    cursor: isEditing ? "pointer" : "default",
                    border: isEditing ? "2px solid #F97316" : "none",
                  }}
                  aria-label="アバター画像を変更"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.avatarEmoji
                  )}
                  {isEditing && (
                    <span
                      className="absolute inset-x-0 bottom-0 py-0.5 text-[10px]"
                      style={{ background: "rgba(249,115,22,0.88)", color: "white", fontWeight: 700 }}
                    >
                      変更
                    </span>
                  )}
                </button>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1A1A1A" }}>{name}</div>
                  <div style={{ fontSize: "0.82rem", color: "#AAAAAA" }}>
                    {subPage === "account" ? "アカウント設定" : "プロフィール設定"}
                  </div>
                </div>
              </div>

              {/* Password reset — only on account page */}
              {subPage === "account" && (
                <div className="flex flex-col gap-1 items-end">
                  <span style={{ fontSize: "0.82rem", color: "#555" }}>パスワードを再設定</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!isEditing}
                    className="px-4 py-2 rounded-full outline-none"
                    style={{
                      background: isEditing ? "#FFF8F4" : "#F2F2F2",
                      border: `1.5px solid ${isEditing ? "#F97316" : "#E0D5CF"}`,
                      color: "#888",
                      fontSize: "0.85rem",
                      width: 220,
                    }}
                  />
                </div>
              )}
            </div>

            {/* ── Form fields + edit button ── */}
            <div className="flex items-start gap-3">
              {/* Fields */}
              <div className="flex-1 flex flex-col gap-3">
                {subPage === "account" ? (
                  <>
                    <FieldRow label="名前" value={name} onChange={setName} editable={isEditing} />
                    <FieldRow label="電話" value={phone} onChange={setPhone} editable={isEditing} />
                    <FieldRow label="メール" value={email} onChange={setEmail} editable={isEditing} type="email" />
                    <FieldRow label="所在地" value={location} onChange={setLocation} editable={isEditing} />

                    {/* Birth date + gender row */}
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-right flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>
                        生年月日
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 pr-9 rounded-full outline-none"
                            style={{
                              background: isEditing ? "#FFF8F4" : "#F2F2F2",
                              border: `1.5px solid ${isEditing ? "#F97316" : "#E0D5CF"}`,
                              color: isEditing ? "#333" : "#888",
                              fontSize: "0.88rem",
                            }}
                          />
                          <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#AAAAAA" }} />
                        </div>
                        <span className="flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>性別</span>
                        {(["M", "F"] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => isEditing && setGender(g)}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: gender === g ? "#F97316" : "#F2F2F2",
                              color: gender === g ? "white" : "#888",
                              border: `1.5px solid ${gender === g ? "#F97316" : "#E0D5CF"}`,
                              fontWeight: 600,
                              fontSize: "0.9rem",
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <FieldRow label="自己紹介" value={bio} onChange={setBio} editable={isEditing} />

                    {/* Languages row */}
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-right flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>
                        言語
                      </span>
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        {languages.map((lang, i) => (
                          <LangTag
                            key={i}
                            label={lang}
                            editable={isEditing}
                            onRemove={() => setLanguages((prev) => prev.filter((_, idx) => idx !== i))}
                          />
                        ))}
                        {isEditing && (
                          <button
                            className="px-3 py-1.5 rounded-full text-sm hover:opacity-80"
                            style={{ border: "1.5px dashed #F97316", color: "#F97316", fontSize: "0.8rem" }}
                            onClick={() => {
                              const lang = prompt("言語を入力してください");
                              if (lang) setLanguages((prev) => [...prev, lang]);
                            }}
                          >
                            ＋追加
                          </button>
                        )}
                      </div>
                    </div>

                    <FieldRow label="興味" value={interests} onChange={setInterests} editable={isEditing} />
                    <FieldRow label="性格" value={personality} onChange={setPersonality} editable={isEditing} />
                  </>
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={handleEditToggle}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all hover:opacity-80 mt-2"
                style={{
                  background: isEditing ? "#F0FFF4" : "#FFF0E8",
                  border: `1.5px solid ${isEditing ? "#22C55E" : "#F97316"}`,
                  color: isEditing ? "#22C55E" : "#F97316",
                }}
              >
                {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                <span style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                  {isEditing ? "保存" : "編集"}
                </span>
              </button>
            </div>

            {/* ── Bottom navigation arrows ── */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <button
                onClick={goPrev}
                disabled={subPage === "account"}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: subPage === "account" ? "#F5F5F5" : "#FFF0E8",
                  border: `1.5px solid ${subPage === "account" ? "#E0D5CF" : "#F97316"}`,
                  color: subPage === "account" ? "#CCCCCC" : "#F97316",
                }}
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page dots */}
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: subPage === "account" ? "#F97316" : "#E0D5CF" }}
                />
                <div
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: subPage === "profile" ? "#F97316" : "#E0D5CF" }}
                />
              </div>

              <button
                onClick={goNext}
                disabled={subPage === "profile"}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: subPage === "profile" ? "#F5F5F5" : "#FFF0E8",
                  border: `1.5px solid ${subPage === "profile" ? "#E0D5CF" : "#F97316"}`,
                  color: subPage === "profile" ? "#CCCCCC" : "#F97316",
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
