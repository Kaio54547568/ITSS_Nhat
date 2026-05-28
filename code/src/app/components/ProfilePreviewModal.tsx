import { ArrowLeft, MapPin } from "lucide-react";
import type { AppUser } from "../store/AppDataContext";

export function ProfilePreviewModal({
  user,
  onClose,
}: {
  user: AppUser;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl p-6"
        style={{ background: "white", border: "2px solid #F5DDD0", boxShadow: "0 24px 70px rgba(0,0,0,0.22)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
          style={{ border: "2px solid #F97316", color: "#F97316", background: "white" }}
          aria-label="プロフィールを閉じる"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0"
                style={{ background: user.avatarColor, border: "7px solid #F97316" }}
              >
                {user.avatarEmoji}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1A1A1A", marginBottom: 6 }}>{user.name}</h3>
                <div className="flex items-center gap-1" style={{ color: "#F97316", fontSize: "0.9rem" }}>
                  <MapPin size={14} />
                  <span>{user.address}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="w-16" style={{ fontWeight: 700, color: "#1A1A1A" }}>年齢:</span>
                <strong>{user.age}</strong>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-16" style={{ fontWeight: 700, color: "#1A1A1A" }}>言語:</span>
                <strong>{user.languages.join(" / ")}</strong>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-16 pt-2" style={{ fontWeight: 700, color: "#1A1A1A" }}>興味:</span>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((item) => (
                    <span key={item} className="px-4 py-2 rounded-xl" style={{ background: "#E5E5E5", color: "#1A1A1A", fontWeight: 700, fontSize: "0.86rem" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-16 pt-2" style={{ fontWeight: 700, color: "#1A1A1A" }}>性格:</span>
                <div className="flex flex-wrap gap-2">
                  {user.personality.map((item) => (
                    <span key={item} className="px-4 py-2 rounded-xl" style={{ background: "#F97316", color: "white", fontWeight: 700, fontSize: "0.86rem" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
