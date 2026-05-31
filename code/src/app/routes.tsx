import { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet, useLocation, useRouteError } from "react-router";
import { getRedirectPathByRole, getRedirectPathForSession, getSession, saveSessionPath, type AuthSession } from "./data/auth";
import { WelcomePage } from "./pages/WelcomePage";
import { SignUpPage } from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { ChatHistoryPage } from "./pages/ChatHistoryPage";
import { ChatRoomPage } from "./pages/ChatRoomPage";
import { ReviewPage } from "./pages/ReviewPage";
import { ReportPage } from "./pages/ReportPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminVerificationPage } from "./pages/admin/AdminVerificationPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";

function Root() {
  return <Outlet />;
}

function SessionPathTracker({ role }: { role: AuthSession["role"] }) {
  const location = useLocation();

  useEffect(() => {
    saveSessionPath(role, `${location.pathname}${location.search}${location.hash}`);
  }, [location.hash, location.pathname, location.search, role]);

  return <Outlet />;
}

function PublicGuard() {
  const session = getSession();
  if (session) return <Navigate to={getRedirectPathForSession(session)} replace />;
  return <Outlet />;
}

function PublicFallbackPage() {
  const session = getSession();
  if (session) return <Navigate to={getRedirectPathForSession(session)} replace />;
  return <WelcomePage />;
}

function UserGuard() {
  const session = getSession();
  if (!session) return <Navigate to="/welcome" replace />;
  if (session.role === "admin") return <Navigate to={getRedirectPathByRole(session.role)} replace />;
  return <SessionPathTracker role={session.role} />;
}

function AdminGuard() {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== "admin") return <Navigate to={getRedirectPathByRole(session.role)} replace />;
  return <SessionPathTracker role={session.role} />;
}

function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FEF0E8",
        gap: 12,
      }}
    >
      <div style={{ fontSize: "3rem" }}>😵</div>
      <p style={{ color: "#E8641A", fontWeight: 700, fontSize: "1.1rem" }}>
        エラーが発生しました
      </p>
      <p style={{ color: "#888", fontSize: "0.9rem" }}>
        ページを再読み込みしてください
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          marginTop: 8,
          padding: "10px 28px",
          borderRadius: 999,
          background: "#F97316",
          color: "white",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        トップへ戻る
      </button>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      {
        Component: PublicGuard,
        children: [
          { index: true, Component: WelcomePage },
          { path: "welcome", Component: WelcomePage },
          { path: "signup", Component: SignUpPage },
          { path: "register", Component: SignUpPage },
          { path: "login", Component: LoginPage },
        ],
      },
      {
        Component: UserGuard,
        children: [
          { path: "home", Component: HomePage },
          { path: "profile", Component: ProfilePage },
          { path: "profile/basic", Component: ProfilePage },
          { path: "profile/preferences", Component: ProfilePage },
          { path: "users/:id", Component: UserDetailPage },
          { path: "search", Component: SearchPage },
          { path: "history", Component: ChatHistoryPage },
          { path: "chat", Component: ChatHistoryPage },
          { path: "chat/:id", Component: ChatRoomPage },
          { path: "review/:id", Component: ReviewPage },
          { path: "report/:id", Component: ReportPage },
          { path: "notifications", Component: NotificationsPage },
        ],
      },
      {
        Component: AdminGuard,
        children: [
          { path: "admin", element: <Navigate to="/admin/users" replace /> },
          { path: "admin/users", Component: AdminUsersPage },
          { path: "admin/verification", Component: AdminVerificationPage },
          { path: "admin/reports", Component: AdminReportsPage },
        ],
      },
      { path: "*", Component: PublicFallbackPage },
    ],
  },
]);
