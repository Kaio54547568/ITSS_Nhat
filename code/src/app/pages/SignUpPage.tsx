import { useState } from "react";
import { useNavigate } from "react-router";
import { CharacterLeft, CharacterRight } from "../components/Characters";
import { login, registerUser } from "../data/auth";
import { getUsers } from "../data/users";

export function SignUpPage() {
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

    if (getUsers().some((user) => user.username === username.trim())) {
      setErrors({ form: "登録に失敗しました。このユーザー名はすでに使われています。" });
      return;
    }

    try {
      registerUser(username.trim(), password);
      login(username.trim(), password);
      navigate("/home");
    } catch {
      setErrors({ form: "登録に失敗しました。もう一度お試しください。" });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col" style={{ background: "#fff7f2" }}>
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

          {/* Sign up button */}
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
            Sign up
          </button>

          {/* Login link */}
          <p
            className="text-center mt-4"
            style={{ color: "#F97316", fontSize: "0.85rem" }}
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-bold underline hover:opacity-80"
              style={{ color: "#F97316" }}
            >
              Log in.
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
