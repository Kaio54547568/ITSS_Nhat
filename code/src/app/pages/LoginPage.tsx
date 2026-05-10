import { useState } from "react";
import { useNavigate } from "react-router";
import { CharacterLeft, CharacterRight } from "../components/Characters";
import { getRedirectPathByRole, login } from "../data/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!username.trim()) nextErrors.username = "ユーザー名を入力してください。";
    if (!password.trim()) nextErrors.password = "パスワードを入力してください。";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const session = login(username.trim(), password);
    if (!session) {
      setErrors({ form: "ログイン情報が正しくありません。" });
      return;
    }

    navigate(getRedirectPathByRole(session.role));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col" style={{ background: "#FEF0E8" }}>
      {/* Orange wave background */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "52%" }}>
        <svg
          viewBox="0 0 1440 400"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,100 C360,20 1080,200 1440,60 L1440,400 L0,400 Z"
            fill="#F97316"
          />
        </svg>
      </div>

      {/* Title */}
      <div className="relative z-10 flex justify-center pt-8 pb-4">
        <h1
          style={{
            color: "#E8641A",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
          }}
        >
          日越フレンド
        </h1>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        {/* Left character */}
        <div
          className="hidden md:flex items-end justify-end"
          style={{ width: 140, marginBottom: -20, marginRight: 8 }}
        >
          <CharacterLeft />
        </div>

        {/* Form card */}
        <div
          className="w-full rounded-2xl p-6 shadow-md"
          style={{
            background: "white",
            border: "2.5px solid #F97316",
            maxWidth: 320,
          }}
        >
          {/* Username */}
          <div className="mb-4">
            <label
              className="block mb-1"
              style={{
                color: "#222",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              USERNAME
            </label>
            <input
              type="text"
              placeholder="name"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: undefined, form: undefined }));
              }}
              className="w-full rounded-full px-5 py-2.5 text-center outline-none transition-all"
              style={{
                border: `2px solid ${errors.username ? "#EF4444" : "#F97316"}`,
                color: "#888",
                fontSize: "1rem",
                background: "white",
              }}
            />
            {errors.username && (
              <p className="mt-1 text-center" style={{ color: "#EF4444", fontSize: "0.78rem" }}>
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label
              className="block mb-1"
              style={{
                color: "#222",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
              }}
              className="w-full rounded-full px-5 py-2.5 text-center outline-none transition-all"
              style={{
                border: `2px solid ${errors.password ? "#EF4444" : "#F97316"}`,
                color: "#888",
                fontSize: "1rem",
                background: "white",
              }}
            />
            {errors.password && (
              <p className="mt-1 text-center" style={{ color: "#EF4444", fontSize: "0.78rem" }}>
                {errors.password}
              </p>
            )}
          </div>

          {errors.form && (
            <p className="text-center mb-3" style={{ color: "#EF4444", fontSize: "0.82rem", fontWeight: 600 }}>
              {errors.form}
            </p>
          )}

          {/* Log in button */}
          <button
            onClick={handleSubmit}
            className="w-full rounded-full py-3 transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "#F97316",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            Log In
          </button>

          {/* Sign up link */}
          <p
            className="text-center mt-4"
            style={{ color: "#F97316", fontSize: "0.85rem" }}
          >
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-bold underline hover:opacity-80"
              style={{ color: "#F97316" }}
            >
              Sign up.
            </button>
          </p>
        </div>

        {/* Right character */}
        <div
          className="hidden md:flex items-end justify-start"
          style={{ width: 140, marginBottom: -20, marginLeft: 8 }}
        >
          <CharacterRight />
        </div>
      </div>

      {/* Bottom spacing */}
      <div style={{ height: "6vh" }} />
    </div>
  );
}
