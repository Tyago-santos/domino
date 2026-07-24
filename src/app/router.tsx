import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

const DashboardPage = lazy(
  () => import("../features/dashboard/DashboardPage")
);
const RankingPage = lazy(() => import("../features/ranking/RankingPage"));
const ProfilePage = lazy(() => import("../features/profile/ProfilePage"));
const StatisticsPage = lazy(
  () => import("../features/statistics/StatisticsPage")
);
const HistoryPage = lazy(() => import("../features/history/HistoryPage"));
const DoublesPage = lazy(() => import("../features/doubles/DoublesPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));
const MatchPage = lazy(() => import("../features/match/pages/MatchPage"));
const MatchHistoryPage = lazy(
  () => import("../features/match/pages/MatchHistoryPage")
);

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="text-sm text-text-muted">Carregando...</p>
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "ranking",
        element: (
          <SuspenseWrapper>
            <RankingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "statistics",
        element: (
          <SuspenseWrapper>
            <StatisticsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "history",
        element: (
          <SuspenseWrapper>
            <HistoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "doubles",
        element: (
          <SuspenseWrapper>
            <DoublesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "play",
        element: (
          <SuspenseWrapper>
            <MatchPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "play/history",
        element: (
          <SuspenseWrapper>
            <MatchHistoryPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
