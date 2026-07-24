import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  User,
  BarChart3,
  History,
  UserPlus,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ChevronRight,
  LogOut,
  Swords,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "../providers/AuthProvider";
import { cn } from "../../shared/lib/utils";
import { useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Partidas", path: "/play", icon: Swords },
  { label: "Ranking", path: "/ranking", icon: Trophy },
  { label: "Perfil", path: "/profile", icon: User },
  { label: "Estatísticas", path: "/statistics", icon: BarChart3 },
  { label: "Histórico", path: "/history", icon: History },
  { label: "Duplas", path: "/doubles", icon: UserPlus },
  { label: "Configurações", path: "/settings", icon: Settings },
];

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-active/20 text-sidebar-active"
            : "text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isActive ? "text-sidebar-active" : "text-sidebar-text-muted group-hover:text-sidebar-text"
            )}
          />
          <span className="flex-1">{item.label}</span>
          {isActive && (
            <ChevronRight className="h-4 w-4 text-sidebar-active" />
          )}
        </>
      )}
    </NavLink>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = navigation.find(
    (item) =>
      item.path === location.pathname ||
      (item.path !== "/" && location.pathname.startsWith(item.path))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <img src="/logo.png" alt="Domino Vittas" className="h-14 w-14 rounded-lg object-contain" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-text">Domino</h1>
            <p className="text-xs text-sidebar-text-muted">Vittas Dashboard</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-1 text-sidebar-text-muted hover:text-sidebar-text lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-text-muted/60">
            Menu
          </p>
          {navigation.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-active/30">
              <User className="h-4 w-4 text-sidebar-active" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-text truncate">
                {user?.nickname || "Jogador"}
              </p>
              <p className="text-xs text-sidebar-text-muted truncate">
                Nível 12
              </p>
            </div>
            <button
              onClick={async () => { await logout(); navigate("/login"); }}
              className="rounded-md p-1.5 text-sidebar-text-muted transition-colors hover:bg-red-500/20 hover:text-red-400"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-surface-border bg-surface px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-text lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 rounded-lg border border-surface-border bg-surface-muted px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-text"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text">
              {currentPage?.label ?? "Dashboard"}
            </h2>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
