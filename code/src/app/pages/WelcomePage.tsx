import { useNavigate } from "react-router";
import { LogIn, UserPlus } from "lucide-react";

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col" style={{ background: "#FEF0E8" }}>
      {/* Top content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 pt-12 z-10 relative">
        <h1
          className="text-center mb-3"
          style={{
            color: "#E8641A",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          日越フレンド
        </h1>
        <p
          className="text-center mb-4"
          style={{
            color: "#E8641A",
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            fontWeight: 600,
          }}
        >
          マッチして・つながって・話そう
        </p>
        <p
          className="text-center max-w-md"
          style={{
            color: "#C05A1A",
            fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
            lineHeight: 1.6,
          }}
        >
          気軽に友達を見つけて、自然にコミュニケーション。長く続くつながりを作ろう。
        </p>
      </div>

      {/* Wave background */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "55%" }}>
        <svg
          viewBox="0 0 1440 400"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,120 C360,30 1080,220 1440,80 L1440,400 L0,400 Z"
            fill="#F97316"
          />
        </svg>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4 pb-16 z-10">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-8 py-3 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "#F97316",
              color: "white",
              border: "2.5px solid white",
              fontSize: "1rem",
              fontWeight: 600,
              minWidth: "150px",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
            }}
          >
            新規登録
            <LogIn size={20} />
          </button>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-8 py-3 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "white",
              color: "#E8641A",
              border: "2.5px solid #E8641A",
              fontSize: "1rem",
              fontWeight: 600,
              minWidth: "150px",
              justifyContent: "center",
            }}
          >
            ログイン
            <UserPlus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
