import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Star, Flag, AlertTriangle, Ban, MoreHorizontal, ImagePlus, X } from "lucide-react";
import { imageFileName, uploadPic } from "../storage/pics";
import { supabase } from "../supabase";
import { useAppData } from "../store/AppDataContext";

type Tab = "review" | "report";

function ReportCategoryIcon({ label }: { label: string }) {
  if (label.includes("スパム") || label.includes("詐欺")) return <Ban size={13} />;
  if (label.includes("その他")) return <MoreHorizontal size={13} />;
  return <AlertTriangle size={13} />;
}

export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contactId = parseInt(id ?? "1");
  const { currentUser, getUserById } = useAppData();
  const contact = getUserById(contactId);

  const [activeTab, setActiveTab] = useState<Tab>(
    window.location.pathname.startsWith("/report") ? "report" : "review"
  );
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [reportCategories, setReportCategories] = useState<string[]>([]);
  const [reportDetail, setReportDetail] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const evidenceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("reference_options")
        .select("value")
        .eq("kind", "report_reason")
        .order("sort_order", { ascending: true });
      if (error) {
        console.error("Failed to load report categories", error);
        return;
      }
      setReportCategories((data ?? []).map((option) => option.value));
    })();
  }, []);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleEvidenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEvidenceFile(file);
    const reader = new FileReader();
    reader.onload = () => setEvidencePreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!contact || submitted) return;
    if (activeTab === "review" && rating === 0) return;

    const createdAt = new Date().toISOString();
    const notifyUsers = async (items: Array<{ userId: string; type: "review" | "report" | "account_locked"; message: string }>) => {
      const rows = items.map((item, index) => ({
        id: `notification_${item.type}_${Date.now()}_${index}_${item.userId}`,
        user_id: item.userId,
        type: item.type,
        from_user_id: currentUser.id,
        message: item.message,
        is_read: false,
        created_at: createdAt,
      }));
      const { error } = await supabase.from("notifications").insert(rows);
      if (error) throw error;
    };

    if (activeTab === "report") {
      const reason = selectedCategories
        .join("、") || "その他";
      const reportId = `r${Date.now()}`;
      const evidenceImage = evidenceFile
        ? await uploadPic(evidenceFile, `reports/${currentUser.id}`, `${Date.now()}-${imageFileName(evidenceFile, "evidence")}`)
        : null;
      const { error } = await supabase.from("reports").insert({
        id: reportId,
        reporter_user_id: currentUser.id,
        target_user_id: contact.id,
        reporter_name: currentUser.name || "ユーザー",
        target_name: contact.name,
        report_date: createdAt.slice(0, 10),
        reason,
        detail: reportDetail,
        evidence_image: evidenceImage,
        status: "確認待ち",
        source: "frontend",
      });
      if (error) {
        console.error("Failed to submit report", error);
        return;
      }

      await notifyUsers([
        { userId: "admin1", type: "report", message: `${currentUser.name}さんが${contact.name}さんを通報しました` },
        { userId: currentUser.id, type: "report", message: `${contact.name}さんへの通報を送信しました` },
        { userId: contact.id, type: "report", message: "あなたのプロフィールに通報が送信されました" },
      ]);
    } else {
      const { error } = await supabase.from("reviews").insert({
        reviewer_user_id: currentUser.id,
        target_user_id: contact.id,
        rating,
        feedback,
        submitted_at: createdAt,
      });
      if (error) {
        console.error("Failed to submit review", error);
        return;
      }
      await notifyUsers([
        { userId: "admin1", type: "review", message: `${currentUser.name}さんが${contact.name}さんを評価しました` },
        { userId: currentUser.id, type: "review", message: `${contact.name}さんへの評価を送信しました` },
        { userId: contact.id, type: "review", message: `${currentUser.name}さんから評価が届きました` },
      ]);
    }
    setSubmitted(true);
    setTimeout(() => {
      navigate(-1);
    }, 1200);
  };

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FEF0E8" }}>
        <p style={{ color: "#999" }}>ユーザーが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FEF0E8" }}>
      {/* Back button */}
      <div className="px-5 pt-5 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          style={{ color: "#1A1A1A", fontSize: "0.95rem" }}
        >
          <ArrowLeft size={18} />
          <span>戻る</span>
        </button>
      </div>

      {/* Main card */}
      <div className="flex-1 px-4 pb-8 max-w-xl mx-auto w-full">
        {/* User info card */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
          style={{
            background: "white",
            border: "1.5px solid #F0D5C8",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: contact.avatarColor }}
          >
            {contact.avatarEmoji}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A1A" }}>
              {contact.name}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#888" }}>
              体験を評価する、または問題を報告する
            </div>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setActiveTab("review")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all"
            style={{
              background: activeTab === "review" ? "#F97316" : "white",
              color: activeTab === "review" ? "white" : "#555",
              border: "1.5px solid",
              borderColor: activeTab === "review" ? "#F97316" : "#E0D5CF",
              fontWeight: activeTab === "review" ? 600 : 400,
              fontSize: "0.92rem",
            }}
          >
            <Star size={16} />
            ユーザーを評価
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all"
            style={{
              background: activeTab === "report" ? "#F97316" : "white",
              color: activeTab === "report" ? "white" : "#555",
              border: "1.5px solid",
              borderColor: activeTab === "report" ? "#F97316" : "#E0D5CF",
              fontWeight: activeTab === "report" ? 600 : 400,
              fontSize: "0.92rem",
            }}
          >
            <Flag size={16} />
            問題を報告
          </button>
        </div>

        {/* ── REVIEW TAB ── */}
        {activeTab === "review" && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "white", border: "1.5px solid #F0D5C8" }}
          >
            <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1A1A1A", marginBottom: 4 }}>
              体験を評価
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: 16 }}>
              やり取りはいかがでしたか?
            </p>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      style={{
                        color:
                          star <= (hoveredStar || rating)
                            ? "#F97316"
                            : "#DDDDDD",
                        fill:
                          star <= (hoveredStar || rating)
                            ? "#F97316"
                            : "none",
                        transition: "all 0.15s",
                      }}
                    />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: "0.78rem", color: "#AAAAAA" }}>
                タップして評価
              </span>
            </div>

            {/* Feedback textarea */}
            <div className="mb-5">
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  color: "#555",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                追加のフィードバック（任意）
              </label>
              <textarea
                placeholder="このユーザーとの体験を共有してください..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm"
                style={{
                  border: "1.5px solid #F0D5C8",
                  background: "#FFF8F4",
                  color: "#333",
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-full transition-all hover:opacity-80"
                style={{
                  background: "white",
                  border: "1.5px solid #E0D5CF",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitted}
                className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
                style={{
                  background: submitted ? "#22C55E" : rating === 0 ? "#F0D5C8" : "#F97316",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                {submitted ? "送信しました！" : "評価を送信"}
              </button>
            </div>
          </div>
        )}

        {/* ── REPORT TAB ── */}
        {activeTab === "report" && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "white", border: "1.5px solid #F0D5C8" }}
          >
            <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1A1A1A", marginBottom: 4 }}>
              問題を報告
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: 16 }}>
              どのような問題ですか?
            </p>

            {/* Category grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {reportCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-full text-left transition-all"
                    style={{
                      border: "1.5px solid",
                      borderColor: isSelected ? "#F97316" : "#E0D5CF",
                      background: isSelected ? "#FFF0E8" : "white",
                      color: isSelected ? "#E8641A" : "#555",
                      fontSize: "0.82rem",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span style={{ color: isSelected ? "#F97316" : "#AAAAAA" }}>
                      <ReportCategoryIcon label={category} />
                    </span>
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Detail textarea */}
            <div className="mb-5">
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  color: "#555",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                詳細をご記入ください
                <span style={{ color: "#F97316" }}>*</span>
              </label>
              <textarea
                placeholder="問題の詳細をご記入ください。調査に役立つ情報があれば、できるだけ具体的にご記載ください。"
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm"
                style={{
                  border: "1.5px solid #F0D5C8",
                  background: "#FFF8F4",
                  color: "#333",
                }}
              />
            </div>

            <div className="mb-5">
              <input ref={evidenceInputRef} type="file" accept="image/*" className="hidden" onChange={handleEvidenceChange} />
              <div className="flex items-center justify-between gap-3 mb-2">
                <label style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600 }}>
                  証拠画像（任意）
                </label>
                {evidenceFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFile(null);
                      setEvidencePreview("");
                      if (evidenceInputRef.current) evidenceInputRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{ background: "white", border: "1.5px solid #E0D5CF", color: "#555", fontSize: "0.78rem" }}
                  >
                    <X size={13} /> 削除
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => evidenceInputRef.current?.click()}
                className="w-full rounded-xl flex items-center justify-center overflow-hidden transition-all hover:opacity-90"
                style={{
                  height: 136,
                  background: evidencePreview ? "#FFF8F4" : "white",
                  border: `1.5px ${evidencePreview ? "solid" : "dashed"} #F0D5C8`,
                  color: "#F97316",
                }}
              >
                {evidencePreview ? (
                  <img src={evidencePreview} alt="証拠画像" className="w-full h-full object-cover" />
                ) : (
                  <span className="inline-flex items-center gap-2" style={{ fontWeight: 700, fontSize: "0.86rem" }}>
                    <ImagePlus size={18} /> 画像を追加
                  </span>
                )}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-full transition-all hover:opacity-80"
                style={{
                  background: "white",
                  border: "1.5px solid #E0D5CF",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitted}
                className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
                style={{
                  background: submitted ? "#22C55E" : "#F97316",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                {submitted ? "送信しました！" : "通報を送信"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
