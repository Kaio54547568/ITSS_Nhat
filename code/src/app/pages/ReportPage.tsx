import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Flag, ImagePlus, X } from "lucide-react";
import { imageFileName, uploadPic } from "../storage/pics";
import { useAppData } from "../store/AppDataContext";
import { supabase } from "../supabase";

export function ReportPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser, getUserById } = useAppData();
  const contact = getUserById(id);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const [reportCategories, setReportCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [reportDetail, setReportDetail] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
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
    if (!contact || submitted || selectedCategories.length === 0 || !reportDetail.trim()) return;
    const createdAt = new Date().toISOString();
    const evidenceImage = evidenceFile
      ? await uploadPic(evidenceFile, `reports/${currentUser.id}`, `${Date.now()}-${imageFileName(evidenceFile, "evidence")}`)
      : null;
    const { error } = await supabase.from("reports").insert({
      id: `r${Date.now()}`,
      reporter_user_id: currentUser.id,
      target_user_id: contact.id,
      reporter_name: currentUser.name || "ユーザー",
      target_name: contact.name,
      report_date: createdAt.slice(0, 10),
      reason: selectedCategories.join("、"),
      detail: reportDetail.trim(),
      evidence_image: evidenceImage,
      status: "確認待ち",
      source: "frontend",
      created_at: createdAt,
    });
    if (error) {
      console.error("Failed to submit report", error);
      return;
    }
    await supabase.from("notifications").insert([
      {
        id: `notification_report_admin_${Date.now()}`,
        user_id: "admin1",
        type: "report",
        from_user_id: currentUser.id,
        message: `${currentUser.name}さんが${contact.name}さんを通報しました`,
        is_read: false,
        created_at: createdAt,
      },
      {
        id: `notification_report_sender_${Date.now()}`,
        user_id: currentUser.id,
        type: "report",
        from_user_id: contact.id,
        message: `${contact.name}さんへの通報を送信しました`,
        is_read: false,
        created_at: createdAt,
      },
    ]);
    setSubmitted(true);
    window.setTimeout(() => navigate(-1), 1000);
  };

  if (!contact) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#FEF0E8", color: "#999" }}>ユーザーが見つかりません</div>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FEF0E8" }}>
      <div className="px-5 pt-5 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:opacity-70" style={{ color: "#1A1A1A" }}>
          <ArrowLeft size={18} /> 戻る
        </button>
      </div>

      <div className="flex-1 px-4 pb-8 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4" style={{ background: "white", border: "1.5px solid #F0D5C8" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: contact.avatarColor }}>{contact.avatarEmoji}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{contact.name}</div>
            <div style={{ fontSize: "0.82rem", color: "#888" }}>問題を管理者へ報告する</div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "white", border: "1.5px solid #F0D5C8" }}>
          <h3 className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 16 }}>
            <Flag size={18} style={{ color: "#DC2626" }} /> 問題を報告
          </h3>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {reportCategories.map((category) => {
              const active = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="px-3 py-2.5 rounded-full text-left"
                  style={{ border: `1.5px solid ${active ? "#F97316" : "#E0D5CF"}`, background: active ? "#FFF0E8" : "white", color: active ? "#E8641A" : "#555" }}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <textarea
            placeholder="問題の詳細をご記入ください。"
            value={reportDetail}
            onChange={(event) => setReportDetail(event.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm mb-5"
            style={{ border: "1.5px solid #F0D5C8", background: "#FFF8F4" }}
          />

          <input ref={evidenceInputRef} type="file" accept="image/*" className="hidden" onChange={handleEvidenceChange} />
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600 }}>証拠画像（任意）</span>
            {evidenceFile && (
              <button type="button" onClick={() => { setEvidenceFile(null); setEvidencePreview(""); }} className="inline-flex items-center gap-1 px-3 py-1 rounded-full" style={{ border: "1.5px solid #E0D5CF" }}>
                <X size={13} /> 削除
              </button>
            )}
          </div>
          <button type="button" onClick={() => evidenceInputRef.current?.click()} className="w-full rounded-xl flex items-center justify-center overflow-hidden mb-5" style={{ height: 136, border: "1.5px dashed #F0D5C8" }}>
            {evidencePreview ? <img src={evidencePreview} alt="証拠画像" className="w-full h-full object-cover" /> : <span className="inline-flex items-center gap-2" style={{ color: "#F97316", fontWeight: 700 }}><ImagePlus size={18} /> 画像を追加</span>}
          </button>

          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="flex-1 py-3 rounded-full" style={{ border: "1.5px solid #E0D5CF", color: "#555", fontWeight: 600 }}>キャンセル</button>
            <button
              onClick={handleSubmit}
              disabled={submitted || selectedCategories.length === 0 || !reportDetail.trim()}
              className="flex-1 py-3 rounded-full disabled:cursor-not-allowed"
              style={{ background: submitted ? "#22C55E" : selectedCategories.length > 0 && reportDetail.trim() ? "#F97316" : "#F0D5C8", color: "white", fontWeight: 700 }}
            >
              {submitted ? "送信しました！" : "通報を送信"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
