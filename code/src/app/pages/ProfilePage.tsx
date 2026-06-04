import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { Calendar, Check, Edit2, ImagePlus, Plus, ShieldCheck, X } from "lucide-react";
import { Layout } from "../components/Layout";
import { getPicUrl, imageFileName, uploadPic } from "../storage/pics";
import { useAppData } from "../store/AppDataContext";
import { supabase } from "../supabase";

const PASSWORD_MASK = "••••••••••••••••••••••";
const LANGUAGE_OPTIONS = ["ベトナム語", "英語", "日本語"];
const PERSONALITY_OPTIONS = [
  "外向的",
  "内向的",
  "アクティブ",
  "落ち着いている",
  "のんびり",
  "ユーモアがある",
  "真面目",
  "思いやりがある",
  "好奇心旺盛",
  "聞き上手",
];

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
      <span className="w-20 text-right flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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

function BirthDateInput({
  value,
  onChange,
  editable,
}: {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
}) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex-1">
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={!editable}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{
          background: editable ? "#FFF8F4" : "#F2F2F2",
          border: `1.5px solid ${editable ? "#F97316" : "#E0D5CF"}`,
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          value={value}
          onChange={(event) => {
            const cleaned = event.target.value.replace(/[^\d-]/g, "").slice(0, 10);
            onChange(cleaned);
          }}
          disabled={!editable}
          className="flex-1 bg-transparent outline-none"
          style={{ color: editable ? "#333" : "#888", fontSize: "0.88rem" }}
        />
        <button
          type="button"
          disabled={!editable}
          onClick={() => {
            const picker = dateInputRef.current;
            if (!picker) return;
            if ("showPicker" in picker) picker.showPicker();
            else picker.click();
          }}
          className="ml-auto w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80 disabled:cursor-not-allowed"
          style={{ color: "#AAAAAA" }}
          aria-label="生年月日をカレンダーで選択"
        >
          <Calendar size={14} />
        </button>
      </div>
    </div>
  );
}

function OptionTag({
  label,
  editable,
  onRemove,
}: {
  label: string;
  editable: boolean;
  onRemove: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full"
      style={{
        background: editable ? "#FFF0E8" : "#F2F2F2",
        border: `1.5px solid ${editable ? "#F97316" : "#E0D5CF"}`,
        color: editable ? "#E8641A" : "#888",
        fontSize: "0.85rem",
      }}
    >
      {label}
      {editable && (
        <button type="button" onClick={onRemove} className="ml-1 hover:opacity-70" aria-label={`${label}を削除`}>
          <X size={13} />
        </button>
      )}
    </span>
  );
}

function OptionPicker({
  label,
  values,
  options,
  editable,
  isOpen,
  onToggleOpen,
  onAdd,
  onRemove,
}: {
  label: string;
  values: string[];
  options: string[];
  editable: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const available = options.filter((option) => !values.includes(option));

  return (
    <div className="flex items-start gap-3">
      <span className="w-20 text-right flex-shrink-0 pt-2" style={{ color: "#555", fontSize: "0.88rem" }}>
        {label}
      </span>
      <div className="relative flex-1">
        <div className="flex items-center gap-2 flex-wrap min-h-10">
          {values.length === 0 ? (
            <span className="px-1 py-2" style={{ color: "#AAAAAA", fontSize: "0.86rem" }}>
              未設定
            </span>
          ) : (
            values.map((value) => (
              <OptionTag key={value} label={value} editable={editable} onRemove={() => onRemove(value)} />
            ))
          )}
          {editable && (
            <button
              type="button"
              onClick={onToggleOpen}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm hover:opacity-80"
              style={{ border: "1.5px dashed #F97316", color: "#F97316", fontSize: "0.8rem" }}
            >
              <Plus size={13} /> 追加
            </button>
          )}
        </div>

        {editable && isOpen && (
          <div
            className="absolute left-0 top-full z-20 mt-2 flex flex-wrap gap-2 rounded-2xl p-3"
            style={{
              width: "min(460px, calc(100vw - 80px))",
              background: "white",
              border: "1.5px solid #F5DDD0",
              boxShadow: "0 12px 36px rgba(0,0,0,0.14)",
            }}
          >
            {available.length === 0 ? (
              <span style={{ color: "#999", fontSize: "0.85rem" }}>追加できる項目はありません</span>
            ) : (
              available.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onAdd(option)}
                  className="px-3 py-1.5 rounded-full transition-all hover:opacity-85"
                  style={{ background: "#FFF0E8", border: "1px solid #F97316", color: "#E8641A", fontSize: "0.82rem" }}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VerificationUploadCard({
  label,
  preview,
  disabled,
  onChange,
}: {
  label: string;
  preview: string;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: preview ? "#FFF8F4" : "white",
        border: `1.5px ${preview ? "solid" : "dashed"} ${disabled ? "#E0D5CF" : "#F97316"}`,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onChange} />
      <span className="px-3 py-2" style={{ color: "#555", fontSize: "0.8rem", fontWeight: 700 }}>
        {label}
      </span>
      <span className="h-36 flex items-center justify-center overflow-hidden" style={{ borderTop: "1px solid #F5DDD0" }}>
        {preview ? <img src={preview} alt={label} className="w-full h-full object-cover" /> : <ImagePlus size={26} style={{ color: "#F0D5C8" }} />}
      </span>
    </label>
  );
}

export function ProfilePage() {
  const { currentUser, refreshData } = useAppData();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(() => getPicUrl(currentUser.avatarPath));
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState(() => getPicUrl(currentUser.idCardFrontImagePath));
  const [idCardBackFile, setIdCardBackFile] = useState<File | null>(null);
  const [idCardBackPreview, setIdCardBackPreview] = useState(() => getPicUrl(currentUser.idCardBackImagePath));
  const [idCardSelfieFile, setIdCardSelfieFile] = useState<File | null>(null);
  const [idCardSelfiePreview, setIdCardSelfiePreview] = useState(() => getPicUrl(currentUser.idCardSelfieImagePath));
  const [openPicker, setOpenPicker] = useState<"languages" | "interests" | "personality" | null>(null);
  const [languageOptions, setLanguageOptions] = useState<string[]>(LANGUAGE_OPTIONS);
  const [interestOptions, setInterestOptions] = useState<string[]>([]);

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.address);
  const [countryCode, setCountryCode] = useState<"VN" | "JP">(currentUser.countryCode);
  const [birthDate, setBirthDate] = useState(currentUser.birthDate);
  const [gender, setGender] = useState<"M" | "F">(currentUser.gender === "F" ? "F" : "M");
  const [password, setPassword] = useState(PASSWORD_MASK);

  const [bio, setBio] = useState(currentUser.bio);
  const [languages, setLanguages] = useState<string[]>([...currentUser.languages]);
  const [interests, setInterests] = useState<string[]>([...currentUser.interests]);
  const [personality, setPersonality] = useState<string[]>([...currentUser.personality]);

  const isVerified = currentUser.verificationStatus === "承認済み" || currentUser.verificationStatus === "認証済み";
  const canEditProtectedFields = isEditing && !isVerified;
  const canEditIdCard = !isVerified && currentUser.verificationStatus !== "確認待ち";
  const personalityItems = personality;
  const isProfileComplete =
    [name, phone, email, location, birthDate, gender, bio, countryCode].every((value) => value.trim().length > 0) &&
    languages.length > 0 &&
    interests.length > 0 &&
    personalityItems.length > 0;
  const hasIdCardImage = Boolean(
    (idCardFile || currentUser.idCardFrontImagePath) &&
    (idCardBackFile || currentUser.idCardBackImagePath) &&
    (idCardSelfieFile || currentUser.idCardSelfieImagePath),
  );
  const canSubmitVerification =
    !isVerified && currentUser.verificationStatus !== "確認待ち" && isProfileComplete && hasIdCardImage;

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("reference_options")
        .select("kind, value")
        .in("kind", ["interest"])
        .order("sort_order", { ascending: true });
      if (error) {
        console.error("Failed to load profile options", error);
        return;
      }
      setLanguageOptions(LANGUAGE_OPTIONS);
      setInterestOptions((data ?? []).filter((option) => option.kind === "interest").map((option) => option.value));
    })();
  }, []);

  useEffect(() => {
    if (isEditing) return;
    setName(currentUser.name);
    setPhone(currentUser.phone);
    setEmail(currentUser.email);
    setLocation(currentUser.address);
    setCountryCode(currentUser.countryCode);
    setBirthDate(currentUser.birthDate);
    setGender(currentUser.gender === "F" ? "F" : "M");
    setPassword(PASSWORD_MASK);
    setBio(currentUser.bio);
    setLanguages([...currentUser.languages]);
    setInterests([...currentUser.interests]);
    setPersonality([...currentUser.personality]);
    setAvatarFile(null);
    setAvatarPreview(getPicUrl(currentUser.avatarPath));
    setIdCardFile(null);
    setIdCardPreview(getPicUrl(currentUser.idCardFrontImagePath));
    setIdCardBackFile(null);
    setIdCardBackPreview(getPicUrl(currentUser.idCardBackImagePath));
    setIdCardSelfieFile(null);
    setIdCardSelfiePreview(getPicUrl(currentUser.idCardSelfieImagePath));
  }, [currentUser, isEditing]);

  const handleEditToggle = async () => {
    if (isEditing) {
      setIsSaving(true);
      const nextProfile: Record<string, string | string[] | null> = {
        name,
        phone: isVerified ? currentUser.phone : phone,
        email: isVerified ? currentUser.email : email.trim() === "" ? null : email,
        address: location,
        country_code: countryCode,
        nationality: countryCode === "JP" ? "日本" : "ベトナム",
        birth_date: birthDate,
        gender,
        bio,
        languages,
        interests,
        personality,
      };
      if (avatarFile) {
        nextProfile.avatar = await uploadPic(avatarFile, `avatars/${currentUser.id}`, imageFileName(avatarFile, "avatar"));
      }
      if (!password.includes("•")) nextProfile.password = password;
      const { error } = await supabase.from("profiles").update(nextProfile).eq("id", currentUser.id);
      if (error) {
        console.error("Failed to update profile", error);
        setIsSaving(false);
        return;
      }
      await refreshData();
      setOpenPicker(null);
      setIsSaving(false);
    }
    setIsEditing((prev) => !prev);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const nextAvatar = typeof reader.result === "string" ? reader.result : "";
      if (!nextAvatar) return;
      setAvatarPreview(nextAvatar);
    };
    reader.readAsDataURL(file);
  };

  const handleIdCardChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIdCardFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = typeof reader.result === "string" ? reader.result : "";
      if (!nextImage) return;
      setIdCardPreview(nextImage);
    };
    reader.readAsDataURL(file);
  };

  const handleVerificationImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: Dispatch<SetStateAction<File | null>>,
    setPreview: Dispatch<SetStateAction<string>>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = typeof reader.result === "string" ? reader.result : "";
      if (nextImage) setPreview(nextImage);
    };
    reader.readAsDataURL(file);
  };

  const submitVerification = async () => {
    if (!canSubmitVerification) return;
    setIsSaving(true);
    let avatarPath = currentUser.avatarPath;
    if (avatarFile) {
      avatarPath = await uploadPic(avatarFile, `avatars/${currentUser.id}`, imageFileName(avatarFile, "avatar"));
    }
    let idCardPath = currentUser.idCardFrontImagePath;
    if (idCardFile) {
      idCardPath = await uploadPic(idCardFile, `id-cards/${currentUser.id}`, `${Date.now()}-${imageFileName(idCardFile, "front")}`);
    }
    let idCardBackPath = currentUser.idCardBackImagePath;
    if (idCardBackFile) {
      idCardBackPath = await uploadPic(idCardBackFile, `id-cards/${currentUser.id}`, `${Date.now()}-${imageFileName(idCardBackFile, "back")}`);
    }
    let idCardSelfiePath = currentUser.idCardSelfieImagePath;
    if (idCardSelfieFile) {
      idCardSelfiePath = await uploadPic(idCardSelfieFile, `id-cards/${currentUser.id}`, `${Date.now()}-${imageFileName(idCardSelfieFile, "selfie")}`);
    }
    if (!idCardPath || !idCardBackPath || !idCardSelfiePath) {
      setIsSaving(false);
      return;
    }
    setIdCardPreview(getPicUrl(idCardPath));
    setIdCardBackPreview(getPicUrl(idCardBackPath));
    setIdCardSelfiePreview(getPicUrl(idCardSelfiePath));
    setIdCardFile(null);
    setIdCardBackFile(null);
    setIdCardSelfieFile(null);
    const submittedAt = new Date().toISOString();
    const profileSnapshot = {
      name,
      phone,
      email,
      address: location,
      countryCode,
      birthDate,
      gender,
      bio,
      languages,
      interests,
      personality: personalityItems,
      avatar: avatarPath,
      idCardImage: idCardPath,
      idCardFrontImage: idCardPath,
      idCardBackImage: idCardBackPath,
      idCardSelfieImage: idCardSelfiePath,
    };
    const profileUpdate: Record<string, string | string[] | null> = {
      name,
      phone,
      email: email.trim() === "" ? null : email,
      address: location,
      country_code: countryCode,
      nationality: countryCode === "JP" ? "日本" : "ベトナム",
      birth_date: birthDate,
      gender,
      bio,
      languages,
      interests,
      personality: personalityItems,
      avatar: avatarPath,
      id_card_image: idCardPath,
      id_card_front_image: idCardPath,
      id_card_back_image: idCardBackPath,
      id_card_selfie_image: idCardSelfiePath,
      verification_status: "確認待ち",
      account_status: "未有効",
    };
    if (!password.includes("•")) profileUpdate.password = password;
    const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("id", currentUser.id);
    if (profileError) {
      console.error("Failed to update profile before verification", profileError);
      setIsSaving(false);
      return;
    }
    const { error } = await supabase.from("verification_requests").insert({
      id: `verification_${Date.now()}_${currentUser.id}`,
      user_id: currentUser.id,
      user_name: name,
      email,
      birth_date: birthDate,
      submitted_at: submittedAt,
      application_date: submittedAt.slice(0, 10),
      id_card_image: idCardPath,
      id_card_front_image: idCardPath,
      id_card_back_image: idCardBackPath,
      id_card_selfie_image: idCardSelfiePath,
      profile_snapshot: profileSnapshot,
      status: "確認待ち",
      avatar_emoji: currentUser.avatarEmoji,
      avatar_color: currentUser.avatarColor,
      source: "frontend",
    });
    if (error) {
      console.error("Failed to submit verification", error);
      setIsSaving(false);
      return;
    }
    await refreshData();
    setIsSaving(false);
  };

  const addUnique = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev : [...prev, value]));
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-57px)] overflow-y-auto" style={{ background: "#fff7f2" }}>
        <div className="relative z-10 flex justify-center pt-6 px-4 pb-10">
          <div
            className="w-full max-w-2xl rounded-3xl p-6"
            style={{ background: "white", border: "2px solid #F5DDD0", boxShadow: "0 4px 24px rgba(249,115,22,0.08)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
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
                  {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : currentUser.avatarEmoji}
                  {isEditing && (
                    <span className="absolute inset-x-0 bottom-0 py-0.5 text-[10px]" style={{ background: "rgba(249,115,22,0.88)", color: "white", fontWeight: 700 }}>
                      変更
                    </span>
                  )}
                </button>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1A1A1A" }}>{name}</div>
                  <div className="flex items-center gap-1" style={{ fontSize: "0.82rem", color: isVerified ? "#16A34A" : "#AAAAAA" }}>
                    {isVerified && <ShieldCheck size={13} />}
                    {isVerified ? "認証済みアカウント" : "プロフィール設定"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEditToggle}
                disabled={isSaving}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all hover:opacity-80 mt-2"
                style={{
                  background: isEditing ? "#F0FFF4" : "#FFF0E8",
                  border: `1.5px solid ${isEditing ? "#22C55E" : "#F97316"}`,
                  color: isEditing ? "#22C55E" : "#F97316",
                }}
              >
                {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                <span style={{ fontSize: "0.72rem", fontWeight: 600 }}>{isSaving ? "保存中" : isEditing ? "保存" : "編集"}</span>
              </button>
            </div>

            {!isVerified && (
              <div
                className="mb-4 rounded-2xl px-4 py-3"
                style={{ background: "#FFF8F4", border: "1.5px solid #F5DDD0", color: "#E8641A", fontSize: "0.86rem", fontWeight: 700 }}
              >
                プロフィールをすべて入力し、本人確認が承認されると他の機能が利用できます。
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="w-20 text-right flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>
                  パスワード
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2 rounded-full outline-none"
                  style={{
                    background: isEditing ? "#FFF8F4" : "#F2F2F2",
                    border: `1.5px solid ${isEditing ? "#F97316" : "#E0D5CF"}`,
                    color: "#888",
                    fontSize: "0.88rem",
                  }}
                />
              </div>

              <FieldRow label="名前" value={name} onChange={setName} editable={isEditing} />
              <FieldRow label="電話" value={phone} onChange={setPhone} editable={canEditProtectedFields} />
              <FieldRow label="メール" value={email} onChange={setEmail} editable={canEditProtectedFields} type="email" />
              <FieldRow label="所在地" value={location} onChange={setLocation} editable={isEditing} />
              <div className="flex items-center gap-3">
                <span className="w-20 text-right flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>国</span>
                <select
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value as "VN" | "JP")}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2 rounded-full outline-none"
                  style={{
                    background: isEditing ? "#FFF8F4" : "#F2F2F2",
                    border: `1.5px solid ${isEditing ? "#F97316" : "#E0D5CF"}`,
                    color: isEditing ? "#333" : "#888",
                    fontSize: "0.88rem",
                  }}
                >
                  <option value="VN">ベトナム</option>
                  <option value="JP">日本</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-20 text-right flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>
                  生年月日
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <BirthDateInput value={birthDate} onChange={setBirthDate} editable={isEditing} />
                  <span className="flex-shrink-0" style={{ color: "#555", fontSize: "0.88rem" }}>性別</span>
                  {(["M", "F"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => isEditing && setGender(value)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: gender === value ? "#F97316" : "#F2F2F2",
                        color: gender === value ? "white" : "#888",
                        border: `1.5px solid ${gender === value ? "#F97316" : "#E0D5CF"}`,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-2 border-t" style={{ borderColor: "#F5DDD0" }} />

              <FieldRow label="自己紹介" value={bio} onChange={setBio} editable={isEditing} />
              <OptionPicker
                label="言語"
                values={languages}
                options={languageOptions}
                editable={isEditing}
                isOpen={openPicker === "languages"}
                onToggleOpen={() => setOpenPicker((prev) => (prev === "languages" ? null : "languages"))}
                onAdd={(value) => addUnique(value, setLanguages)}
                onRemove={(value) => setLanguages((prev) => prev.filter((item) => item !== value))}
              />
              <OptionPicker
                label="興味"
                values={interests}
                options={interestOptions}
                editable={isEditing}
                isOpen={openPicker === "interests"}
                onToggleOpen={() => setOpenPicker((prev) => (prev === "interests" ? null : "interests"))}
                onAdd={(value) => addUnique(value, setInterests)}
                onRemove={(value) => setInterests((prev) => prev.filter((item) => item !== value))}
              />
              <OptionPicker
                label="性格"
                values={personality}
                options={PERSONALITY_OPTIONS}
                editable={isEditing}
                isOpen={openPicker === "personality"}
                onToggleOpen={() => setOpenPicker((prev) => (prev === "personality" ? null : "personality"))}
                onAdd={(value) => addUnique(value, setPersonality)}
                onRemove={(value) => setPersonality((prev) => prev.filter((item) => item !== value))}
              />

              <div className="pt-4 mt-2 border-t" style={{ borderColor: "#F5DDD0" }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 style={{ color: "#1A1A1A", fontWeight: 700, fontSize: "0.98rem" }}>本人確認書類</h3>
                    {isVerified && (
                      <p style={{ color: "#16A34A", fontSize: "0.78rem", marginTop: 2 }}>
                        認証済みのため、電話・メール・本人確認書類は編集できません。
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <VerificationUploadCard label="本人確認書類（表面）をアップロード" preview={idCardPreview} disabled={!canEditIdCard} onChange={handleIdCardChange} />
                  <VerificationUploadCard
                    label="本人確認書類（裏面）をアップロード"
                    preview={idCardBackPreview}
                    disabled={!canEditIdCard}
                    onChange={(event) => handleVerificationImageChange(event, setIdCardBackFile, setIdCardBackPreview)}
                  />
                  <VerificationUploadCard
                    label="本人確認書類を持った自撮りをアップロード"
                    preview={idCardSelfiePreview}
                    disabled={!canEditIdCard}
                    onChange={(event) => handleVerificationImageChange(event, setIdCardSelfieFile, setIdCardSelfiePreview)}
                  />
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  {isVerified ? (
                    <button
                      type="button"
                      disabled
                      className="px-5 py-2 rounded-full"
                      style={{ background: "#DCFCE7", color: "#16A34A", fontWeight: 700, fontSize: "0.9rem" }}
                    >
                      認証済み
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitVerification}
                      disabled={!canSubmitVerification || isSaving}
                      className="px-5 py-2 rounded-full transition-all hover:opacity-90 disabled:cursor-not-allowed"
                      style={{ background: canSubmitVerification ? "#F97316" : "#F0D5C8", color: "white", fontWeight: 700, fontSize: "0.9rem" }}
                    >
                      {currentUser.verificationStatus === "確認待ち" ? "確認待ち" : "本人確認を申請"}
                    </button>
                  )}
                </div>
                {!isVerified && !canSubmitVerification && currentUser.verificationStatus !== "確認待ち" && (
                  <p className="mt-2 text-right" style={{ color: "#C78A70", fontSize: "0.78rem" }}>
                    申請にはプロフィール全項目と3枚の本人確認画像が必要です。
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
