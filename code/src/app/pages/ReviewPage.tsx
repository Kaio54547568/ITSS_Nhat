import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Star, Flag, AlertTriangle, Ban, MoreHorizontal } from "lucide-react";
import { getUserById } from "../data/mockData";
import { getReports, saveReports } from "../data/reports";

type Tab = "review" | "report";

const reportCategories = [
  { id: "inappropriate", label: "不適切な行為", icon: <AlertTriangle size={13} /> },
  { id: "spam", label: "スパム・詐欺", icon: <Ban size={13} /> },
  { id: "other", label: "その他", icon: <MoreHorizontal size={13} /> },
  { id: "fake", label: "偽のプロフィール", icon: <AlertTriangle size={13} /> },
  { id: "harassment", label: "嫌がらせ", icon: <AlertTriangle size={13} /> },
];

export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contactId = parseInt(id ?? "1");
  const contact = getUserById(contactId);

  const [activeTab, setActiveTab] = useState<Tab>(
    window.location.pathname.startsWith("/report") ? "report" : "review"
  );
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [reportDetail, setReportDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = () => {
    if (activeTab === "report") {
      const reason = selectedCategories
        .map((categoryId) => reportCategories.find((category) => category.id === categoryId)?.label)
        .filter(Boolean)
        .join("、") || "その他";
      saveReports([
        {
          id: `r${Date.now()}`,
          reporterName: "ユーザー",
          targetName: contact?.name ?? "不明",
          targetId: String(contactId),
          date: new Date().toISOString().slice(0, 10),
          reason,
          detail: reportDetail,
          evidenceImage: "証拠画像プレースホルダー",
          status: "確認待ち",
        },
        ...getReports(),
      ]);
    } else {
      localStorage.setItem(
        `nv_friend_review_${contactId}`,
        JSON.stringify({ rating, feedback, submittedAt: new Date().toISOString() })
      );
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
                className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: submitted ? "#22C55E" : "#F97316",
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
              {reportCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
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
                      {cat.icon}
                    </span>
                    {cat.label}
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
                className="flex-1 py-3 rounded-full transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: submitted ? "#22C55E" : "#F97316",
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
      </div>
    </div>
  );
}
