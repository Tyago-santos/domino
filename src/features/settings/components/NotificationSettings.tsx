import { useState } from "react";
import { Trophy, Users, TrendingUp, Award, UserPlus, Target } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui";
import { cn } from "@/shared/lib/utils";

interface NotificationOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const notificationOptions: NotificationOption[] = [
  { id: "tournaments", label: "Novos torneios", description: "Receba alertas quando novos torneios forem anunciados.", icon: <Trophy className="h-4 w-4" /> },
  { id: "invitations", label: "Convites", description: "Seja notificado quando receber convites para partidas.", icon: <Users className="h-4 w-4" /> },
  { id: "ranking", label: "Alterações no ranking", description: "Saiba quando sua posição no ranking mudar.", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "achievements", label: "Conquistas", description: "Celebre ao desbloquear novas conquistas.", icon: <Award className="h-4 w-4" /> },
  { id: "friends", label: "Solicitações de amizade", description: "Receba notificações de novas solicitações.", icon: <UserPlus className="h-4 w-4" /> },
  { id: "results", label: "Resultados das partidas", description: "Acompanhe os resultados das suas partidas.", icon: <Target className="h-4 w-4" /> },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary-600 dark:bg-primary-500" : "bg-surface-border dark:bg-surface-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    tournaments: true,
    invitations: true,
    ranking: true,
    achievements: false,
    friends: true,
    results: true,
  });

  const toggle = (id: string) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Configure suas preferências de notificação</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between rounded-lg border border-surface-border p-4 dark:border-surface-border"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-text-muted dark:bg-surface-muted">
                  {option.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-text dark:text-text">{option.label}</p>
                  <p className="text-xs text-text-muted dark:text-text-muted">{option.description}</p>
                </div>
              </div>
              <Toggle checked={preferences[option.id] ?? false} onChange={() => toggle(option.id)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
